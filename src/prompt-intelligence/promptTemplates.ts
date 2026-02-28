// ─── Prompt Templates for CampusOS Prompt Intelligence Layer ────────────────

import type { AssetType } from "@/types/campusos";

export interface PromptField {
    key: string;
    label: string;
    placeholder: string;
    required: boolean;
    multiline?: boolean;
}

export interface PromptTemplate {
    id: string;
    label: string;
    description: string;
    assetType: AssetType;
    fields: PromptField[];
    basePrompt: (values: Record<string, string>) => string;
}

// ─── Poster Templates ────────────────────────────────────────────────────────

const posterEventTemplate: PromptTemplate = {
    id: "poster-event",
    label: "Event Poster",
    description: "Create eye-catching posters for campus events, fests, and workshops",
    assetType: "poster",
    fields: [
        {
            key: "eventName",
            label: "Event Name",
            placeholder: "e.g., TechNova 2026",
            required: true,
        },
        {
            key: "eventType",
            label: "Event Type",
            placeholder: "e.g., Tech Fest, Hackathon, Workshop, Cultural Night",
            required: true,
        },
        {
            key: "date",
            label: "Date & Time",
            placeholder: "e.g., March 15-17, 2026 | 9 AM onwards",
            required: true,
        },
        {
            key: "venue",
            label: "Venue",
            placeholder: "e.g., Main Auditorium, Block A",
            required: true,
        },
        {
            key: "theme",
            label: "Visual Theme",
            placeholder: "e.g., Futuristic, Neon Cyberpunk, Minimalist, Vibrant",
            required: false,
        },
        {
            key: "highlights",
            label: "Key Highlights",
            placeholder: "e.g., Cash prizes worth ₹50K, Industry speakers, Workshops",
            required: false,
            multiline: true,
        },
        {
            key: "organizer",
            label: "Organized By",
            placeholder: "e.g., Computer Science Department, Tech Club",
            required: false,
        },
        {
            key: "additionalInfo",
            label: "Additional Details",
            placeholder: "Any other information to include (registration link, contact, etc.)",
            required: false,
            multiline: true,
        },
    ],
    basePrompt: (values) => {
        const parts = [
            `Create a stunning event poster for "${values.eventName}"`,
            `a ${values.eventType}`,
            `scheduled for ${values.date}`,
            `at ${values.venue}`,
        ];

        if (values.theme) {
            parts.push(`with a ${values.theme} visual style`);
        }

        let prompt = parts.join(", ") + ".";

        if (values.highlights) {
            prompt += ` Key highlights: ${values.highlights}.`;
        }

        if (values.organizer) {
            prompt += ` Organized by ${values.organizer}.`;
        }

        if (values.additionalInfo) {
            prompt += ` Additional info: ${values.additionalInfo}.`;
        }

        prompt += " Make it visually striking and student-friendly with modern design elements.";

        return prompt;
    },
};

const posterClubRecruitmentTemplate: PromptTemplate = {
    id: "poster-recruitment",
    label: "Club Recruitment Poster",
    description: "Attract new members to your club or society",
    assetType: "poster",
    fields: [
        {
            key: "clubName",
            label: "Club/Society Name",
            placeholder: "e.g., Robotics Club, Debating Society",
            required: true,
        },
        {
            key: "tagline",
            label: "Tagline",
            placeholder: "e.g., Build. Innovate. Lead.",
            required: false,
        },
        {
            key: "benefits",
            label: "What Members Get",
            placeholder: "e.g., Hands-on projects, Industry mentorship, Networking",
            required: true,
            multiline: true,
        },
        {
            key: "deadline",
            label: "Application Deadline",
            placeholder: "e.g., Apply by Feb 28, 2026",
            required: false,
        },
        {
            key: "style",
            label: "Design Style",
            placeholder: "e.g., Professional, Fun & Colorful, Tech-inspired",
            required: false,
        },
    ],
    basePrompt: (values) => {
        let prompt = `Design a recruitment poster for "${values.clubName}"`;

        if (values.tagline) {
            prompt += ` with the tagline "${values.tagline}"`;
        }

        prompt += `. Highlight benefits: ${values.benefits}.`;

        if (values.deadline) {
            prompt += ` Include deadline: ${values.deadline}.`;
        }

        if (values.style) {
            prompt += ` Style: ${values.style}.`;
        }

        prompt += " Create an energetic, welcoming design that appeals to college students.";

        return prompt;
    },
};

