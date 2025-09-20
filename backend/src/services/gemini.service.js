// backend/src/services/gemini.service.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

let genAI = null;
if (env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
}

const MODEL = env.GEMINI_MODEL || "gemini-1.5-flash";

/**
 * Generate a quick, concise answer from Gemini.
 * Simple, prompt-only for speed (no long history stitching).
 */
export async function geminiReply(userText) {
  if (!genAI) throw new Error("Missing GEMINI_API_KEY");

  // keep it quick: flash model, brief instruction
  const model = genAI.getGenerativeModel({ model: MODEL });
  const result = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: `Answer concisely:\n\n${userText}` }] },
    ],
  });

  // SDK returns a Response object with .text()
  const text = result?.response?.text?.() ?? "";
  return (text || "").trim();
}
