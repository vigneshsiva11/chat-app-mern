import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userrouter from "./routes/userRoutes.js";
import messageRouter from "./routes/MessageRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import { Server } from "socket.io";

// create express app and sever

const app = express();

const server = http.createServer(app);

//initialize socket io with proper CORS

const socketOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

export const io = new Server(server, {
  cors: { 
    origin: socketOrigins,
    credentials: true,
  },
});

// store online users

export const userSocketMap = {}; // {userId: socketId}

// socket io connection
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("user connected with id:", userId);

  if (userId) userSocketMap[userId] = socket.id;

  //emit online users to all connected users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("user disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// middleware setup

app.use(express.json({ limit: "4mb" }));

// CORS configuration for production and development
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174", 
  process.env.FRONTEND_URL, // Your Vercel frontend URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
  }),
);

app.use("/api/status", (req, res) => res.send("Server is running"));
app.use("/api/auth", userrouter);
app.use("/api/messages", messageRouter);
app.use("/api/ai", aiRouter);

// connect to database
await connectDB();

const port = process.env.PORT || 5000;

// Start server (Railway will set NODE_ENV automatically)
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// export server for serverless platforms

export default server;
