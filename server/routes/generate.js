import { Router } from "express";
import { openai } from "../lib/openai.js";
import crypto from "crypto";

export const generateRouter = Router();

// ─── Model config ────────────────────────────────────────────
const MODEL = process.env.OPENAI_MODEL || "gpt-4o";

// ─── SHARED INSTRUCTIONS ─────────────────────────────────────

const IMAGE_INSTRUCTIONS = `
IMAGES — ABSOLUTELY CRITICAL (this makes or breaks quality):
You MUST include REAL high-quality images. Use these strategies:

1. PRIMARY — Unsplash Source (ALWAYS WORKS, no API key needed):
   https://images.unsplash.com/photo-{REAL_ID}?w={width}&h={height}&fit=crop&q=80
   
   VERIFIED WORKING photo IDs by category:
   Technology:
     photo-1518770660439-4636190af475
     photo-1531297484001-80022131f5a1
     photo-1550751827-4bd374c3f58b
     photo-1488590528505-98d2b5aba04b
     photo-1526374965328-7f61d4dc18c5
     photo-1504384764586-bb4cdc1707b0
     photo-1581091226825-a6a2a5aee158
   Events/People/Campus:
     photo-1540575467063-178a50c2df87
     photo-1475721027785-f74eccf877e2
     photo-1505373877841-8d25f7d46678
     photo-1528605248644-14dd04022da1
     photo-1523580494863-6f3031224c94
     photo-1529070538774-1935b8cc770e
     photo-1517457373958-b7bdd4587205
     photo-1492684223066-81342ee5ff30
   Education/Campus:
     photo-1523050854058-8df90110c9f1
     photo-1524178232363-1fb2b075b655
     photo-1509062522246-3755977927d7
     photo-1562774053-701939374585
     photo-1541339907198-e08756dedf3f
   Business/Startup:
     photo-1553877522-43269d4ea984
     photo-1559136555-9303baea8ebd
     photo-1460925895917-afdab827c52f
     photo-1519389950473-47ba0277781c
     photo-1556761175-5973dc0f32e7
   Creative/Design:
     photo-1513364776144-60967b0f800f
     photo-1501854140801-50d01698950b
     photo-1470071459604-3b5ec3a7fe05
     photo-1441974231531-c6227db76b6e
     photo-1558618666-fcd25c85f82e
   People/Portraits (for team/testimonials):
     photo-1507003211169-0a1dd7228f2d
     photo-1494790108377-be9c29b29330
     photo-1472099645785-5658abf4ff4e
     photo-1438761681033-6461ffad8d80
     photo-1500648767791-00dcc994a43e
     photo-1534528741775-53994a69daeb
     photo-1506794778202-cad84cf45f1d

2. FALLBACK — Picsum (random high-quality photos):
   https://picsum.photos/{width}/{height}?random={unique_number}

RULES:
- Use <img> with explicit width/height, style="object-fit:cover; width:100%; height:100%;"
- For hero/backgrounds: use as CSS background-image with overlay, OR an <img> with position:absolute + gradient overlay div on top
- Include AT LEAST 4-6 images per poster, 8-12 per landing page
- Each image must serve a purpose: hero, section illustration, card thumbnail, team photo, etc.
- Add loading="lazy" to below-fold images
- NEVER use placeholder.com, placehold.it, or via.placeholder — these show ugly gray boxes
- NEVER leave an image src empty or use # as src
`;

