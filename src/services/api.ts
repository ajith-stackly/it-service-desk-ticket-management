import axios from 'axios';

// In production (e.g. Vercel), set VITE_API_URL to your deployed JSON Server
// URL (e.g. a Render web service: https://your-app.onrender.com).
// Locally, it falls back to the JSON Server started with `npm run server`.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
