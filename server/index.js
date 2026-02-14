import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load root .env (project-level). Adjust path if you run from a different cwd.
dotenv.config({ path: '../.env' });

const PORT = process.env.PORT || 4317;
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('Gemini API key not found. Set GEMINI_API_KEY or VITE_GEMINI_API_KEY in .env');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok' }));

app.post('/api/generate', async (req, res) => {
  try {
    const { model = 'gemini-2.5-flash', prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'missing prompt in body' });

    const response = await ai.models.generateContent({ model, contents: prompt });

    // Try common text fields, otherwise return raw response
    const text = response?.text ?? response?.output?.[0]?.content?.[0]?.text ?? null;
    return res.json({ text, raw: response });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

app.listen(PORT, () => console.log(`Gemini proxy listening on http://localhost:${PORT}`));
