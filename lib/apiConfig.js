// lib/apiConfig.js
// Single source of truth for all backend API configuration.
// Set NEXT_PUBLIC_API_URL in .env.local (dev) or Vercel env vars (production).

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://wecare-q02v.onrender.com";

export const API_V1 = `${API_BASE_URL}/api/v1`;