// ─── Landing Page Templates ──────────────────────────────────────────────────

const landingClubTemplate: PromptTemplate = {
    id: "landing-club",
    label: "Club Landing Page",
    description: "Showcase your club with a professional website",
    assetType: "landing",
    fields: [
        {
            key: "clubName",
            label: "Club Name",
            placeholder: "e.g., CodeCraft Club",
            required: true,
        },
        {
            key: "mission",
            label: "Mission Statement",
            placeholder: "e.g., Empowering students through hands-on coding experience",
            required: true,
            multiline: true,
        },
        {
            key: "activities",
            label: "Key Activities",
            placeholder: "e.g., Weekly coding sessions, Hackathons, Guest lectures",
            required: true,
            multiline: true,
        },
        {
            key: "achievements",
            label: "Achievements",
            placeholder: "e.g., Won SIH 2025, 200+ active members, 50+ projects",
            required: false,
            multiline: true,
        },
        {
            key: "team",
            label: "Core Team Info",
            placeholder: "e.g., President: John Doe, Tech Lead: Jane Smith",
            required: false,
            multiline: true,
        },
        {
            key: "upcomingEvents",
            label: "Upcoming Events",
            placeholder: "e.g., Code Sprint on March 5, Workshop on AI on March 10",
            required: false,
            multiline: true,
        },
        {
            key: "colorScheme",
            label: "Color Preference",
            placeholder: "e.g., Blue & White, Dark theme with purple accents",
            required: false,
        },
    ],
    basePrompt: (values) => {
        let prompt = `Build a modern landing page for "${values.clubName}". `;
        prompt += `Mission: ${values.mission}. `;
        prompt += `Key activities: ${values.activities}. `;

        if (values.achievements) {
            prompt += `Achievements: ${values.achievements}. `;
        }

        if (values.team) {
            prompt += `Core team: ${values.team}. `;
        }

        if (values.upcomingEvents) {
            prompt += `Upcoming events section: ${values.upcomingEvents}. `;
        }

        if (values.colorScheme) {
            prompt += `Color scheme: ${values.colorScheme}. `;
        }

        prompt += "Make it professional yet student-friendly with engaging visuals and clear CTAs.";

        return prompt;
    },
};

const landingEventTemplate: PromptTemplate = {
    id: "landing-event",
    label: "Event Landing Page",
    description: "Create a dedicated website for your event",
    assetType: "landing",
    fields: [
        {
            key: "eventName",
            label: "Event Name",
            placeholder: "e.g., HackFest 2026",
            required: true,
        },
        {
            key: "description",
            label: "Event Description",
            placeholder: "A 48-hour hackathon bringing together 500+ developers...",
            required: true,
            multiline: true,
        },
        {
            key: "dateVenue",
            label: "Date & Venue",
            placeholder: "e.g., April 15-17, 2026 at University Convention Center",
            required: true,
        },
        {
            key: "schedule",
            label: "Event Schedule",
            placeholder: "Day 1: Kickoff & Ideation, Day 2: Building, Day 3: Demos",
            required: false,
            multiline: true,
        },
        {
            key: "prizes",
            label: "Prizes & Perks",
            placeholder: "e.g., ₹1 Lakh prize pool, Internship opportunities, Swag",
            required: false,
            multiline: true,
        },
        {
            key: "sponsors",
            label: "Sponsors",
            placeholder: "e.g., Google, Microsoft, Startup XYZ",
            required: false,
        },
        {
            key: "registrationInfo",
            label: "Registration Info",
            placeholder: "e.g., Free for students, Team size: 2-4 members",
            required: false,
        },
    ],
    basePrompt: (values) => {
        let prompt = `Create an event landing page for "${values.eventName}". `;
        prompt += `Description: ${values.description}. `;
        prompt += `Date & Venue: ${values.dateVenue}. `;

        if (values.schedule) {
            prompt += `Include schedule: ${values.schedule}. `;
        }

        if (values.prizes) {
            prompt += `Prizes: ${values.prizes}. `;
        }

        if (values.sponsors) {
            prompt += `Featured sponsors: ${values.sponsors}. `;
        }

        if (values.registrationInfo) {
            prompt += `Registration: ${values.registrationInfo}. `;
        }

        prompt += "Design should be exciting, modern, and drive registrations with clear CTAs.";

        return prompt;
    },
};

