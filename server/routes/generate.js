import { Router } from "express";
import { openai } from "../lib/openai.js";
import crypto from "crypto";

export const generateRouter = Router();

// ─── Asset-type-specific prompts ─────────────────────────────

const POSTER_PROMPT = `You are an expert graphic designer and frontend developer specializing in event posters for college students.

Generate a COMPLETE, SELF-CONTAINED HTML poster with these requirements:

LAYOUT:
- A4 aspect ratio (210mm × 297mm proportions)
- Centered content with generous padding
- Clean visual hierarchy: Title → Subtitle → Details → CTA

DESIGN:
- Use a bold, modern design with gradients, large typography, and visual impact
- Dark background with vibrant accent colors
- Google Fonts: use "Inter" for body and "Space Grotesk" or "Outfit" for headings
- Add decorative elements (circles, lines, glows) using CSS
- Ensure it looks like a REAL event poster, not a webpage

CONTENT (fill in with realistic content based on the prompt):
- Large event title (prominent, eye-catching)
- Subtitle / tagline
- Date, time, and venue
- Key highlights or speakers (2-3 items)
- Registration CTA with a visible button
- Organizer / club name at bottom

OUTPUT: Raw HTML only. No markdown fences. Include ALL CSS inline in a <style> tag. Must be 100% self-contained.`;

const LANDING_PAGE_PROMPT = `You are an expert frontend developer building premium landing pages for college organizations.

Generate a COMPLETE, MULTI-SECTION landing page with these requirements:

SECTIONS (each must be a distinct visual block):
1. HERO — Full-width hero with gradient background, large headline, subtitle, and CTA button
2. FEATURES/HIGHLIGHTS — 3-4 feature cards with icons (use emoji or CSS shapes), title, and description
3. ABOUT/DETAILS — Descriptive section with key information
4. SCHEDULE/TIMELINE — If applicable, show dates or steps
5. CTA/REGISTER — Final call-to-action section with prominent button
6. FOOTER — Simple footer with copyright and links

DESIGN:
- Modern, premium look: dark theme, gradients, glassmorphism, rounded corners
- Responsive (use CSS Grid/Flexbox, media queries)
- Google Fonts: "Inter" for body, "Space Grotesk" for headings
- Smooth scroll behavior
- Subtle hover effects on interactive elements
- Each section should have a clear visual separation

OUTPUT: Raw HTML only. No markdown fences. ALL CSS in <style> tag. Self-contained. Must look like a REAL deployable website.`;

const PRESENTATION_PROMPT = `You are an expert presentation designer creating slide decks for college students.

Generate a COMPLETE presentation as a self-contained HTML file with these requirements:

STRUCTURE:
Return a JSON object (not HTML) with this exact schema:
{
  "title": "Presentation Title",
  "slides": [
    {
      "type": "title",
      "title": "Main Title",
      "subtitle": "Subtitle text"
    },
    {
      "type": "content",
      "title": "Slide Title",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "note": "Optional speaker note"
    },
    {
      "type": "two-column",
      "title": "Comparison",
      "left": { "heading": "Left Title", "items": ["Item 1", "Item 2"] },
      "right": { "heading": "Right Title", "items": ["Item 1", "Item 2"] }
    },
    {
      "type": "closing",
      "title": "Thank You",
      "subtitle": "Contact or CTA",
      "note": "Final message"
    }
  ]
}

CONTENT RULES:
- Create 6-10 slides
- First slide MUST be type "title"
- Last slide MUST be type "closing"  
- Middle slides: mix of "content" and "two-column"
- Each slide should have 3-5 bullet points max
- Content must be specific and substantive (NO lorem ipsum)
- Make it presentation-ready for a real college audience

OUTPUT: Valid JSON only. No markdown fences. No explanation text.`;

// ─── Helper: call OpenAI ─────────────────────────────────────

async function callOpenAI(systemPrompt, userPrompt, opts = {}) {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: opts.temperature || 0.7,
        max_tokens: opts.maxTokens || 8000,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No response from OpenAI");
    return content;
}

