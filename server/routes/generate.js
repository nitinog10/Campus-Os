import { Router } from "express";
import { openai } from "../lib/openai.js";
import crypto from "crypto";

export const generateRouter = Router();

// ─── Model config ────────────────────────────────────────────
const MODEL = process.env.OPENAI_MODEL || "gpt-4o";

// ─── CONTEXT-AWARE IMAGE SYSTEM ──────────────────────────────
// Instead of hardcoded IDs, we use Unsplash Source API with topic-based search
// Format: https://images.unsplash.com/photo-ID?w=W&h=H&fit=crop&q=80

const CURATED_IMAGES = {
    technology: [
        "photo-1518770660439-4636190af475", "photo-1531297484001-80022131f5a1",
        "photo-1550751827-4bd374c3f58b", "photo-1488590528505-98d2b5aba04b",
        "photo-1526374965328-7f61d4dc18c5", "photo-1581091226825-a6a2a5aee158",
        "photo-1504384764586-bb4cdc1707b0", "photo-1461749280684-dccba630e2f6",
        "photo-1555066931-4365d14bab8c", "photo-1517694712202-14dd9538aa97",
        "photo-1498050108023-c5249f4df085", "photo-1519389950473-47ba0277781c"
    ],
    hackathon: [
        "photo-1504384308090-c894fdcc538d", "photo-1531482615713-2afd69097998",
        "photo-1517694712202-14dd9538aa97", "photo-1522202176988-66273c2fd55f",
        "photo-1461749280684-dccba630e2f6", "photo-1498050108023-c5249f4df085",
        "photo-1555066931-4365d14bab8c", "photo-1504639725590-34d0984388bd"
    ],
    campus: [
        "photo-1523050854058-8df90110c9f1", "photo-1524178232363-1fb2b075b655",
        "photo-1509062522246-3755977927d7", "photo-1562774053-701939374585",
        "photo-1541339907198-e08756dedf3f", "photo-1607237138185-eedd9c632b0b",
        "photo-1498243691581-b145c3f54a5a", "photo-1592280771190-3e2e4d571952"
    ],
    events: [
        "photo-1540575467063-178a50c2df87", "photo-1475721027785-f74eccf877e2",
        "photo-1505373877841-8d25f7d46678", "photo-1528605248644-14dd04022da1",
        "photo-1523580494863-6f3031224c94", "photo-1492684223066-81342ee5ff30",
        "photo-1517457373958-b7bdd4587205", "photo-1529070538774-1935b8cc770e"
    ],
    cultural: [
        "photo-1533174072545-7a4b6ad7a6c3", "photo-1514525253161-7a46d19cd819",
        "photo-1493225457124-a3eb161ffa5f", "photo-1470229722913-7c0e2dbbafd3",
        "photo-1501281668745-f7f57925c3b4", "photo-1429962714451-bb934ecdc4ec",
        "photo-1506157786151-b8491531f063", "photo-1511671782779-c97d3d27a1d4"
    ],
    sports: [
        "photo-1461896836934-bd45ba89ce7a", "photo-1517649763962-0c623066013b",
        "photo-1574629810360-7efbbe195018", "photo-1552674605-db6ffd4facb5",
        "photo-1571019614242-c5c5dee9f50b", "photo-1508098682722-e99c43a406b2"
    ],
    business: [
        "photo-1553877522-43269d4ea984", "photo-1559136555-9303baea8ebd",
        "photo-1460925895917-afdab827c52f", "photo-1556761175-5973dc0f32e7",
        "photo-1519389950473-47ba0277781c", "photo-1553028826-f4804a6dba3b",
        "photo-1551434678-e076c223a692", "photo-1542744173-8e7e91415657"
    ],
    creative: [
        "photo-1513364776144-60967b0f800f", "photo-1501854140801-50d01698950b",
        "photo-1558618666-fcd25c85f82e", "photo-1549490349-8643362247b2",
        "photo-1547826039-bfc35e0f1ea8", "photo-1561070791-2526d30994b6"
    ],
    nature: [
        "photo-1470071459604-3b5ec3a7fe05", "photo-1441974231531-c6227db76b6e",
        "photo-1501854140801-50d01698950b", "photo-1518173946687-a1e44de498b1",
        "photo-1469474968028-56623f02e42e", "photo-1447752875215-b2761acb3c5d"
    ],
    people: [
        "photo-1507003211169-0a1dd7228f2d", "photo-1494790108377-be9c29b29330",
        "photo-1472099645785-5658abf4ff4e", "photo-1438761681033-6461ffad8d80",
        "photo-1500648767791-00dcc994a43e", "photo-1534528741775-53994a69daeb",
        "photo-1506794778202-cad84cf45f1d", "photo-1544005313-94ddf0286df2",
        "photo-1517841905240-472988babdf9", "photo-1531746020798-e6953c6e8e04"
    ],
    music: [
        "photo-1493225457124-a3eb161ffa5f", "photo-1514525253161-7a46d19cd819",
        "photo-1506157786151-b8491531f063", "photo-1511671782779-c97d3d27a1d4",
        "photo-1470225620780-dba8ba36b745", "photo-1459749411175-04bf5292ceea"
    ],
    food: [
        "photo-1504674900247-0877df9cc836", "photo-1476224203421-9ac39bcb3327",
        "photo-1414235077428-338989a2e8c0", "photo-1543353071-10c8ba85a904",
        "photo-1565299624946-b28f40a0ae38", "photo-1512621776951-a57141f2eefd"
    ],
    health: [
        "photo-1505751172876-fa1923c5c528", "photo-1571019613454-1cb2f99b2d8b",
        "photo-1532938911079-1b06ac7ceec7", "photo-1576091160399-112ba8d25d1d",
        "photo-1559757175-0eb30cd8c063", "photo-1498837167922-ddd27525d352"
    ],
    ai: [
        "photo-1677442136019-21780ecad995", "photo-1620712943543-bcc4688e7485",
        "photo-1655720828018-edd71de4f951", "photo-1485827404703-89b55fcc595e",
        "photo-1507146153580-69a1fe6d8aa1", "photo-1535378620166-273708d44e4c"
    ],
    robotics: [
        "photo-1485827404703-89b55fcc595e", "photo-1535378620166-273708d44e4c",
        "photo-1561557944-6e7860d1a7eb", "photo-1518314916381-77a37c2a49ae",
        "photo-1507146153580-69a1fe6d8aa1", "photo-1555255707-c07966088b7b"
    ]
};