const ANIMATION_INSTRUCTIONS = `
ANIMATIONS — MANDATORY (this is what makes it feel alive):

Include ALL of these CSS animations:

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(168,85,247,0.3); }
  50% { box-shadow: 0 0 60px rgba(168,85,247,0.6), 0 0 100px rgba(59,130,246,0.3); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-100px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(100px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes rotateIn {
  from { opacity: 0; transform: rotate(-10deg) scale(0.9); }
  to { opacity: 1; transform: rotate(0) scale(1); }
}
@keyframes countUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes borderGlow {
  0%, 100% { border-color: rgba(168,85,247,0.3); }
  50% { border-color: rgba(168,85,247,0.8); }
}

APPLICATION RULES:
- Hero section: fadeInUp with 0.6s delay for title, 0.8s for subtitle, 1s for buttons
- Cards: staggered fadeInUp (each card +0.1s delay)
- Buttons: hover scale(1.05) + glow animation, active scale(0.98)
- Images: scaleIn on scroll into view
- Background gradients: gradientShift with background-size: 200% 200%
- Decorative blobs/circles: float animation with different durations (3-6s)
- Stats numbers: countUp animation on visible
- All interactive elements: transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)

SCROLL ANIMATIONS (include this JS):
<script>
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
</script>

CSS for scroll animations:
.animate-on-scroll { opacity: 0; transform: translateY(30px); transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1); }
.animate-on-scroll.animate-visible { opacity: 1; transform: translateY(0); }
.animate-on-scroll:nth-child(2) { transition-delay: 0.1s; }
.animate-on-scroll:nth-child(3) { transition-delay: 0.2s; }
.animate-on-scroll:nth-child(4) { transition-delay: 0.3s; }
`;

// ─── Asset-type-specific prompts ─────────────────────────────

const POSTER_PROMPT = `You are a WORLD-CLASS graphic designer who creates award-winning event posters. Think Behance/Dribbble featured quality.

Generate a COMPLETE, SELF-CONTAINED HTML document that renders as a visually BREATHTAKING poster.

${IMAGE_INSTRUCTIONS}

HTML STRUCTURE:
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>/* ALL CSS HERE */</style>
</head>
<body><!-- POSTER CONTENT --></body>
</html>

DESIGN SPECIFICATIONS:

1. PAGE SETUP:
   - body: margin 0, overflow hidden, background #000
   - Poster container: width 100vw, height 100vh, position relative, overflow hidden
   - Everything must fit within the viewport — NO scrolling

2. BACKGROUND LAYERS (stack these):
   Layer 1: Full-bleed Unsplash image (position absolute, object-fit cover, 100% width/height)
   Layer 2: Dark gradient overlay (linear-gradient with rgba(0,0,0,0.6) to rgba(0,0,0,0.85))
   Layer 3: Subtle noise/grain texture (use CSS: background-image with repeating pattern or pseudo-element)
   Layer 4: Decorative color gradient blobs (2-3 absolutley positioned radial-gradients with blur, 30-40% opacity)

3. TYPOGRAPHY:
   - Main title: Outfit or Space Grotesk, 800 weight, 4-6rem, UPPERCASE or mixed
   - Title effects: text-shadow with 3 layers (glow: 0 0 40px color, 0 0 80px color, 0 0 120px color)
   - Subtitle: Inter 300-400 weight, 1.2-1.5rem, letter-spacing 0.1em
   - Body: Inter 400, 0.85-1rem
   - Use gradient text (background-clip: text) on at least one heading

4. LAYOUT:
   - Flexbox or Grid based, centered content
   - Visual hierarchy: Big title at top/center → tagline → key details → highlights → CTA → footer info
   - Generous whitespace (don't cram everything)
   - Use CSS Grid for feature/highlight cards in a neat row

5. VISUAL ELEMENTS:
   - Glassmorphism cards for highlights (backdrop-filter: blur(20px), bg rgba(255,255,255,0.05), border 1px solid rgba(255,255,255,0.1))
   - Neon accent lines (1-2px width, bright colors, with box-shadow glow)
   - Floating decorative circles/dots using CSS (position absolute, border-radius 50%, with float animation)
   - At least 2 small thumbnail images (speakers/features) inside glass cards
   - Subtle scanline or halftone pattern overlay (use repeating-linear-gradient)

6. COLOR PALETTE:
   - Base: #0a0a0f (near black)
   - Primary accent: Choose based on event theme (neon purple #a855f7, electric cyan #06b6d4, hot pink #ec4899, neon green #22c55e)
   - Secondary accent: Complementary color
   - Text: #ffffff for headings, #94a3b8 for body, accent color for highlights

7. MANDATORY CONTENT SECTIONS:
   - Event title (huge, glowing)
   - Tagline (1 line, punchy)
   - Date & Time with 📅 icon
   - Venue with 📍 icon
   - 3-4 highlight cards (speakers/activities/features) each with a small image
   - "Register Now" CTA button with glow + pulse animation
   - Organizer info at the bottom
   - Small decorative elements (dots, lines, circles)

${ANIMATION_INSTRUCTIONS}

POSTER-SPECIFIC ANIMATIONS:
- Title: fadeInDown + text glow pulse
- Subtitle: fadeInUp with 0.3s delay
- Cards: staggered scaleIn (0.1s delay between each)
- CTA button: pulse + glow (infinite)
- Decorative elements: float (different speeds per element)
- Background gradient blobs: slow gradientShift

QUALITY STANDARD:
This poster must look like it was designed by a professional agency. When someone opens it, they should think "wow, this is real" not "this looks auto-generated". Every pixel matters.

OUTPUT: Raw HTML only. No markdown fences. No explanation. Just the HTML document.`;

