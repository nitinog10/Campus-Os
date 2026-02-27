import { Router } from "express";
import { openai } from "../lib/openai.js";
import crypto from "crypto";

export const generateRouter = Router();

// ─── SHARED INSTRUCTIONS ─────────────────────────────────────

const IMAGE_INSTRUCTIONS = `
IMAGES — CRITICAL:
You MUST include real images from the web. Use these free image sources:
- Unsplash: https://images.unsplash.com/photo-{id}?w={width}&h={height}&fit=crop  
  Example IDs you can use (these are REAL working Unsplash photo IDs):
  - Technology: photo-1518770660439-4636190af475, photo-1531297484001-80022131f5a1, photo-1550751827-4bd374c3f58b, photo-1488590528505-98d2b5aba04b
  - Events/People: photo-1540575467063-178a50c2df87, photo-1475721027785-f74eccf877e2, photo-1505373877841-8d25f7d46678, photo-1528605248644-14dd04022da1
  - Education: photo-1523050854058-8df90110c9f1, photo-1427504494785-3a9ca7044f45, photo-1524178232363-1fb2b075b655, photo-1509062522246-3755977927d7
  - Business/Startup: photo-1553877522-43269d4ea984, photo-1559136555-9303baea8ebd, photo-1460925895917-afdab827c52f, photo-1519389950473-47ba0277781c
  - Creative/Art: photo-1513364776144-60967b0f800f, photo-1501854140801-50d01698950b, photo-1470071459604-3b5ec3a7fe05, photo-1441974231531-c6227db76b6e
  - Coding: photo-1461749280684-dccba630e2f6, photo-1498050108023-c5249f4df085, photo-1555066931-4365d14bab8c, photo-1517694712202-14dd9538aa97
- Picsum: https://picsum.photos/{width}/{height}?random={number}

ALWAYS use <img> tags with these URLs. Set width/height attributes and use object-fit: cover.
Include at least 2-4 images per page. Use images as:
- Hero backgrounds (with overlay)
- Section illustrations 
- Feature/card icons or thumbnails
- Speaker/team photos
`;

const ANIMATION_INSTRUCTIONS = `
ANIMATIONS — MANDATORY:
Include CSS @keyframes animations and transitions. Add at MINIMUM:
1. A fade-in-up animation for main content on load
2. Hover scale/glow effects on buttons and cards
3. A subtle floating/pulsing animation on decorative elements
4. Smooth transitions on all interactive elements (transition: all 0.3s ease)
5. If appropriate: gradient animation on backgrounds, shimmer effects, typing effects

CSS animation examples to include:
@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(168,85,247,0.3); } 50% { box-shadow: 0 0 40px rgba(168,85,247,0.6); } }
`;

// ─── Asset-type-specific prompts ─────────────────────────────

const POSTER_PROMPT = `You are a WORLD-CLASS graphic designer and frontend developer creating stunning event posters.

Generate a COMPLETE, SELF-CONTAINED HTML poster that looks like a REAL professional poster — not a simple webpage.

${IMAGE_INSTRUCTIONS}

LAYOUT:
- A4 aspect ratio (210mm × 297mm), centered on page
- Use a full-bleed background image or gradient
- Layer content OVER the background with semi-transparent overlays
- Clean visual hierarchy: Title → Subtitle → Details → CTA

DESIGN REQUIREMENTS:
- HERO IMAGE: Use a relevant Unsplash image as the poster background with a dark gradient overlay
- Bold, dramatic typography — use "Space Grotesk" or "Outfit" from Google Fonts for headings, "Inter" for body
- Neon glow effects on the title text (text-shadow with bright colors)
- Geometric decorative elements using CSS (circles, lines, dots)
- Dark theme with vibrant accent colors (neon cyan, electric purple, hot pink)
- Use box-shadows and border effects for depth

${ANIMATION_INSTRUCTIONS}

CONTENT (use REALISTIC content based on the prompt, NO placeholders):
- Large event title with glow effect
- Tagline / subtitle
- Date, time, venue with icons (use emoji)
- 3-4 key highlights or featured speakers with small images
- Registration CTA button with glow/pulse animation
- Organizer name and social handles at bottom
- QR code placeholder (styled div)

OUTPUT: Raw HTML only. No markdown code fences. Include ALL CSS in a <style> tag. Include Google Fonts via <link>. Must be 100% self-contained and visually STUNNING.`;

const LANDING_PAGE_PROMPT = `You are an ELITE frontend developer building a production-ready, premium landing page.

The output must look like a REAL deployed website — modern, polished, with images and animations.

${IMAGE_INSTRUCTIONS}

SECTIONS (each visually distinct, with smooth scroll and full-width layouts):

1. HERO SECTION:
   - Full-viewport height (100vh)
   - Background: Unsplash image with dark gradient overlay OR animated gradient background
   - Large bold headline with gradient text effect
   - Subtitle paragraph
   - Two CTA buttons (primary filled + secondary outline)
   - Decorative floating elements with animation
   - Responsive hero image or illustration on the right side

2. FEATURES/HIGHLIGHTS (3-4 cards):
   - Glassmorphism cards with backdrop-filter blur
   - Each card: icon/emoji, title, description
   - Hover effects: scale up, glow, lift
   - CSS Grid layout (responsive: 1 col mobile, 3 col desktop)

3. ABOUT / SHOWCASE:
   - Split layout: text on left, Unsplash image on right
   - Statistics or key numbers with large fonts
   - Subtle background pattern

4. GALLERY / TEAM / SCHEDULE:
   - If event: show a timeline with icons
   - If organization: show team member cards with Unsplash portrait photos
   - If product: show feature screenshots
   - Include Unsplash images for each item

5. TESTIMONIALS or SOCIAL PROOF:
   - Quote cards with profile images (use Unsplash portraits: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face)
   - Star ratings or logos
   - Glassmorphism card style

6. CTA / REGISTER:
   - Clear call to action
   - Large button with pulse/glow animation
   - Background gradient or image

7. FOOTER:
   - Dark background
   - Navigation links, social icons (use emoji or Unicode), copyright
   - Subtle separator line

DESIGN:
- Dark theme (bg: #0a0a0f) with vibrant accents (purple/blue/cyan)
- Google Fonts: "Inter" for body, "Space Grotesk" for headings
- Smooth scroll behavior (scroll-behavior: smooth)
- Responsive design with @media queries
- CSS custom properties for colors

${ANIMATION_INSTRUCTIONS}

Extra animations for landing pages:
- Scroll-triggered fade-in (use IntersectionObserver in a <script> tag)
- Parallax-like effect on hero background
- Counter/number animation for statistics
- Staggered animation on card grids

OUTPUT: Raw HTML only. No markdown fences. ALL CSS in <style>, ALL JS in <script>. Self-contained. Must look like a REAL production website with REAL images. The user prompt may say "add animations" or "add effects" — make sure you include ALL of the above.`;