// ─── Presentation Templates ──────────────────────────────────────────────────

const presentationPitchTemplate: PromptTemplate = {
    id: "presentation-pitch",
    label: "Startup Pitch Deck",
    description: "Create a compelling pitch presentation for your startup idea",
    assetType: "presentation",
    fields: [
        {
            key: "startupName",
            label: "Startup Name",
            placeholder: "e.g., StudyBuddy AI",
            required: true,
        },
        {
            key: "tagline",
            label: "One-liner Tagline",
            placeholder: "e.g., Your AI-powered study companion",
            required: true,
        },
        {
            key: "problem",
            label: "Problem Statement",
            placeholder: "Students struggle with organizing study materials and staying focused...",
            required: true,
            multiline: true,
        },
        {
            key: "solution",
            label: "Your Solution",
            placeholder: "An AI app that creates personalized study plans and tracks progress...",
            required: true,
            multiline: true,
        },
        {
            key: "targetAudience",
            label: "Target Audience",
            placeholder: "e.g., College students aged 18-25, Competitive exam aspirants",
            required: true,
        },
        {
            key: "businessModel",
            label: "Business Model",
            placeholder: "e.g., Freemium with premium features at ₹199/month",
            required: false,
        },
        {
            key: "traction",
            label: "Traction/Milestones",
            placeholder: "e.g., 5000+ beta users, Featured in TechCrunch",
            required: false,
            multiline: true,
        },
        {
            key: "team",
            label: "Team",
            placeholder: "e.g., 3 co-founders with experience at Google and IIT",
            required: false,
        },
        {
            key: "askAmount",
            label: "Funding Ask",
            placeholder: "e.g., Seeking ₹50 Lakh seed funding",
            required: false,
        },
    ],
    basePrompt: (values) => {
        let prompt = `Create a professional pitch deck for "${values.startupName}" - ${values.tagline}. `;
        prompt += `Problem: ${values.problem}. `;
        prompt += `Solution: ${values.solution}. `;
        prompt += `Target audience: ${values.targetAudience}. `;

        if (values.businessModel) {
            prompt += `Business model: ${values.businessModel}. `;
        }

        if (values.traction) {
            prompt += `Traction: ${values.traction}. `;
        }

        if (values.team) {
            prompt += `Team: ${values.team}. `;
        }

        if (values.askAmount) {
            prompt += `Ask: ${values.askAmount}. `;
        }

        prompt += "Make it investor-ready with clean visuals, compelling storytelling, and professional design.";

        return prompt;
    },
};