const LANDING_PAGE_PROMPT = `You are a senior frontend engineer at Vercel/Linear/Stripe building a production landing page. The output must be INDISTINGUISHABLE from a real deployed website.

${IMAGE_INSTRUCTIONS}

HTML STRUCTURE:
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PAGE_TITLE</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>/* ALL CSS */</style>
</head>
<body>
  <!-- NAVBAR -->
  <!-- HERO -->
  <!-- FEATURES -->
  <!-- ABOUT/SHOWCASE -->
  <!-- GALLERY/TIMELINE -->
  <!-- TESTIMONIALS -->
  <!-- STATS -->
  <!-- CTA -->
  <!-- FOOTER -->
  <script>/* SCROLL ANIMATIONS + INTERACTIVITY */</script>
</body>
</html>

DESIGN SYSTEM (use CSS custom properties):
:root {
  --bg-primary: #06060a;
  --bg-secondary: #0a0a12;
  --bg-card: rgba(255,255,255,0.03);
  --border-subtle: rgba(255,255,255,0.06);
  --border-hover: rgba(255,255,255,0.12);
  --text-primary: #f0f0f5;
  --text-secondary: #8a8a9a;
  --text-tertiary: #5a5a6a;
  --accent-purple: #a855f7;
  --accent-blue: #3b82f6;
  --accent-cyan: #06b6d4;
  --gradient-primary: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
  --glass-bg: rgba(255,255,255,0.03);
  --glass-border: rgba(255,255,255,0.08);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
}

GLOBAL STYLES:
* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { font-family: 'Inter', -apple-system, sans-serif; background: var(--bg-primary); color: var(--text-primary); overflow-x: hidden; line-height: 1.6; }

SECTIONS (implement ALL of these — each one is mandatory):

1. STICKY NAVBAR:
   - Fixed top, backdrop-filter: blur(20px), bg rgba(6,6,10,0.8)
   - Left: logo/brand name (gradient text)
   - Right: 3-4 nav links + CTA button
   - Border-bottom: 1px solid var(--border-subtle)
   - Shrink slightly on scroll (add class via JS)
   - Mobile: hamburger menu

2. HERO (100vh):
   - Full viewport height, position relative
   - Background: Unsplash image (absolute, cover) + dark overlay + gradient mesh
   - OR: Pure gradient with animated gradient-shift mesh dots/grid
   - Content centered or split (text left, image right)
   - Title: 3.5-5rem, font-weight 800, Space Grotesk, gradient text or white
   - Subtitle: 1.1-1.3rem, max-width 600px, text-secondary color, Inter 400
   - Two buttons: Primary (gradient bg, rounded-full, px-8 py-3) + Secondary (outline, glass)
   - Decorative: 2-3 gradient blur orbs (position absolute, 200-400px, border-radius 50%, filter blur(100px), opacity 0.15-0.3)
   - Badge above title: small pill "✨ New · Just Launched" style
   - fadeInUp animation staggered: badge 0.2s, title 0.4s, subtitle 0.6s, buttons 0.8s

3. SOCIAL PROOF / LOGOS BAR:
   - Light separator section
   - "Trusted by" or "Featured in" text
   - Row of partner/sponsor names (styled as faded text logos if real logos unavailable)
   - Subtle marquee or static row

4. FEATURES (3-4 cards in a grid):
   - Section title: centered, gradient text, Space Grotesk
   - Section subtitle: text-secondary, max-width 500px
   - Cards: CSS Grid (auto-fit, minmax(280px, 1fr))
   - Each card: glass background, border var(--glass-border), border-radius var(--radius-lg)
   - Card content: Large emoji or icon (2rem), title (1.1rem 600), description (0.9rem text-secondary)
   - Hover: transform translateY(-4px), border-color var(--border-hover), box-shadow 0 20px 40px rgba(0,0,0,0.3)
   - Each card has an Unsplash thumbnail image at top (height 180px, object-fit cover, rounded top)
   - animate-on-scroll class for scroll reveal

5. SHOWCASE / ABOUT (split layout):
   - Two columns: text (55%) + image (45%)
   - Large Unsplash image with rounded corners and subtle shadow
   - Text side: heading, paragraph, bullet points with check icons
   - Alternating layout (text-left/image-right, then image-left/text-right)
   - Include at least 3-4 stats in a row: "500+" students, "4.9" rating, etc.

6. TIMELINE / SCHEDULE (if event) or GALLERY:
   - Vertical timeline with alternating left/right cards
   - OR image gallery grid with hover overlay
   - Each timeline item: time, title, description, small image
   - Connected by a vertical line with dots
   - animate-on-scroll for each item

7. TESTIMONIALS (minimum 3):
   - Glass cards with quote text
   - Each: Unsplash portrait (48px circle), name, role, quote, star rating (★★★★★ using Unicode)
   - Grid or horizontal scroll
   - Subtle "" quote marks as large decorative elements

8. STATS SECTION:
   - 3-4 large numbers with labels
   - Gradient text for numbers
   - Counter animation (JS: count from 0 to target on scroll)
   - Background: subtle gradient or pattern

9. FINAL CTA:
   - Full width, gradient background or dark with gradient border
   - Large heading, subtitle, prominent button
   - Button: gradient bg, large, glow animation on hover
   - Floating decorative elements

10. FOOTER:
    - Dark bg (#050508)
    - 4-column grid: Brand + description, Quick Links, Resources, Contact
    - Social links row (use Unicode/emoji: 𝕏 📸 💼 🔗)
    - Bottom bar: copyright + legal links
    - Separator: gradient line

RESPONSIVE (mandatory):
@media (max-width: 768px) — Stack columns, reduce font sizes, hide decorative elements, single column cards
@media (max-width: 480px) — Further reduce, full-width buttons

${ANIMATION_INSTRUCTIONS}

ADDITIONAL JS (include in <script>):
1. IntersectionObserver for scroll animations (animate-on-scroll class)
2. Navbar scroll effect (add 'scrolled' class on scroll > 50px)
3. Counter animation for stats (count up when visible)
4. Smooth anchor scrolling for nav links
5. Optional: typing effect on hero subtitle

QUALITY:
This MUST look like vercel.com, linear.app, or stripe.com quality. Real images, real content, production polish. When someone sees this, they should NOT be able to tell it was AI-generated.

OUTPUT: Raw HTML only. No markdown fences. No comments about the code. Just the complete, production-ready HTML document.`;

