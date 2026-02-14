import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function runExample() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });

  console.log(response.text);
}

runExample();
