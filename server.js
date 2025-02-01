import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
app.use(cors());
const PORT = 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());

app.post("/summarize", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      console.error("Invalid content received");
      return res.status(400).send("Content is required for summarization");
    }

    console.log("Content being summarized:", content);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Summarize the following article. Focus on extracting the main ideas and key points. Ignore any HTML structure, layout, or other non-relevant information. Here's the article content:

      "${content}"
    `;

    const result = await model.generateContent(prompt);
    
    if (!result.response || !result.response.text) {
      throw new Error("Invalid response from AI model");
    }
    
    const text = result.response.text();

    console.log("Google Generative AI Response:", text);
    res.json({ summary: text });
  } catch (error) {
    console.error("Error in /summarize endpoint:", error.message);
    res.status(500).json({ error: "Failed to summarize content", details: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
