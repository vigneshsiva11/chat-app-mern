import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const testGeminiAPI = async () => {
  try {
    console.log("Testing Gemini API...");
    console.log("API Key exists:", !!process.env.GEMINI_API_KEY);
    console.log(
      "API Key starts with:",
      process.env.GEMINI_API_KEY?.substring(0, 10),
    );

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt =
      "Translate 'Hello' to French. Respond with only the translated text.";

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log("✅ Translation test successful:", text);
  } catch (error) {
    console.error("❌ Translation test failed:", error.message);
    console.error("Full error:", error);
  }
};

testGeminiAPI();