const PRESENTATION_PROMPT = `You are a lead designer at Gamma.app / Beautiful.ai creating a stunning, professional presentation deck.

Generate a presentation with RICH content and REAL images on most slides.

STRUCTURE:
Return a JSON object with this EXACT schema:
{
  "title": "Presentation Title",
  "theme": {
    "primary": "#a855f7",
    "secondary": "#3b82f6", 
    "accent": "#06b6d4",
    "background": "#0a0a0f"
  },
  "slides": [
    {
      "type": "title",
      "title": "Main Title",
      "subtitle": "Subtitle text — punchy tagline",
      "image": "https://images.unsplash.com/photo-RELEVANT_ID?w=1920&h=1080&fit=crop&q=80",
      "badge": "Optional small badge text like date or category"
    },
    {
      "type": "content",
      "title": "Slide Title",
      "bullets": ["Point 1 — substantive, 10-20 words each", "Point 2", "Point 3", "Point 4"],
      "note": "Speaker note for context",
      "image": "https://images.unsplash.com/photo-RELEVANT_ID?w=800&h=600&fit=crop&q=80"
    },
    {
      "type": "image-focus",
      "title": "Visual Title",
      "caption": "Detailed description of what the image represents",
      "image": "https://images.unsplash.com/photo-RELEVANT_ID?w=1920&h=1080&fit=crop&q=80"
    },
    {
      "type": "two-column",
      "title": "Comparison or Dual Info",
      "left": { "heading": "Left Column", "items": ["Detail 1", "Detail 2", "Detail 3"] },
      "right": { "heading": "Right Column", "items": ["Detail 1", "Detail 2", "Detail 3"] },
      "image": "https://images.unsplash.com/photo-RELEVANT_ID?w=800&h=600&fit=crop&q=80"
    },
    {
      "type": "stats",
      "title": "Key Numbers",
      "stats": [
        { "value": "10K+", "label": "Attendees", "description": "Expected footfall" },
        { "value": "95%", "label": "Satisfaction", "description": "From last year" },
        { "value": "50+", "label": "Events", "description": "Across 3 days" }
      ]
    },
    {
      "type": "quote",
      "quote": "A powerful, relevant quote that resonates with the topic",
      "author": "Speaker Name",
      "role": "Role / Title",
      "image": "https://images.unsplash.com/photo-PORTRAIT_ID?w=200&h=200&fit=crop&crop=face&q=80"
    },
    {
      "type": "team",
      "title": "Our Team / Speakers",
      "members": [
        { "name": "Person Name", "role": "Role", "image": "https://images.unsplash.com/photo-PORTRAIT_ID?w=200&h=200&fit=crop&crop=face&q=80" },
        { "name": "Person Name", "role": "Role", "image": "https://images.unsplash.com/photo-PORTRAIT_ID?w=200&h=200&fit=crop&crop=face&q=80" }
      ]
    },
    {
      "type": "timeline",
      "title": "Schedule / Roadmap",
      "items": [
        { "time": "9:00 AM", "title": "Opening", "description": "Keynote address" },
        { "time": "11:00 AM", "title": "Workshop", "description": "Hands-on session" }
      ]
    },
    {
      "type": "closing",
      "title": "Thank You",
      "subtitle": "Contact / CTA / Next Steps",
      "image": "https://images.unsplash.com/photo-RELEVANT_ID?w=1920&h=1080&fit=crop&q=80",
      "links": ["website.com", "@handle", "email@domain.com"]
    }
  ]
}

IMAGE RULES — CRITICAL:
- Include images on at LEAST 6-8 slides out of 10-14 total
- Use VERIFIED Unsplash photo IDs from this list — match to topic:
  Technology: photo-1518770660439-4636190af475, photo-1531297484001-80022131f5a1, photo-1550751827-4bd374c3f58b, photo-1581091226825-a6a2a5aee158, photo-1526374965328-7f61d4dc18c5
  Events/People: photo-1540575467063-178a50c2df87, photo-1475721027785-f74eccf877e2, photo-1505373877841-8d25f7d46678, photo-1523580494863-6f3031224c94, photo-1492684223066-81342ee5ff30
  Education: photo-1523050854058-8df90110c9f1, photo-1524178232363-1fb2b075b655, photo-1509062522246-3755977927d7, photo-1541339907198-e08756dedf3f
  Business: photo-1553877522-43269d4ea984, photo-1559136555-9303baea8ebd, photo-1460925895917-afdab827c52f
  Portraits (for team/quote slides): photo-1507003211169-0a1dd7228f2d, photo-1494790108377-be9c29b29330, photo-1472099645785-5658abf4ff4e, photo-1438761681033-6461ffad8d80, photo-1500648767791-00dcc994a43e, photo-1534528741775-53994a69daeb
- Format: https://images.unsplash.com/{photo-id}?w={width}&h={height}&fit=crop&q=80
- For portraits add: &crop=face

CONTENT RULES:
- Create 10-14 slides (more is better)
- First slide: type "title" (with hero image)
- MUST include at least: 1 image-focus, 1 stats, 1 quote, 1 team or timeline
- Last slide: type "closing"
- Content must be SPECIFIC, REAL, and SUBSTANTIVE — NOT generic
- Each content slide: 3-5 bullet points, each 10-20 words (meaty, not one-word)
- Vary slide types — don't repeat the same type consecutively
- Make it Gamma.app / Pitch.com quality

OUTPUT: Valid JSON only. No markdown fences. No explanation.`;

