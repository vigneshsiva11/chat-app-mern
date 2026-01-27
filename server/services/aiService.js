import { GoogleGenerativeAI } from "@google/generative-ai";

let aiCircuitBreaker = 0; // Timestamp until AI calls are suspended globally
let quotaStatusZero = false; // Flag for accounts with effectively zero quota

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.error(
      "❌ GEMINI_API_KEY is missing in server environment variables!",
    );
    throw new Error("AI Service configuration error: Missing API Key");
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

// Target model (can be overridden in .env if 1.5-flash has 0 quota)
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";

/**
 * Helper function to handle 429 Rate Limit errors with robust retry
 * priority: 'high' (User initiated: Summarize/Translate), 'low' (Background: Moderation/Replies)
 */
const generateWithRetry = async (model, prompt, priority = "high") => {
  // If the account is known to have 0 quota, don't even try
  if (quotaStatusZero) {
    throw new Error(
      "ACCOUNT_RESTRICTED: Your Google account has 0 quota for this region. Please try a different API project or region.",
    );
  }

  // If circuit breaker is active, skip low priority tasks to save quota for high priority ones
  if (Date.now() < aiCircuitBreaker && priority === "low") {
    console.warn(
      "🛡️ AI Circuit Breaker active: Skipping background AI request to save quota.",
    );
    throw new Error("AI_SUSPENDED: Temporary suspension due to rate limits.");
  }

  let delay = priority === "high" ? 8000 : 3000;
  const maxRetries = priority === "high" ? 5 : 1; // High priority gets more retries

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      const errString = (
        error.toString() + (error.message || "")
      ).toLowerCase();

      // Critical Quota 0 check - happens if the API key is restricted or region is unsupported
      if (
        errString.includes("quota_limit_value") &&
        errString.includes('"0"')
      ) {
        quotaStatusZero = true;
        console.error(
          "❌ CRITICAL: Google has set your AI quota to ZERO. This key is restricted.",
        );
        throw new Error("ACCOUNT_RESTRICTED");
      }

      // Rate Limit checks
      if (
        errString.includes("429") ||
        errString.includes("too many requests") ||
        errString.includes("quota exceeded")
      ) {
        aiCircuitBreaker = Date.now() + 65000; // Suspend background tasks for 65 seconds

        if (i < maxRetries - 1) {
          console.warn(
            `⚠️ API Rate limit hit (Attempt ${i + 1}/${maxRetries}). Waiting ${delay / 1000}s to reset...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay += 5000;
        } else {
          throw new Error("API_QUOTA_EXCEEDED");
        }
      } else {
        console.error("❌ Non-retriable AI Error:", error);
        throw error;
      }
    }
  }
  throw new Error("API_QUOTA_EXCEEDED");
};

/**
 * AI Service using Google Gemini API
 */
export const aiService = {
  /**
   * Summarize a conversation into bullet points
   */
  async summarizeConversation(conversationText) {
    try {
      console.log("🤖 Generating summary (High Priority)...");
      const model = getGenAI().getGenerativeModel({ model: MODEL_NAME });

      const prompt = `You are a professional meeting summarizer. Analyze the following conversation and provide:
1. A concise summary in 3-5 bullet points
2. Important decisions
3. Action items
4. Key participants

Format ONLY as clean JSON:
{
  "bulletPoints": ["point 1", ...],
  "keyDecisions": ["decision 1", ...],
  "actionItems": ["item 1", ...],
  "participants": ["name 1", ...]
}

Conversation:
${conversationText}`;

      const result = await generateWithRetry(model, prompt, "high");
      const response = result.response.text();
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (jsonMatch) return JSON.parse(jsonMatch[0]);

      return {
        bulletPoints: [response.substring(0, 500)],
        keyDecisions: [],
        actionItems: [],
        participants: [],
      };
    } catch (error) {
      console.error("❌ Summarization error:", error.message);
      throw new Error(`Summarization failed: ${error.message}`);
    }
  },

  /**
   * Generate smart reply suggestions
   */
  async generateSmartReplies(messageText, conversationContext = "") {
    try {
      const model = getGenAI().getGenerativeModel({ model: MODEL_NAME });
      const prompt = `Generate 3 short reply suggestions for: "${messageText}". 
Recent context: ${conversationContext.substring(0, 200)}
Respond ONLY with JSON array of strings: ["reply 1", "reply 2", "reply 3"]`;

      const result = await generateWithRetry(model, prompt, "low");
      const response = result.response.text();
      const jsonMatch = response.match(/\[[\s\S]*\]/);

      if (jsonMatch) return JSON.parse(jsonMatch[0]).slice(0, 3);
      return ["Thanks!", "Got it", "OK"];
    } catch (error) {
      console.warn("Smart replies fallback active:", error.message);
      return ["Thanks!", "Sounds good", "OK"];
    }
  },

  /**
   * Moderate content for toxicity
   */
  async moderateContent(text) {
    try {
      // OPTIMIZATION: Skip AI for very short text (saves significant quota)
      if (!text || text.length < 15) {
        return { flagged: false, categories: {}, severity: "low" };
      }

      const model = getGenAI().getGenerativeModel({ model: MODEL_NAME });
      const prompt = `Analyze toxicity of this text. Respond ONLY with JSON:
{
  "flagged": bool,
  "categories": { "hate": bool, "violence": bool, "sexual": bool, "harassment": bool, "self_harm": bool, "spam": bool },
  "severity": "low/medium/high",
  "reason": "..."
}
Text: "${text}"`;

      const result = await generateWithRetry(model, prompt, "low");
      const response = result.response.text();
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return { flagged: false, categories: {}, severity: "low" };
    } catch (error) {
      console.warn(
        "Moderation fallback (allowed) due to service error:",
        error.message,
      );
      return {
        flagged: false,
        categories: {},
        severity: "low",
        error: error.message,
      };
    }
  },

  /**
   * Translate text to target language
   */
  async translateText(text, targetLanguage) {
    try {
      console.log(`🌐 Translating to ${targetLanguage} (High Priority)...`);
      const model = getGenAI().getGenerativeModel({ model: MODEL_NAME });
      const prompt = `Translate this to language code ${targetLanguage}: "${text}". Respond with ONLY the translated text.`;

      const result = await generateWithRetry(model, prompt, "high");
      return result.response.text().trim();
    } catch (error) {
      console.error("❌ Translation error:", error.message);
      throw new Error(`Translation failed: ${error.message}`);
    }
  },

  /**
   * Detect language
   */
  async detectLanguage(text) {
    try {
      const model = getGenAI().getGenerativeModel({ model: MODEL_NAME });
      const prompt = `Identify language of: "${text}". Respond ONLY with ISO 639-1 code.`;

      const result = await generateWithRetry(model, prompt, "low");
      return result.response.text().trim().toLowerCase().substring(0, 2);
    } catch (error) {
      return "en";
    }
  },
};