/**
 * Given keyword array from intent, find the best matching image categories
 * and return a function that yields contextual Unsplash URLs
 */
function buildImageProvider(keywords = []) {
    const kw = keywords.map(k => k.toLowerCase());
    
    // Score each category by how many keyword matches
    const scored = Object.entries(CURATED_IMAGES).map(([cat, ids]) => {
        let score = 0;
        for (const k of kw) {
            if (cat.includes(k) || k.includes(cat)) score += 3;
            else if (k === "tech" && cat === "technology") score += 3;
            else if (k === "hack" && cat === "hackathon") score += 3;
            else if ((k === "college" || k === "university" || k === "school") && cat === "campus") score += 3;
            else if ((k === "fest" || k === "festival" || k === "conference") && (cat === "events" || cat === "cultural")) score += 2;
            else if ((k === "dance" || k === "drama" || k === "art") && cat === "cultural") score += 2;
            else if ((k === "startup" || k === "pitch" || k === "company") && cat === "business") score += 2;
            else if ((k === "machine learning" || k === "ml" || k === "deep learning" || k === "artificial intelligence") && cat === "ai") score += 3;
            else if ((k === "gym" || k === "fitness" || k === "cricket" || k === "football") && cat === "sports") score += 2;
            else if ((k === "concert" || k === "band" || k === "dj") && cat === "music") score += 2;
            else if ((k === "robot" || k === "iot" || k === "arduino") && cat === "robotics") score += 3;
        }
        return { cat, ids, score };
    });
    
    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    
    // Pick top categories; always include the best + a fallback
    const primary = scored[0]?.score > 0 ? scored[0].ids : CURATED_IMAGES.technology;
    const secondary = scored[1]?.score > 0 ? scored[1].ids : CURATED_IMAGES.events;
    const people = CURATED_IMAGES.people;
    
    const allImages = [...primary, ...secondary];
    let idx = 0;
    
    return {
        hero: (w = 1920, h = 1080) => {
            const id = primary[0];
            return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=80`;
        },
        section: (w = 800, h = 600) => {
            const id = allImages[idx++ % allImages.length];
            return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=80`;
        },
        card: (w = 600, h = 400) => {
            const id = allImages[idx++ % allImages.length];
            return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=80`;
        },
        portrait: (w = 200, h = 200) => {
            const pidx = idx++ % people.length;
            return `https://images.unsplash.com/${people[pidx]}?w=${w}&h=${h}&fit=crop&crop=face&q=80`;
        },
        background: (w = 1920, h = 1080) => {
            const id = primary[Math.min(1, primary.length - 1)];
            return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=80`;
        }
    };
}

const IMAGE_INSTRUCTIONS = `
IMAGES — ABSOLUTELY CRITICAL (contextually relevant, NOT random/dummy):

STRATEGY: Use the Unsplash image URLs provided in the "CONTEXTUAL IMAGES" section below. These are PRE-SELECTED to match the topic. You MUST use these exact URLs, not make up your own.

RULES:
- Use <img> with explicit width/height, style="object-fit:cover; width:100%; height:100%;"
- For hero/backgrounds: use as CSS background-image with overlay, OR an <img> with position:absolute + gradient overlay div on top
- Every section should have a purposeful image: hero, feature cards, testimonials, gallery, about section
- Add loading="lazy" to below-fold images
- NEVER use placeholder.com, placehold.it, via.placeholder, or ANY dummy image service
- NEVER leave an image src empty or use # as src
- ALL images must relate to the actual topic/content being generated
- For team/testimonial portraits, use the portrait URLs provided
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

const POSTER_PROMPT = `You are a SENIOR DESIGNER at Canva's premium design team. You create posters that win design awards on Behance and Dribbble. Your designs look IDENTICAL to premium Canva templates — not auto-generated.

Generate a COMPLETE, SELF-CONTAINED HTML document that renders as a visually STUNNING poster that looks like it was made by a human designer in Canva Pro or Adobe InDesign.

${IMAGE_INSTRUCTIONS}

HTML STRUCTURE:
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=Outfit:wght@400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>/* ALL CSS HERE */</style>
</head>
<body><!-- POSTER CONTENT --></body>
</html>

DESIGN SPECIFICATIONS (CANVA-QUALITY):

1. PAGE SETUP:
   - body: margin 0, overflow hidden, background #000
   - Poster container: width 100vw, height 100vh, position relative, overflow hidden
   - Everything must fit within the viewport — NO scrolling
   - Use CSS Grid for the overall layout — this gives pixel-perfect placement like Canva

2. BACKGROUND LAYERS (stack these for depth like Canva Pro templates):
   Layer 1: Full-bleed contextual Unsplash image (position absolute, object-fit cover, 100% width/height) — MUST match the event topic
   Layer 2: Dark gradient overlay — use a multi-stop gradient: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.92) 100%)
   Layer 3: Subtle CSS grain texture using: background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
   Layer 4: 2-3 color gradient orbs (positioned absolutely, radial-gradient, blur(80-120px), opacity 0.2-0.4, matching event theme colors)

3. TYPOGRAPHY (like premium Canva templates):
   - Main title: Outfit or Sora, weight 800-900, 4.5-7rem, tight letter-spacing (-0.02em)
   - Title MUST use gradient text: background: linear-gradient(135deg, COLOR1, COLOR2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
   - OR use solid white with a sophisticated text-shadow: 0 0 40px rgba(COLOR,0.4), 0 0 80px rgba(COLOR,0.2)
   - Subtitle: Inter or Poppins, 300-400 weight, 1.1-1.4rem, letter-spacing 0.05-0.1em, UPPERCASE for elegance
   - Body text: Inter 400, 0.85-1rem, line-height 1.6
   - Accent text: Playfair Display italic for elegant pull quotes or taglines
   - Use font-feature-settings: 'ss01', 'ss02' for modern OpenType features

4. LAYOUT (Canva Grid-based precision):
   - Use CSS Grid with named areas: "header" "hero" "highlights" "details" "cta" "footer"
   - Visual hierarchy: Badge/date → Big title → tagline → highlight cards → details → CTA → organizer
   - White space is your BEST FRIEND — don't cram, let elements breathe
   - Use asymmetric layouts for visual interest (title slightly off-center, cards in 3-column grid)
   - All text content should be within a centered container (max-width: 85vw)

5. VISUAL ELEMENTS (what makes it look like Canva, not AI):
   - Glassmorphism cards: backdrop-filter: blur(24px); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;
   - Each glass card MUST have: a subtle gradient shine on top edge (pseudo-element, 1px height, gradient from transparent to white/10 to transparent)
   - Accent lines: thin (1px) gradient lines as separators, with glow (box-shadow: 0 0 10px COLOR)
   - Floating orbs: 3-4 decorative circles (border-radius: 50%, gradient fill, blur(60px), position absolute, z-index 0)
   - Icon badges: small rounded-full badges with emoji or SVG icons next to dates (📅), venue (📍), highlights (⚡)
   - Mesh gradient background technique: overlapping radial-gradients at different positions
   - At least 2-3 small images inside glass cards (features/speakers)

6. COLOR PALETTE (sophisticated, not garish):
   - Choose ONE of these curated palettes based on event type:
     • Tech/Hackathon: Base #06060a, Primary #8b5cf6 (violet), Secondary #06b6d4 (cyan), Accent #22d3ee
     • Cultural Fest: Base #0a0608, Primary #ec4899 (pink), Secondary #f59e0b (amber), Accent #8b5cf6
     • Workshop/Education: Base #060a08, Primary #10b981 (emerald), Secondary #3b82f6 (blue), Accent #a78bfa
     • Sports: Base #0a0806, Primary #f97316 (orange), Secondary #ef4444 (red), Accent #fbbf24
     • Business/Formal: Base #06060a, Primary #3b82f6 (blue), Secondary #8b5cf6 (purple), Accent #06b6d4
   - Text: #ffffff 100% for headings, #e2e8f0 90% for sub, #94a3b8 60% for body
   - NEVER use pure neon green on black (looks cheap) — always use sophisticated color pairs

7. MANDATORY CONTENT (all must appear):
   - Event title (massive, gradient or glowing)
   - Tagline (1 punchy line below title, lighter weight)
   - Date & Time with 📅 badge
   - Venue with 📍 badge
   - 3-4 highlight cards in a grid (speakers/activities/prizes/features) — each with icon + title + short desc
   - "Register Now" CTA button (gradient bg, rounded-full, px-8 py-3, glow shadow, scale on hover)
   - Organizer info at bottom with subtle text
   - QR code hint or registration link text
   - Small decorative elements (dots, lines, gradient circles)

${ANIMATION_INSTRUCTIONS}

POSTER-SPECIFIC ANIMATIONS:
- Title: fadeInDown + text glow pulse (subtle, not flashy)
- Subtitle: fadeInUp with 0.3s delay
- Cards: staggered scaleIn (0.1s delay between each)
- CTA button: subtle pulse + glow (infinite, duration 3s)
- Decorative orbs: float with different durations (4-8s each)
- Background: slow gradientShift (20s cycle)

QUALITY STANDARD:
When someone opens this poster, they should say "wait, this was made in Canva Pro?" — NOT "this looks AI-generated."
- Clean alignments — everything perfectly aligned on the grid
- Sophisticated color usage — no clashing, no garish combinations
- Premium typography — proper hierarchy, proper spacing
- Subtle animations — enhance, don't distract
- Real images that match the topic
- Every element has purpose — if it doesn't serve the design, remove it

OUTPUT: Raw HTML only. No markdown fences. No explanation. Just the complete HTML document.`;

const LANDING_PAGE_PROMPT = `You are a SENIOR FRONTEND ENGINEER at Lovable.dev / Vercel building a PRODUCTION-GRADE landing page. The result must be INDISTINGUISHABLE from a real, deployed SaaS website. Think vercel.com, linear.app, stripe.com, or cal.com quality.

${IMAGE_INSTRUCTIONS}

HTML STRUCTURE:
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PAGE_TITLE</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>/* ALL CSS — must be comprehensive */</style>
</head>
<body>
  <!-- NAVBAR -->
  <!-- HERO -->
  <!-- SOCIAL PROOF -->
  <!-- FEATURES -->
  <!-- SHOWCASE/ABOUT -->
  <!-- GALLERY/TIMELINE -->
  <!-- TESTIMONIALS -->
  <!-- STATS -->
  <!-- FAQ or PRICING -->
  <!-- CTA -->
  <!-- FOOTER -->
  <script>/* SCROLL ANIMATIONS + INTERACTIVITY */</script>
</body>
</html>

DESIGN SYSTEM (Lovable.dev quality — use CSS custom properties):
:root {
  --bg-primary: #050507;
  --bg-secondary: #0a0a10;
  --bg-tertiary: #0f0f18;
  --bg-card: rgba(255,255,255,0.02);
  --bg-card-hover: rgba(255,255,255,0.05);
  --border-subtle: rgba(255,255,255,0.05);
  --border-hover: rgba(255,255,255,0.12);
  --border-active: rgba(168,85,247,0.3);
  --text-primary: #f5f5f7;
  --text-secondary: #a1a1aa;
  --text-tertiary: #52525b;
  --accent-purple: #a855f7;
  --accent-blue: #3b82f6;
  --accent-cyan: #06b6d4;
  --accent-pink: #ec4899;
  --gradient-primary: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
  --gradient-secondary: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
  --gradient-accent: linear-gradient(135deg, var(--accent-pink), var(--accent-purple));
  --glass-bg: rgba(255,255,255,0.02);
  --glass-bg-hover: rgba(255,255,255,0.06);
  --glass-border: rgba(255,255,255,0.06);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-2xl: 32px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 40px rgba(168,85,247,0.15);
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
}

GLOBAL STYLES:
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg-primary); color: var(--text-primary); overflow-x: hidden; line-height: 1.6; }

/* Utility classes for consistent spacing */
.section { padding: 120px 0; position: relative; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.section-label { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 100px; background: rgba(168,85,247,0.08); border: 1px solid rgba(168,85,247,0.15); font-size: 0.8rem; font-weight: 500; color: var(--accent-purple); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 20px; }
.section-title { font-family: 'Sora', 'Space Grotesk', sans-serif; font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 700; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 16px; }
.section-desc { font-size: 1.1rem; color: var(--text-secondary); max-width: 600px; line-height: 1.7; }
.gradient-text { background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

SECTIONS (implement ALL of these — each is MANDATORY):

1. STICKY NAVBAR (Apple/Linear quality):
   - position: fixed, top: 0, width: 100%, z-index: 1000
   - backdrop-filter: blur(20px) saturate(180%), background: rgba(5,5,7,0.85)
   - border-bottom: 1px solid var(--border-subtle)
   - height: 64px; display: flex; align-items: center
   - Left: Logo (gradient icon + text), Center or Right: 4-5 nav links (font-size: 0.9rem, font-weight: 500, color: var(--text-secondary), hover: var(--text-primary))
   - Right: CTA button (gradient bg, rounded-full, px-5 py-2, font-size: 0.85rem)
   - On scroll > 50px: add class "scrolled" via JS — slightly reduce height, add subtle shadow
   - Mobile: hamburger menu (3 lines icon, transform to X on open, slide-in menu)

2. HERO (min-height: 100vh, the make-or-break section):
   - Display: flex, align-items: center, position: relative
   - Background layers: 
     a) CSS mesh gradient (3-4 radial-gradient orbs, position absolute, blur(120px), opacity 0.15)
     b) Subtle grid pattern overlay (repeating-linear-gradient creating a dot grid, opacity 0.03)
     c) Optional: contextual Unsplash image with heavy overlay
   - Layout: centered or split (text 55% + mockup/image 45%)
   - Above title: pill badge "✨ Just Launched" or relevant badge (section-label class)
   - Title: font-family: 'Sora', font-size: clamp(3rem, 6vw, 5rem), font-weight: 800, letter-spacing: -0.03em, line-height: 1.05
   - Title should have gradient text on key words (not the entire title)
   - Subtitle: font-size: 1.2rem, max-width: 580px, color: var(--text-secondary), margin-top: 24px, line-height: 1.7
   - Buttons row (margin-top: 40px, gap: 16px):
     Primary: gradient bg, color white, rounded-full, px-8 py-3.5, font-weight: 600, box-shadow: var(--shadow-glow), hover: transform scale(1.02) + increased glow
     Secondary: bg transparent, border 1px solid var(--border-hover), color var(--text-primary), rounded-full, px-8 py-3.5, hover: bg rgba(255,255,255,0.05)
   - Decorative orbs: 2-3 gradient blur circles (position absolute, width 300-500px, border-radius 50%, filter blur(100px), opacity 0.12-0.2, z-index 0)
   - Social proof line below buttons: "Trusted by 500+ students" with small avatar stack (3-4 overlapping circles)
   - Animation: staggered fadeInUp — badge 0.2s, title 0.3s, subtitle 0.5s, buttons 0.7s, social proof 0.9s

3. LOGOS / SOCIAL PROOF BAR:
   - padding: 60px 0, border-top + border-bottom: 1px solid var(--border-subtle)
   - "Trusted by leading organizations" text centered, font-size: 0.85rem, text-transform: uppercase, letter-spacing: 0.1em, color: var(--text-tertiary)
   - Row of 5-6 partner/sponsor names styled as text logos (font-weight: 700, font-size: 1.3rem, opacity: 0.3, hover: opacity 0.6, grayscale filter)
   - Use CSS flexbox with justify-content: space-between

4. FEATURES GRID (3-4 cards, bento-grid style):
   - Section label + title + description centered
   - Cards layout: CSS Grid, grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)), gap: 24px
   - Each card: 
     background: var(--bg-card), border: 1px solid var(--border-subtle), border-radius: var(--radius-xl), padding: 32px
     hover: background var(--bg-card-hover), border-color var(--border-hover), transform translateY(-2px), box-shadow var(--shadow-lg)
     transition: all var(--transition-base)
   - Card content: 
     Top: contextual image (height: 200px, object-fit: cover, border-radius: var(--radius-md), margin-bottom: 24px)
     Icon: 48px circle with gradient bg + emoji or SVG, margin-bottom: 16px
     Title: font-size: 1.15rem, font-weight: 600, margin-bottom: 8px
     Description: font-size: 0.9rem, color: var(--text-secondary), line-height: 1.6
   - Each card has class "animate-on-scroll"
   - Consider making 1 card span 2 columns for visual variety (the "hero feature")

5. SHOWCASE / ABOUT (split layout — this section tells the story):
   - Alternating two-column layout (text + image, then image + text)
   - Grid: grid-template-columns: 1fr 1fr, gap: 80px, align-items: center
   - Text side: section-label, heading (2.2rem), paragraph, then a list of 3-4 check points (flex, gap, green checkmark SVG + text)
   - Image side: contextual Unsplash image, border-radius: var(--radius-xl), border: 1px solid var(--border-subtle), overflow hidden
   - Add a stats row below: 3-4 stat items (number in gradient-text 2rem bold + label in text-secondary 0.85rem)
   - Second block reverses the column order for visual rhythm

6. TIMELINE / SCHEDULE (if event) or IMAGE GALLERY:
   Timeline:
   - Vertical timeline with center line (2px, gradient from purple to blue)
   - Alternating left/right cards with connector dots (12px circle, gradient fill, border 2px solid bg)
   - Each item: glass card (backdrop-filter, border, radius), time badge, title (bold), description, optional small image
   Gallery:
   - CSS Grid masonry-style (grid-auto-rows: 200px, some items span 2 rows)
   - Images with rounded corners, hover: scale(1.03) + overlay with title text
   - Both: animate-on-scroll on each item

7. TESTIMONIALS (minimum 3, magazine-quality):
   - Section with label + title
   - Grid: 3 testimonial cards
   - Each card: glass bg, 24px padding, border-radius var(--radius-xl)
   - Content: large decorative " (font-size: 4rem, color: rgba(168,85,247,0.2), position absolute)
   - Quote text: font-size: 1rem, line-height: 1.7, color var(--text-secondary), italic
   - Star rating: ★★★★★ in amber (#fbbf24)
   - Person: flex row with portrait image (48px rounded-full, border 2px solid var(--border-subtle)), name (font-weight: 600), role (text-tertiary, 0.85rem)
   - Hover: border-color var(--border-active), subtle glow

8. STATS SECTION:
   - Background: var(--bg-secondary) or subtle gradient
   - 4 stats in a row (CSS Grid, equal columns)
   - Number: font-family 'Sora', font-size clamp(2.5rem, 4vw, 4rem), font-weight: 800, gradient-text
   - Label: font-size 0.9rem, color var(--text-secondary), margin-top: 8px
   - JS counter animation: count from 0 to target (parseInt) over 2 seconds when visible
   - Separator lines between stats (vertical, 1px, var(--border-subtle), height: 60%)

9. FINAL CTA (conversion section):
   - padding: 100px 0, text-align: center
   - Background: subtle radial gradient orb
   - Heading: 2.5-3rem, gradient-text, max-width: 600px, margin: auto
   - Subtitle: text-secondary, margin-top: 16px
   - Large button: gradient bg, rounded-full, px-10 py-4, font-size: 1.1rem, font-weight: 600, glow shadow
   - Decorative elements: 2 gradient orbs flanking the CTA

10. FOOTER:
    - padding: 80px 0 40px
    - background: rgba(0,0,0,0.5), border-top: 1px solid var(--border-subtle)
    - Top section: 4-column grid (Brand + desc, Quick Links, Resources, Contact)
    - Brand column: logo, 2-3 line description, social links (use emoji for icons: 𝕏 📸 💼)
    - Link columns: heading (font-weight: 600, margin-bottom: 16px) + list of links (text-secondary, hover: text-primary)
    - Bottom bar: flex between "© 2026 Brand. All rights reserved." and legal links
    - Gradient line separator above bottom bar

RESPONSIVE DESIGN (MANDATORY — test these breakpoints):
@media (max-width: 1024px): reduce padding, 2-column grids to single
@media (max-width: 768px): stack all columns, reduce font sizes by 15%, hide decorative elements, single column cards
@media (max-width: 480px): further reduce, full-width buttons, navbar hamburger, font-size base: 14px

${ANIMATION_INSTRUCTIONS}

ADDITIONAL JS (include in <script> at bottom):
1. IntersectionObserver for scroll animations:
   const obs = new IntersectionObserver((entries) => { entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }}); }, {threshold: 0.1, rootMargin: '0px 0px -60px 0px'});
   document.querySelectorAll('.animate-on-scroll').forEach(el => obs.observe(el));

2. Navbar scroll effect:
   window.addEventListener('scroll', () => { document.querySelector('nav').classList.toggle('scrolled', window.scrollY > 50); });

3. Counter animation for stats:
   function animateCounter(el) { const target = parseInt(el.dataset.target); let current = 0; const step = target / 60; const timer = setInterval(() => { current += step; if(current >= target) { el.textContent = el.dataset.suffix ? target + el.dataset.suffix : target + '+'; clearInterval(timer); } else { el.textContent = Math.floor(current); } }, 33); }

4. Smooth anchor scrolling for nav links

5. Mobile menu toggle

CSS for scroll animations:
.animate-on-scroll { opacity: 0; transform: translateY(24px); transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
.animate-on-scroll.visible { opacity: 1; transform: translateY(0); }
.animate-on-scroll:nth-child(2) { transition-delay: 0.1s; }
.animate-on-scroll:nth-child(3) { transition-delay: 0.2s; }
.animate-on-scroll:nth-child(4) { transition-delay: 0.3s; }
.animate-on-scroll:nth-child(5) { transition-delay: 0.4s; }

QUALITY CHECKLIST (all must be true):
✅ Looks like a REAL deployed website (vercel.com, linear.app, cal.com quality)
✅ Every image is contextually relevant to the topic (no random stock photos)
✅ Typography is clean with proper hierarchy and spacing
✅ Color palette is cohesive and sophisticated (dark theme, not garish)
✅ All interactive elements have hover/focus states
✅ Scroll animations are smooth and subtle (not distracting)
✅ Responsive on mobile, tablet, and desktop
✅ No placeholder text anywhere — all content is specific and meaningful
✅ Navigation is functional with smooth scrolling
✅ At least 8-12 contextual images throughout the page

OUTPUT: Raw HTML only. No markdown fences. No comments about the code. Just the complete, production-ready HTML document.`;

const PRESENTATION_PROMPT = `You are the LEAD DESIGNER at Gamma.app / Beautiful.ai. You create presentation decks that look like they were designed by a professional design agency — not auto-generated. Every slide should feel intentional, polished, and visually stunning.

Generate a presentation with RICH, SPECIFIC content and CONTEXTUALLY RELEVANT images.

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
      "title": "Main Title — Captivating & Bold",
      "subtitle": "A compelling tagline that makes people lean in (15-25 words)",
      "image": "HERO_IMAGE_URL",
      "badge": "Category or Date badge text"
    },
    {
      "type": "content",
      "title": "Descriptive Slide Title",
      "bullets": [
        "Each bullet is 12-25 words — substantive, specific, actionable content that teaches or informs",
        "Include statistics, examples, or concrete details — NEVER generic filler text",
        "Reference real tools, methodologies, or frameworks when relevant",
        "End with a forward-looking insight or call to action"
      ],
      "note": "Speaker note with additional context or talking points",
      "image": "RELEVANT_IMAGE_URL"
    },
    {
      "type": "image-focus",
      "title": "A Title That Describes the Visual Story",
      "caption": "Rich description (20-40 words) explaining the significance of what's shown, not just describing it",
      "image": "CONTEXTUAL_IMAGE_URL"
    },
    {
      "type": "two-column",
      "title": "Comparison, Before/After, or Dual Perspective",
      "left": { "heading": "Descriptive Left Heading", "items": ["Specific detail 1 (10-15 words)", "Specific detail 2", "Specific detail 3"] },
      "right": { "heading": "Descriptive Right Heading", "items": ["Specific detail 1 (10-15 words)", "Specific detail 2", "Specific detail 3"] },
      "image": "OPTIONAL_IMAGE_URL"
    },
    {
      "type": "stats",
      "title": "Impactful Numbers That Tell a Story",
      "stats": [
        { "value": "10K+", "label": "Descriptive Label", "description": "One-line context for the number" },
        { "value": "95%", "label": "Descriptive Label", "description": "One-line context" },
        { "value": "50+", "label": "Descriptive Label", "description": "One-line context" },
        { "value": "24/7", "label": "Descriptive Label", "description": "One-line context" }
      ]
    },
    {
      "type": "quote",
      "quote": "A powerful, relevant, specific quote (20-40 words) — can be real or crafted for context. Should resonate emotionally.",
      "author": "Full Name",
      "role": "Specific Role / Title / Organization",
      "image": "PORTRAIT_URL"
    },
    {
      "type": "team",
      "title": "Our Team / Speakers / Mentors",
      "members": [
        { "name": "Full Name", "role": "Specific Role", "image": "PORTRAIT_URL" },
        { "name": "Full Name", "role": "Specific Role", "image": "PORTRAIT_URL" },
        { "name": "Full Name", "role": "Specific Role", "image": "PORTRAIT_URL" },
        { "name": "Full Name", "role": "Specific Role", "image": "PORTRAIT_URL" }
      ]
    },
    {
      "type": "timeline",
      "title": "Journey / Schedule / Roadmap",
      "items": [
        { "time": "Phase/Time", "title": "Milestone Title", "description": "Rich description (15-25 words)" },
        { "time": "Phase/Time", "title": "Milestone Title", "description": "Rich description" }
      ]
    },
    {
      "type": "closing",
      "title": "Thank You / Call to Action",
      "subtitle": "A memorable closing line with next steps",
      "image": "CLOSING_IMAGE_URL",
      "links": ["website.com", "@twitter_handle", "email@domain.com"]
    }
  ]
}

IMAGE RULES — ABSOLUTELY CRITICAL (what makes this Gamma-quality):
- Include images on at LEAST 7-9 slides out of 12-15 total slides
- ALL image URLs will be provided to you as "CONTEXTUAL IMAGES" in the user prompt — USE THOSE EXACT URLs
- For portrait slides (team, quote): use the portrait URLs provided
- Images must be high-resolution: hero images at ?w=1920&h=1080, section images at ?w=800&h=600, portraits at ?w=200&h=200
- NEVER use placeholder.com, placehold.it, or any dummy URL
- NEVER make up Unsplash photo IDs — only use what's provided

CONTENT QUALITY RULES (Gamma.app standard):
- Create 12-15 slides (quality > quantity, but more allows richer storytelling)
- First slide: always "title" type (with hero image + badge)
- Last slide: always "closing" type (with image + links)
- MUST include at least: 2 content slides, 1 image-focus, 1 stats, 1 quote, 1 team OR timeline, 1 two-column
- Vary slide types — NEVER have the same type twice in a row
- Each bullet point: 12-25 words (specific, actionable, with real data/examples — NOT generic filler)
- Stats should use realistic, believable numbers relevant to the topic
- Quote slide should have a genuine-sounding quote relevant to the topic
- Team members should have realistic names and specific roles
- Timeline items should have logical progression
- ALL text must be specific to the user's topic — NO generic placeholder content
- Use power words: Transform, Revolutionize, Empower, Accelerate, Unleash, Pioneer

OUTPUT: Valid JSON only. No markdown fences. No explanation. No comments.`;

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
            `You are a CampusOS intent interpreter. Analyze the user's request and extract structured intent with RICH detail.

Return JSON:
{
  "type": "event_promotion" | "website" | "presentation",
  "title": "catchy, compelling title (5-8 words max)",
  "description": "detailed 2-3 sentence summary of the topic/event/project",
  "audience": "specific target audience",
  "tone": "formal" | "casual" | "energetic" | "professional" | "creative",
  "elements": ["element1", "element2", "element3", "element4", "element5"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

IMPORTANT for "keywords" field:
- Extract 4-6 VISUAL THEME keywords that describe what images should look like
- Choose from these categories to help match images: technology, hackathon, campus, events, cultural, sports, business, creative, nature, people, music, food, health, ai, robotics
- Include at least 2 words from the categories above that match the topic
- Example: for "AI Hackathon" → ["technology", "hackathon", "ai", "coding", "innovation"]
- Example: for "Cultural Night" → ["cultural", "music", "events", "dance", "performance"]
- Example: for "Robotics Workshop" → ["robotics", "technology", "campus", "innovation", "engineering"]

IMPORTANT for "elements" field:
- List 4-6 specific content elements to include (speakers, prizes, schedule, features, team, etc.)
- Be specific: "Cash prizes worth ₹50K" not just "prizes"

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

        // ── Build context-aware image provider ───────────────
        const images = buildImageProvider(intent.keywords || []);

        // Pre-generate contextual image URLs to inject into prompts
        const contextImages = {
            hero: images.hero(1920, 1080),
            heroAlt: images.background(1920, 1080),
            section1: images.section(800, 600),
            section2: images.section(800, 600),
            section3: images.section(800, 600),
            section4: images.section(800, 600),
            section5: images.section(800, 600),
            section6: images.section(800, 600),
            card1: images.card(600, 400),
            card2: images.card(600, 400),
            card3: images.card(600, 400),
            card4: images.card(600, 400),
            portrait1: images.portrait(200, 200),
            portrait2: images.portrait(200, 200),
            portrait3: images.portrait(200, 200),
            portrait4: images.portrait(200, 200),
            portrait5: images.portrait(200, 200),
            portrait6: images.portrait(200, 200),
        };

        const imageBlock = `
CONTEXTUAL IMAGES (pre-selected to match "${intent.title}" — USE THESE EXACT URLs):
Hero/Background images:
  - Hero: ${contextImages.hero}
  - Alt Hero: ${contextImages.heroAlt}
Section images (for features, about, gallery):
  - ${contextImages.section1}
  - ${contextImages.section2}
  - ${contextImages.section3}
  - ${contextImages.section4}
  - ${contextImages.section5}
  - ${contextImages.section6}
Card thumbnails (for feature cards, highlights):
  - ${contextImages.card1}
  - ${contextImages.card2}
  - ${contextImages.card3}
  - ${contextImages.card4}
Portrait images (for testimonials, team members):
  - ${contextImages.portrait1}
  - ${contextImages.portrait2}
  - ${contextImages.portrait3}
  - ${contextImages.portrait4}
  - ${contextImages.portrait5}
  - ${contextImages.portrait6}

You MUST use these exact image URLs in your output. Do NOT invent your own Unsplash URLs.
`;

        // ── Step 2: Generate the primary asset ────────────────
        console.log("⚡ Generating asset...");
        const id = crypto.randomUUID();
        let asset;

        if (resolvedType === "poster") {
            const html = await callOpenAI(
                POSTER_PROMPT,
                `Create an award-winning poster for: "${intent.title}"

${imageBlock}

Full description: ${intent.description}
Target audience: ${intent.audience}
Desired tone: ${intent.tone}
Visual theme keywords: ${(intent.keywords || []).join(", ")}
Key elements to feature: ${intent.elements.join(", ")}
Original user request: ${prompt}

CRITICAL REQUIREMENTS:
- Use the HERO image URL as the full-bleed background (with dark overlay)
- Use CARD image URLs inside the highlight/feature glass cards
- ALL animations must be included (glow, float, fadeIn, pulse, gradientShift)
- Must look like a premium Canva Pro template — sophisticated, not amateur
- Dark theme with coordinated accent colors matching the event vibe
- NO placeholder text — all content must be real, specific to this event
- Typography must have proper hierarchy (title huge, subtitle medium, body small)
- Include glassmorphism cards, gradient text, floating orbs, and glow effects`,
                { maxTokens: 14000 }
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
                `Create a production-quality landing page for: "${intent.title}"

${imageBlock}

Full description: ${intent.description}
Target audience: ${intent.audience}
Desired tone: ${intent.tone}
Visual theme keywords: ${(intent.keywords || []).join(", ")}
Sections/elements to include: ${intent.elements.join(", ")}
Original user request: ${prompt}

CRITICAL REQUIREMENTS:
- Must include ALL 10 sections (navbar, hero, social proof, features, showcase, timeline/gallery, testimonials, stats, CTA, footer)
- Use HERO image in the hero section background (with overlay)
- Use SECTION images in the showcase/about and gallery sections
- Use CARD images as feature card thumbnails
- Use PORTRAIT images for testimonials
- IntersectionObserver scroll animations on EVERY section
- Glassmorphism cards, gradient text, hover effects everywhere
- Responsive design with @media queries for mobile (768px) and small screens (480px)
- Must look like vercel.com / linear.app / cal.com quality
- Counter animation JS for statistics numbers
- Navbar scroll effect with backdrop blur
- NO placeholder text — ALL content must be specific to this topic
- At least 10 images throughout the page using the provided URLs`,
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
                `Create a Gamma.app-quality presentation for: "${intent.title}"

${imageBlock}

Full description: ${intent.description}
Target audience: ${intent.audience}
Desired tone: ${intent.tone}
Visual theme keywords: ${(intent.keywords || []).join(", ")}
Topics to cover: ${intent.elements.join(", ")}
Original user request: ${prompt}

CRITICAL REQUIREMENTS:
- 12-15 slides with varied types (title, content, image-focus, stats, quote, team, timeline, two-column, closing)
- Use the provided CONTEXTUAL IMAGE URLs — assign them to slides where they make sense
- Hero image for title slide, section images for content/image-focus slides, portraits for team/quote slides
- Each bullet point is 12-25 words (rich, specific, actionable)
- Include at least 1 quote slide with a portrait and 1 team slide with 3-4 portrait images
- Stats should have 3-4 impressive but realistic numbers
- ALL content must be deeply specific to the topic — zero generic filler
- Vary slide types — never repeat the same type consecutively
- The presentation should tell a compelling narrative arc: hook → context → details → impact → call to action`,
                { maxTokens: 14000, json: true }
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
