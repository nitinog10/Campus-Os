
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `You are a world-class senior frontend engineer. 
Your task is to generate functional, high-quality, and modern web pages based on user prompts.

GUIDELINES:
- Generate a SINGLE self-contained HTML document.
- Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>.
- Do NOT use React. Use standard HTML, CSS, and Vanilla JavaScript if interactivity is needed.
- Use clean, professional typography (Inter/Sans-serif).
- Use Lucide-inspired SVG icons (embed SVG code directly).
- The UI must be modern (Vercel/SaaS style), responsive, and accessible.
- Ensure the code includes a proper <!DOCTYPE html>, <html>, <head>, and <body> tag.
- Return the response in the specified JSON format.`;

export const generateWebPage = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            code: {
              type: Type.STRING,
              description: 'The full HTML code for the page.',
            },
            description: {
              type: Type.STRING,
              description: 'A brief description of the generated page.',
            },
          },
          required: ["code", "description"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate UI. Please check your prompt or API key.");
  }
};