const presentationProjectTemplate: PromptTemplate = {
    id: "presentation-project",
    label: "Academic Project Presentation",
    description: "Present your academic or research project professionally",
    assetType: "presentation",
    fields: [
        {
            key: "projectTitle",
            label: "Project Title",
            placeholder: "e.g., Smart Traffic Management System using IoT",
            required: true,
        },
        {
            key: "subject",
            label: "Subject/Course",
            placeholder: "e.g., Computer Networks, Final Year Project",
            required: false,
        },
        {
            key: "objective",
            label: "Objective",
            placeholder: "To develop an intelligent system that optimizes traffic flow...",
            required: true,
            multiline: true,
        },
        {
            key: "methodology",
            label: "Methodology",
            placeholder: "Using Arduino sensors, MQTT protocol, and ML algorithms...",
            required: true,
            multiline: true,
        },
        {
            key: "results",
            label: "Results/Findings",
            placeholder: "Achieved 30% reduction in average wait time at intersections...",
            required: false,
            multiline: true,
        },
        {
            key: "technologies",
            label: "Technologies Used",
            placeholder: "e.g., Python, TensorFlow, Arduino, AWS IoT",
            required: false,
        },
        {
            key: "teamMembers",
            label: "Team Members",
            placeholder: "Names and roles of team members",
            required: false,
        },
        {
            key: "guide",
            label: "Project Guide",
            placeholder: "e.g., Prof. Dr. Sharma, CS Department",
            required: false,
        },
    ],
    basePrompt: (values) => {
        let prompt = `Create an academic presentation for "${values.projectTitle}"`;

        if (values.subject) {
            prompt += ` for ${values.subject}`;
        }

        prompt += `. Objective: ${values.objective}. `;
        prompt += `Methodology: ${values.methodology}. `;

        if (values.results) {
            prompt += `Results: ${values.results}. `;
        }

        if (values.technologies) {
            prompt += `Technologies: ${values.technologies}. `;
        }

        if (values.teamMembers) {
            prompt += `Team: ${values.teamMembers}. `;
        }

        if (values.guide) {
            prompt += `Guide: ${values.guide}. `;
        }

        prompt += "Make it academic yet visually engaging with clear diagrams and professional formatting.";

        return prompt;
    },
};

const presentationWorkshopTemplate: PromptTemplate = {
    id: "presentation-workshop",
    label: "Workshop/Tutorial Slides",
    description: "Create educational slides for teaching or workshops",
    assetType: "presentation",
    fields: [
        {
            key: "topic",
            label: "Topic",
            placeholder: "e.g., Introduction to React Hooks",
            required: true,
        },
        {
            key: "audience",
            label: "Target Audience",
            placeholder: "e.g., Beginners with basic JavaScript knowledge",
            required: true,
        },
        {
            key: "learningOutcomes",
            label: "Learning Outcomes",
            placeholder: "By the end, attendees will understand useState, useEffect...",
            required: true,
            multiline: true,
        },
        {
            key: "outline",
            label: "Content Outline",
            placeholder: "1. What are Hooks? 2. useState basics 3. useEffect deep dive...",
            required: true,
            multiline: true,
        },
        {
            key: "duration",
            label: "Duration",
            placeholder: "e.g., 2 hours with hands-on exercises",
            required: false,
        },
        {
            key: "prerequisites",
            label: "Prerequisites",
            placeholder: "e.g., Basic HTML/CSS/JS, Node.js installed",
            required: false,
        },
    ],
    basePrompt: (values) => {
        let prompt = `Create workshop slides for "${values.topic}". `;
        prompt += `Target audience: ${values.audience}. `;
        prompt += `Learning outcomes: ${values.learningOutcomes}. `;
        prompt += `Content outline: ${values.outline}. `;

        if (values.duration) {
            prompt += `Duration: ${values.duration}. `;
        }

        if (values.prerequisites) {
            prompt += `Prerequisites: ${values.prerequisites}. `;
        }

        prompt += "Make it educational, easy to follow, with code examples and visual explanations.";

        return prompt;
    },
};

// ─── Export All Templates ────────────────────────────────────────────────────

export const promptTemplates: PromptTemplate[] = [
    // Posters
    posterEventTemplate,
    posterClubRecruitmentTemplate,
    // Landing Pages
    landingClubTemplate,
    landingEventTemplate,
    // Presentations
    presentationPitchTemplate,
    presentationProjectTemplate,
    presentationWorkshopTemplate,
];

// ─── Helper Functions ────────────────────────────────────────────────────────

export function getTemplatesByAssetType(assetType: AssetType): PromptTemplate[] {
    return promptTemplates.filter((t) => t.assetType === assetType);
}

export function getTemplateById(id: string): PromptTemplate | undefined {
    return promptTemplates.find((t) => t.id === id);
}

export function getDefaultTemplateForAssetType(assetType: AssetType): PromptTemplate | undefined {
    return promptTemplates.find((t) => t.assetType === assetType);
}