// ─── Helper: call OpenAI ─────────────────────────────────────

async function callOpenAI(systemPrompt, userPrompt, opts = {}) {
    const model = opts.model || MODEL;
    const completion = await openai.chat.completions.create({
        model,
        temperature: opts.temperature || 0.75,
        max_tokens: opts.maxTokens || 12000,
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

Full description: ${intent.description}
Target audience: ${intent.audience}
Desired tone: ${intent.tone}
Visual theme keywords: ${(intent.keywords || []).join(", ")}
Key elements to feature: ${intent.elements.join(", ")}
Original user request: ${prompt}

CRITICAL REQUIREMENTS:
- Use at least 1 full-bleed Unsplash background image + 3-4 smaller images in highlight cards
- ALL animations must be included (glow, float, fadeIn, pulse)
- Must look like a Behance/Dribbble featured poster design
- Dark theme with neon accents matching the event vibe
- NO placeholder text — all content must be real and specific to this event`,
                { maxTokens: 12000 }
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
                `Create a complete landing page for: "${intent.title}"

Full description: ${intent.description}
Target audience: ${intent.audience}
Desired tone: ${intent.tone}
Visual theme keywords: ${(intent.keywords || []).join(", ")}
Sections/elements to include: ${intent.elements.join(", ")}
Original user request: ${prompt}

CRITICAL REQUIREMENTS:
- Must include ALL 10 sections (navbar, hero, social proof, features, showcase, timeline/gallery, testimonials, stats, CTA, footer)
- At least 8-12 real Unsplash images throughout the page
- IntersectionObserver scroll animations on EVERY section
- Glassmorphism cards, gradient text, hover effects on everything
- Responsive design with @media queries for mobile/tablet
- Must look like a REAL Vercel/Stripe/Linear quality production website
- Counter animation JS for statistics numbers
- Navbar scroll shrink effect
- NO placeholder text anywhere — all content specific to this event/product`,
                { maxTokens: 16000 }
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
                `Create a professional presentation for: "${intent.title}"

Full description: ${intent.description}
Target audience: ${intent.audience}
Desired tone: ${intent.tone}
Visual theme keywords: ${(intent.keywords || []).join(", ")}
Topics to cover: ${intent.elements.join(", ")}
Original user request: ${prompt}

CRITICAL REQUIREMENTS:
- 10-14 slides with varied types (title, content, image-focus, stats, quote, team, timeline, two-column, closing)
- Unsplash images on at LEAST 6-8 slides
- Use VERIFIED photo IDs relevant to: ${(intent.keywords || []).join(", ")}
- Each bullet point should be 10-20 words (substantive, not one-word filler)
- Include at least 1 quote slide and 1 team/timeline slide
- Must feel like a Gamma.app or Pitch.com quality deck
- ALL content must be specific and real — no generic placeholders`,
                { maxTokens: 12000, json: true }
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
