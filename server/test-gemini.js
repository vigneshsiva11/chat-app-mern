import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const testGemini = async () => {
  const modelsToTry = [
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-pro-latest",
    "gemini-1.5-pro",
    "gemini-pro",
  ];

  console.log("\n🧪 Testing Gemini API...");
  console.log("API Key:", process.env.GEMINI_API_KEY?.substring(0, 10) + "...");

  for (const modelName of modelsToTry) {
    try {
      console.log(`\n📡 Trying model: ${modelName}`);
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(
        "Translate 'Hello' to Spanish. Respond with ONLY the translated text.",
      );
      const response = await result.response;
      const text = response.text();

      console.log(`\n✅ SUCCESS with ${modelName}!`);
      console.log("Response:", text);
      console.log(`\n📝 Update your .env file with: GEMINI_MODEL=${modelName}`);
      console.log("Then restart server with: node server.js");
      return;
    } catch (error) {
      console.error(`❌ Failed with ${modelName}: ${error.message}`);
    }
  }

  console.error(
    "\n❌ ALL MODELS FAILED! Your API key might be invalid or restricted.",
  );
  console.error(
    "🔧 Get a NEW key from: https://aistudio.google.com/app/apikey",
  );
  console.error("⚠️  Make sure to:");
  console.error("   1. Use a different Google account if possible");
  console.error("   2. Select 'Create API key in new project'");
  console.error("   3. Wait a few minutes after creating it");
};

testGemini();
