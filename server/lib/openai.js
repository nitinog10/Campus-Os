import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-your-key-here") {
    console.warn("⚠️  OPENAI_API_KEY not set in server/.env — API calls will fail");
}

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "sk-placeholder-set-your-key",
});
