import mongoose from "mongoose";

const DEFAULT_DB_NAME = "chat-app";

const getMongoUri = () => {
  const rawUri = process.env.MONGODB_URI?.trim();

  if (!rawUri) {
    throw new Error("MONGODB_URI is missing from server/.env");
  }

  if (!rawUri.startsWith("mongodb://") && !rawUri.startsWith("mongodb+srv://")) {
    throw new Error("MONGODB_URI must start with mongodb:// or mongodb+srv://");
  }

  const queryIndex = rawUri.indexOf("?");
  const baseUri = queryIndex === -1 ? rawUri : rawUri.slice(0, queryIndex);
  const queryString = queryIndex === -1 ? "" : rawUri.slice(queryIndex);
  const lastSlashIndex = baseUri.lastIndexOf("/");
  const hasDatabaseName =
    lastSlashIndex > baseUri.indexOf("://") + 2 &&
    baseUri.slice(lastSlashIndex + 1).length > 0;

  if (hasDatabaseName) {
    return rawUri;
  }

  return `${baseUri.replace(/\/$/, "")}/${DEFAULT_DB_NAME}${queryString}`;
};

export const connectDB = async () => {
  try {
    const mongoUri = getMongoUri();
    mongoose.set("bufferCommands", false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`Database connected: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};