const PRESENTATION_PROMPT = `You are an expert presentation designer creating professional, visually rich slide decks.

Generate a presentation with IMAGES on relevant slides.

STRUCTURE:
Return a JSON object with this schema:
{
  "title": "Presentation Title",
  "theme": {
    "primary": "#a855f7",
    "secondary": "#3b82f6", 
    "accent": "#06b6d4"
  },
  "slides": [
    {
      "type": "title",
      "title": "Main Title",
      "subtitle": "Subtitle text",
      "image": "https://images.unsplash.com/photo-RELEVANT_ID?w=1200&h=800&fit=crop"
    },
    {
      "type": "content",
      "title": "Slide Title",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "note": "Speaker note",
      "image": "https://images.unsplash.com/photo-RELEVANT_ID?w=600&h=400&fit=crop"
    },
    {
      "type": "image-focus",
      "title": "Visual Title",
      "caption": "Description of what the image shows",
      "image": "https://images.unsplash.com/photo-RELEVANT_ID?w=1200&h=800&fit=crop"
    },
    {
      "type": "two-column",
      "title": "Comparison",
      "left": { "heading": "Left", "items": ["Item 1", "Item 2"] },
      "right": { "heading": "Right", "items": ["Item 1", "Item 2"] }
    },
    {
      "type": "stats",
      "title": "Key Numbers",
      "stats": [
        { "value": "10K+", "label": "Users" },
        { "value": "95%", "label": "Satisfaction" },
        { "value": "50+", "label": "Features" }
      ]
    },
    {
      "type": "closing",
      "title": "Thank You",
      "subtitle": "Contact or CTA",
      "image": "https://images.unsplash.com/photo-RELEVANT_ID?w=1200&h=800&fit=crop"
    }
  ]
}

IMAGE RULES — CRITICAL:
- Include images on at LEAST 4 slides (title, 1-2 content slides, image-focus, closing)
- Use REAL Unsplash photo URLs. Pick IDs relevant to the topic:
  - Technology: photo-1518770660439-4636190af475, photo-1531297484001-80022131f5a1, photo-1550751827-4bd374c3f58b
  - Events: photo-1540575467063-178a50c2df87, photo-1475721027785-f74eccf877e2, photo-1505373877841-8d25f7d46678
  - Education: photo-1523050854058-8df90110c9f1, photo-1524178232363-1fb2b075b655, photo-1509062522246-3755977927d7
  - Business: photo-1553877522-43269d4ea984, photo-1559136555-9303baea8ebd, photo-1460925895917-afdab827c52f
  - Nature: photo-1501854140801-50d01698950b, photo-1470071459604-3b5ec3a7fe05, photo-1441974231531-c6227db76b6e
- Format: https://images.unsplash.com/{photo-id}?w={width}&h={height}&fit=crop

CONTENT RULES:
- Create 8-12 slides
- First slide: type "title"
- Include at least 1 "image-focus" slide  
- Include at least 1 "stats" slide
- Last slide: type "closing"
- Content must be SPECIFIC and SUBSTANTIVE — NO lorem ipsum
- Each content slide: 3-5 bullet points max
- Make it presentation-ready for a real audience

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
  "elements": ["element1", "element2", ...],
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

The "keywords" field should contain 3-5 words describing the visual theme for finding relevant images (e.g., "technology", "coding", "campus", "hackathon").

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
Visual theme keywords: ${(intent.keywords || []).join(", ")}
Required elements: ${intent.elements.join(", ")}
Original prompt: ${prompt}

IMPORTANT: Include at least 1 Unsplash background image and CSS animations. Make it look STUNNING and REAL.`,
                { maxTokens: 8000 }
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
Visual theme keywords: ${(intent.keywords || []).join(", ")}
Sections needed: ${intent.elements.join(", ")}
Original prompt: ${prompt}

CRITICAL REQUIREMENTS from user:
- MUST include real images from Unsplash
- MUST include CSS animations and hover effects
- MUST look like a REAL production website
- If the user asked for animations/effects, go ALL OUT with CSS animations
- Make it visually STUNNING — this is for a global hackathon`,
                { maxTokens: 10000 }
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
Visual theme keywords: ${(intent.keywords || []).join(", ")}
Topics to cover: ${intent.elements.join(", ")}
Original prompt: ${prompt}

CRITICAL: Include Unsplash image URLs on at least 4 slides. Use image IDs relevant to the topic keywords: ${(intent.keywords || []).join(", ")}`,
                { maxTokens: 8000, json: true }
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
