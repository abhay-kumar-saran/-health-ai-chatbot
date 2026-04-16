import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";
import path from "path";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Groq client
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ✅ FIX 1: health route (important for Render)
app.get("/", (req, res) => {
  res.send("🔥 Health AI Chatbot is running");
});

// optional: if you still want frontend later
app.use(express.static(path.join(process.cwd(), "public")));

// chat route
app.post("/chat", async (req, res) => {
  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a friendly AI health assistant. Give safe, general medical guidance. Do not give dangerous medical advice.",
        },
        {
          role: "user",
          content: req.body.message,
        },
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (err) {
    console.log("ERROR 👉", err);

    res.status(500).json({
      reply: "⚠ Server error. Please try again later.",
    });
  }
});

// ✅ FIX 2: Render requires dynamic port
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Server running on port ${PORT}`);
});