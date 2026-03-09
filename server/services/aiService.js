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

  console.log(
    "🔑 Using GEMINI_API_KEY:",
    process.env.GEMINI_API_KEY.substring(0, 10) + "...",
  );
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

// Target models (can be overridden in .env). We keep a safe fallback list.
const PRIMARY_MODEL = process.env.GEMINI_MODEL;
const DEFAULT_MODEL_CANDIDATES = [
  PRIMARY_MODEL,
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-pro",
].filter(Boolean);

const uniqueModels = (models) => {
  const seen = new Set();
  return models.filter((modelName) => {
    if (seen.has(modelName)) return false;
    seen.add(modelName);
    return true;
  });
};

const getModelCandidates = (overrides = []) =>
  uniqueModels([...(overrides || []), ...DEFAULT_MODEL_CANDIDATES]);

const extractErrorMessage = (error) => {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  return (
    error?.response?.data?.error?.message ||
    error?.error?.message ||
    error?.message ||
    error.toString()
  );
};

const isModelIssue = (error) => {
  const msg = extractErrorMessage(error).toLowerCase();
  const status = error?.status || error?.response?.status;

  return (
    status === 404 ||
    (msg.includes("model") &&
      (msg.includes("not found") ||
        msg.includes("does not exist") ||
        msg.includes("not supported") ||
        msg.includes("invalid") ||
        msg.includes("permission") ||
        msg.includes("denied")))
  );
};

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
      const errString = extractErrorMessage(error).toLowerCase();

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

const generateWithModelFallback = async (
  prompt,
  priority = "high",
  modelCandidates = [],
) => {
  const modelsToTry = getModelCandidates(modelCandidates);

  if (modelsToTry.length === 0) {
    throw new Error("AI Service configuration error: Missing model list");
  }

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = getGenAI().getGenerativeModel({ model: modelName });
      return await generateWithRetry(model, prompt, priority);
    } catch (error) {
      lastError = error;

      if (isModelIssue(error)) {
        console.warn(
          `⚠️ Model issue with ${modelName}. Trying next candidate...`,
        );
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error("AI request failed with all models");
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

      const result = await generateWithModelFallback(prompt, "high");
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
      const message = extractErrorMessage(error);
      console.error("Summarization error:", message);
      throw new Error(`Summarization failed: ${message}`);
    }
  },

  /**
   * Generate smart reply suggestions
   */
  async generateSmartReplies(messageText, conversationContext = "") {
    try {
      const prompt = `Generate 3 short reply suggestions for: "${messageText}". 
Recent context: ${conversationContext.substring(0, 200)}
Respond ONLY with JSON array of strings: ["reply 1", "reply 2", "reply 3"]`;

      const result = await generateWithModelFallback(prompt, "low");
      const response = result.response.text();
      const jsonMatch = response.match(/\[[\s\S]*\]/);

      if (jsonMatch) return JSON.parse(jsonMatch[0]).slice(0, 3);
      return ["Thanks!", "Got it", "OK"];
    } catch (error) {
      console.warn("Smart replies fallback active:", extractErrorMessage(error));
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

      const prompt = `Analyze toxicity of this text. Respond ONLY with JSON:
{
  "flagged": bool,
  "categories": { "hate": bool, "violence": bool, "sexual": bool, "harassment": bool, "self_harm": bool, "spam": bool },
  "severity": "low/medium/high",
  "reason": "..."
}
Text: "${text}"`;

      const result = await generateWithModelFallback(prompt, "low");
      const response = result.response.text();
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return { flagged: false, categories: {}, severity: "low" };
    } catch (error) {
      console.warn(
        "Moderation fallback (allowed) due to service error:",
        extractErrorMessage(error),
      );
      return {
        flagged: false,
        categories: {},
        severity: "low",
        error: extractErrorMessage(error),
      };
    }
  },

  /**
   * Translate text to target language
   */
  async translateText(text, targetLanguage) {
    try {
      console.log(`🌐 Translating to ${targetLanguage} (High Priority)...`);
      const prompt = `Translate this to language code ${targetLanguage}: "${text}". Respond with ONLY the translated text.`;

      const result = await generateWithModelFallback(prompt, "high");
      const translatedText = result.response.text().trim();
      console.log(
        `✅ Translation successful: "${text}" -> "${translatedText}"`,
      );
      return translatedText;
    } catch (error) {
      const message = extractErrorMessage(error);
      console.error("Translation error:", message);

      // Check for specific API errors
      if (
        error?.status === 404 ||
        message.includes("404") ||
        message.toLowerCase().includes("not found")
      ) {
        throw new Error(
          "API_NOT_ENABLED: The Generative Language API is not enabled. Please enable it at: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com",
        );
      }
      if (error?.status === 403 || message.includes("403")) {
        throw new Error(
          "API_RESTRICTED: Your Gemini API key is restricted. Please check your API key permissions or generate a new one.",
        );
      }

      throw new Error(
        `Translation failed: ${message || "Unknown error"}`,
      );
    }
  },

  /**
   * Detect language
   */
  async detectLanguage(text) {
    try {
      const prompt = `Identify language of: "${text}". Respond ONLY with ISO 639-1 code.`;

      const result = await generateWithModelFallback(prompt, "low");
      return result.response.text().trim().toLowerCase().substring(0, 2);
    } catch (error) {
      return "en";
    }
  },

  /**
   * Transcribe audio to text using Gemini API
   * Uses multimodal capabilities of newer Gemini models
   */
  async transcribeAudio(audioData, mimeType = "audio/webm") {
    try {
      console.log("🎤 Audio transcription requested (High Priority)...");

      // Use gemini-1.5-flash which supports audio
      const audioModelCandidates = getModelCandidates([
        "gemini-1.5-flash",
        "gemini-1.5-pro",
      ]);

      // Extract base64 data without the data URL prefix
      let base64Audio = audioData;
      if (audioData.includes("base64,")) {
        base64Audio = audioData.split("base64,")[1];
      }

      // Prepare the audio data for Gemini
      const audioPart = {
        inlineData: {
          data: base64Audio,
          mimeType: mimeType,
        },
      };

      // Create prompt for transcription
      const prompt =
        "Please transcribe the audio content into text. Only return the spoken text, nothing else.";

      try {
        const result = await generateWithModelFallback(
          [prompt, audioPart],
          "high",
          audioModelCandidates,
        );
        const transcription = result.response.text().trim();

        if (transcription && transcription.length > 0) {
          console.log(
            "✅ Audio transcribed successfully:",
            transcription.substring(0, 50) + "...",
          );
          return transcription;
        } else {
          console.warn("⚠️ Empty transcription result");
          return "Could not transcribe audio. Please speak clearly and try again.";
        }
      } catch (apiError) {
        console.error("❌ Gemini API error:", apiError.message);

        // Check if it's a model not supporting audio
        if (
          extractErrorMessage(apiError).includes("does not support") ||
          extractErrorMessage(apiError).includes("multimodal")
        ) {
          console.warn(
            "⚠️ Current model doesn't support audio, falling back...",
          );
          return "Audio transcription is not supported with the current model. Please type your message manually.";
        }

        throw apiError;
      }
    } catch (error) {
      console.error("Audio transcription error:", extractErrorMessage(error));
      // Return a helpful fallback message instead of throwing error
      return "Audio transcription failed. Please try again or type your message manually.";
    }
  },
};
