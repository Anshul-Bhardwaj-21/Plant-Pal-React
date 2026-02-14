# Gemini proxy server

This small server proxies requests to the Google Gemini API using the server-side API key from your project's `.env`.

Quick start:

1. From the project root ensure your `.env` contains the Gemini key, e.g.

   GEMINI_API_KEY=your_real_key_here

   or the project already has `VITE_GEMINI_API_KEY` — the server will use that if `GEMINI_API_KEY` is not set.

2. Install deps and start the proxy:

```bash
cd server
npm install
npm start
```

3. Call the endpoint:

```bash
curl -X POST http://localhost:4317/api/generate -H "Content-Type: application/json" -d '{"prompt":"Explain how AI works in a few words"}'
```
