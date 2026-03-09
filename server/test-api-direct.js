import dotenv from "dotenv";
import https from "https";

dotenv.config();

const API_HOST = "generativelanguage.googleapis.com";
const API_VERSION = "v1beta";

const requestJson = (options, data) => {
  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        let parsed = null;
        try {
          parsed = responseData ? JSON.parse(responseData) : null;
        } catch (error) {
          parsed = responseData;
        }

        resolve({
          status: res.statusCode,
          data: parsed,
        });
      });
    });

    req.on("error", (error) => {
      resolve({ status: 0, data: { error: error.message } });
    });

    if (data) req.write(data);
    req.end();
  });
};

const listModels = async (apiKey) => {
  const options = {
    hostname: API_HOST,
    path: `/${API_VERSION}/models?key=${apiKey}`,
    method: "GET",
  };

  const result = await requestJson(options);

  if (result.status !== 200) {
    return {
      success: false,
      error: result.data?.error?.message || result.data,
      status: result.status,
    };
  }

  const models = result.data?.models || [];
  const usable = models.filter((model) =>
    (model.supportedGenerationMethods || []).includes("generateContent"),
  );

  return { success: true, models: usable };
};

const normalizeModelName = (name) => {
  if (!name) return name;
  return name.startsWith("models/") ? name.slice("models/".length) : name;
};

const testModel = async (apiKey, modelName) => {
  const normalized = normalizeModelName(modelName);
  const payload = JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: "Say 'Hello' in Spanish",
          },
        ],
      },
    ],
  });

  const options = {
    hostname: API_HOST,
    path: `/${API_VERSION}/models/${normalized}:generateContent?key=${apiKey}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": payload.length,
    },
  };

  const result = await requestJson(options, payload);

  if (result.status === 200) {
    return {
      success: true,
      model: normalized,
      response: result.data?.candidates?.[0]?.content?.parts?.[0]?.text,
    };
  }

  return {
    success: false,
    model: normalized,
    status: result.status,
    error: result.data?.error?.message || result.data,
  };
};

const testAllModels = async () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("GEMINI_API_KEY is missing in .env");
    return;
  }

  console.log("\nTesting Gemini API with multiple models...");
  console.log("API Key:", apiKey?.substring(0, 10) + "...");

  let modelsToTry = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
    "gemini-pro",
  ];

  const listResult = await listModels(apiKey);
  if (listResult.success) {
    modelsToTry = listResult.models.map((model) => model.name);
    console.log("\nAvailable models with generateContent:");
    for (const model of modelsToTry) {
      console.log("-", model);
    }
  } else {
    console.log("\nCould not list models:");
    console.log(listResult.error);
  }

  for (const model of modelsToTry) {
    console.log(`\nTesting model: ${model}`);
    const result = await testModel(apiKey, model);

    if (result.success) {
      console.log(`SUCCESS with ${result.model}!`);
      console.log("Response:", result.response);
      console.log("\nUPDATE YOUR .env FILE:");
      console.log(`GEMINI_MODEL=${result.model}`);
      return;
    }

    console.log(`Failed: ${result.error}`);
  }

  console.log("\nALL MODELS FAILED!");
  console.log(
    "Your API key likely doesn't have the Generative Language API enabled for this project.",
  );
  console.log(
    "Enable it at: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com",
  );
};

testAllModels();
