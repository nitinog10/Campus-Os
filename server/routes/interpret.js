import { Router } from "express";
import { openai } from "../lib/openai.js";

export const interpretRouter = Router();

interpretRouter.post("/interpret-intent", async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ message: "prompt is required" });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.3,
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `You are a CampusOS intent interpreter for college students. Analyze the user's natural language request and extract structured intent.

Return JSON with exactly these fields:
{
  "type": "event_promotion" | "website" | "presentation",
  "title": "short catchy title for the creation",
  "description": "1-2 sentence summary of what to create",
  "audience": "who this is for (e.g. college students, faculty, tech enthusiasts)",
  "tone": "formal" | "casual" | "energetic" | "professional" | "creative",
  "elements": ["list", "of", "required", "elements/sections"]
}

Guidelines:
- "event_promotion" = posters, flyers, social media posts for events, fests, hackathons, clubs
- "website" = landing pages, portfolio sites, club websites, project showcases
- "presentation" = slide decks, pitch decks, project presentations, reports
- elements should list 3-8 specific things needed (e.g. "hero headline", "event date", "registration CTA", "speaker lineup")
- Keep title concise and engaging`,
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No response from OpenAI");
        }

        const intent = JSON.parse(content);
        intent.rawPrompt = prompt;
        res.json(intent);
    } catch (err) {
        console.error("interpret-intent error:", err);
        res.status(500).json({ message: err.message || "Failed to interpret intent" });
    }
});
