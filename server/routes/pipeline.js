import { Router } from "express";
import { openai } from "../lib/openai.js";
import crypto from "crypto";

export const pipelineRouter = Router();

pipelineRouter.post("/generate-pipeline", async (req, res) => {
    try {
        const { intent } = req.body;
        if (!intent) {
            return res.status(400).json({ message: "intent is required" });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.3,
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `You are a CampusOS pipeline planner. Given a parsed intent, create an execution pipeline of steps to generate the required digital assets.

Return JSON with exactly this structure:
{
  "steps": [
    {
      "label": "Human-readable step name",
      "description": "What this step does in 1 sentence",
      "stepType": "text" | "design" | "code",
      "order": 1
    }
  ]
}

Rules:
- Create 3-6 steps that logically build on each other
- stepType "text" = copywriting, headlines, descriptions
- stepType "design" = colour palettes, typography, layout suggestions
- stepType "code" = HTML/CSS output
- Order steps logically: content first, then design, then code
- For event_promotion: content → design specs → poster HTML
- For website: content → design system → page HTML/CSS
- For presentation: outline → slide content → slide HTML`,
                },
                {
                    role: "user",
                    content: JSON.stringify(intent),
                },
            ],
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No response from OpenAI");
        }

        const parsed = JSON.parse(content);
        const pipelineId = crypto.randomUUID();

        const pipeline = {
            id: pipelineId,
            intentId: intent.title,
            steps: parsed.steps.map((step, i) => ({
                id: `${pipelineId}-step-${i}`,
                label: step.label,
                description: step.description,
                stepType: step.stepType,
                status: "pending",
                dependencies: i > 0 ? [`${pipelineId}-step-${i - 1}`] : [],
                order: step.order || i + 1,
            })),
            createdAt: new Date().toISOString(),
        };

        res.json(pipeline);
    } catch (err) {
        console.error("generate-pipeline error:", err);
        res.status(500).json({ message: err.message || "Failed to generate pipeline" });
    }
});
