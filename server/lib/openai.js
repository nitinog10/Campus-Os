```
import dotenv from 'dotenv';
import OpenAI from "openai";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey || apiKey === "sk-your-key-here") {
    console.warn("⚠️  OPENAI_API_KEY not set in server/.env — API calls will fail");
}

export const openai = new OpenAI({
    apiKey: apiKey || "sk-placeholder-set-your-key",
});
```