// ─── Helper: strip markdown code fences ──────────────────────

function stripFences(text) {
    return text
        .replace(/^```(?:html|json|css|js)?\s*\n?/i, "")
        .replace(/\n?\s*```\s*$/i, "")
        .trim();
}

// ─── Main consolidated endpoint ──────────────────────────────

generateRouter.post("/generate", async (req, res) => {
    try {
        const { prompt, assetType } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: "prompt is required" });
        }

        const type = assetType || "auto";

        // ── Step 1: Interpret intent ──────────────────────────
        console.log("🧠 Interpreting intent...");
        const intentRaw = await callOpenAI(
            `You are a CampusOS intent interpreter. Analyze the user's request and extract structured intent.

Return JSON:
{
  "type": "event_promotion" | "website" | "presentation",
  "title": "catchy title",
  "description": "1-2 sentence summary",
  "audience": "target audience",
  "tone": "formal" | "casual" | "energetic" | "professional" | "creative",
  "elements": ["element1", "element2", ...]
}

${type !== "auto" ? `IMPORTANT: The user explicitly wants type "${type === "poster" ? "event_promotion" : type === "landing" ? "website" : "presentation"}".` : ""}`,
            prompt,
            { temperature: 0.3, json: true }
        );

        const intent = JSON.parse(intentRaw);
        intent.rawPrompt = prompt;

        // Resolve the asset type
        let resolvedType = type;
        if (type === "auto") {
            resolvedType = intent.type === "event_promotion" ? "poster"
                : intent.type === "website" ? "landing"
                    : "presentation";
        }

        console.log(`📋 Intent: ${intent.title} (${resolvedType})`);

        // ── Step 2: Generate the primary asset ────────────────
        console.log("⚡ Generating asset...");
        const id = crypto.randomUUID();
        let asset;

        if (resolvedType === "poster") {
            const html = await callOpenAI(
                POSTER_PROMPT,
                `Create an event poster for: "${intent.title}"

Description: ${intent.description}
Audience: ${intent.audience}
Tone: ${intent.tone}
Required elements: ${intent.elements.join(", ")}
Original prompt: ${prompt}`,
                { maxTokens: 6000 }
            );

            asset = {
                id,
                type: "poster",
                title: intent.title,
                content: stripFences(html),
                contentType: "html",
                intent,
                viewUrl: `/view/poster/${id}`,
                createdAt: new Date().toISOString(),
            };
        } else if (resolvedType === "landing") {
            const html = await callOpenAI(
                LANDING_PAGE_PROMPT,
                `Create a landing page for: "${intent.title}"

Description: ${intent.description}
Audience: ${intent.audience}
Tone: ${intent.tone}
Sections needed: ${intent.elements.join(", ")}
Original prompt: ${prompt}`,
                { maxTokens: 8000 }
            );

            asset = {
                id,
                type: "landing",
                title: intent.title,
                content: stripFences(html),
                contentType: "html",
                intent,
                viewUrl: `/view/landing/${id}`,
                createdAt: new Date().toISOString(),
            };
        } else {
            // Presentation
            const slidesRaw = await callOpenAI(
                PRESENTATION_PROMPT,
                `Create a presentation for: "${intent.title}"

Description: ${intent.description}
Audience: ${intent.audience}
Tone: ${intent.tone}
Topics to cover: ${intent.elements.join(", ")}
Original prompt: ${prompt}`,
                { maxTokens: 6000, json: true }
            );

            let slides;
            try {
                slides = JSON.parse(stripFences(slidesRaw));
            } catch {
                slides = { title: intent.title, slides: [] };
            }

            asset = {
                id,
                type: "presentation",
                title: intent.title,
                content: slides,
                contentType: "json",
                intent,
                viewUrl: `/view/presentation/${id}`,
                createdAt: new Date().toISOString(),
            };
        }

        console.log(`✅ Asset generated: ${asset.type} — "${asset.title}"`);

        res.json(asset);
    } catch (err) {
        console.error("generate error:", err);
        res.status(500).json({ message: err.message || "Failed to generate asset" });
    }
});
