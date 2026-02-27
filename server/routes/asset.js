import { Router } from "express";
import { openai } from "../lib/openai.js";

export const assetRouter = Router();

const contentTypeMap = {
    text: "text",
    design: "markdown",
    code: "html",
};

assetRouter.post("/generate-asset", async (req, res) => {
    try {
        const { step, intent } = req.body;
        if (!step || !intent) {
            return res.status(400).json({ message: "step and intent are required" });
        }

        const systemPrompts = {
            text: `You are a professional copywriter for college students. Generate high-quality content for: "${step.label}".

Context: Creating ${intent.type.replace("_", " ")} titled "${intent.title}" for ${intent.audience}.
Tone: ${intent.tone}.
Description: ${step.description}

Provide polished, ready-to-use text content. Be creative and engaging. Format with clear headings and sections.`,

            design: `You are a UI/UX designer for college branding. Generate design specifications for: "${step.label}".

Context: Designing ${intent.type.replace("_", " ")} titled "${intent.title}" for ${intent.audience}.
Tone: ${intent.tone}.
Description: ${step.description}

Provide a detailed design spec in Markdown with:
- Color palette (with hex codes)
- Typography choices
- Layout structure
- Visual hierarchy
- Spacing guidelines
Make it modern, vibrant, and appropriate for college students.`,

            code: `You are an expert frontend developer. Generate a complete, self-contained HTML page for: "${step.label}".

Context: Building ${intent.type.replace("_", " ")} titled "${intent.title}" for ${intent.audience}.
Tone: ${intent.tone}.
Description: ${step.description}

Requirements:
- Output ONLY the complete HTML (with inline CSS and embedded styles)
- Use modern design: gradients, rounded corners, shadows, clean typography
- Make it visually stunning and premium
- Use Google Fonts (Inter or similar)
- Ensure it's responsive
- Include all content inline — no external dependencies except Google Fonts
- Do NOT wrap in markdown code blocks — output raw HTML only`,
        };

        const systemPrompt = systemPrompts[step.stepType] || systemPrompts.text;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.7,
            max_tokens: 4000,
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `Generate the ${step.stepType} content for: ${step.label}\n\nRequired elements from intent: ${intent.elements?.join(", ") || "use your best judgment"}`,
                },
            ],
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No response from OpenAI");
        }

        // Clean up code output — remove markdown fences if present
        let cleanContent = content;
        if (step.stepType === "code") {
            cleanContent = content
                .replace(/^```html?\n?/i, "")
                .replace(/\n?```$/i, "")
                .trim();
        }

        const asset = {
            stepId: step.id,
            stepLabel: step.label,
            content: cleanContent,
            contentType: contentTypeMap[step.stepType] || "text",
            explanation: `Generated ${step.stepType} content for "${step.label}" using OpenAI GPT-4o-mini. Tailored for ${intent.audience} with a ${intent.tone} tone.`,
        };

        res.json(asset);
    } catch (err) {
        console.error("generate-asset error:", err);
        res.status(500).json({ message: err.message || "Failed to generate asset" });
    }
});
