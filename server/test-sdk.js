import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function listModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("API Key:", apiKey?.substring(0, 10) + "...");
    console.log("\n📋 Fetching list of available models...\n");

    const genAI = new GoogleGenerativeAI(apiKey);

    // Try using the SDK to generate content first
    console.log("🧪 Testing with SDK...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    const text = response.text();

    console.log("✅ SUCCESS! SDK works!");
    console.log("Response:", text);
    console.log("\n🎉 Your API key is working! Use model: gemini-pro");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("\nFull error:", error);

    if (error.message?.includes("API key not valid")) {
      console.log("\n🔧 Your API key is invalid");
    } else if (error.message?.includes("404")) {
      console.log(
        "\n🔧 The Generative Language API is NOT enabled for your project",
      );
      console.log(
        "Even though you created the API key, the API itself needs to be enabled",
      );
      console.log("\nSTEPS:");
      console.log("1. Go to: https://console.cloud.google.com/");
      console.log("2. Select your project");
      console.log("3. Enable 2-Step Verification if prompted");
      console.log("4. Go to: APIs & Services → Library");
      console.log("5. Search for: Generative Language API");
      console.log("6. Click ENABLE");
      console.log("7. Wait 2 minutes and try again");
    }
  }
}

listModels();
