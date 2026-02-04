import { GoogleGenerativeAI } from "@google/generative-ai";
import { Presentation } from "@/types/presentation";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Demo presentation data for when API quota is exceeded
const getDemoPresentation = (topic: string): Presentation => ({
  topic,
  slides: [
    {
      id: "1",
      title: `Introduction to ${topic}`,
      content: ["Overview of key concepts", "Why this topic matters today", "What you'll learn"],
      imagePrompt: "Modern abstract introduction slide",
      speakerNotes: `Welcome everyone! Today we'll explore ${topic}. This presentation will cover the fundamental aspects and help you understand why this topic is so important in today's world.`,
      layout: "center"
    },
    {
      id: "2", 
      title: "Key Concepts",
      content: ["First major concept and its importance", "Second concept with real-world applications", "Third concept and future implications"],
      imagePrompt: "Conceptual diagram with interconnected ideas",
      speakerNotes: "Let's dive into the key concepts. Understanding these fundamentals will give you a solid foundation for the rest of our discussion.",
      layout: "left"
    },
    {
      id: "3",
      title: "Current Trends",
      content: ["Latest developments in the field", "Statistics and data insights", "Expert opinions and forecasts"],
      imagePrompt: "Modern trends infographic with charts",
      speakerNotes: "Now let's look at what's happening right now. The latest trends show significant growth and interesting developments that are shaping the future.",
      layout: "right"
    },
    {
      id: "4",
      title: "Challenges & Solutions",
      content: ["Main challenges we face today", "Innovative solutions being developed", "How individuals can contribute"],
      imagePrompt: "Problem solving concept with light bulb",
      speakerNotes: "Of course, there are challenges to address. But with every challenge comes opportunity for innovation and improvement.",
      layout: "left"
    },
    {
      id: "5",
      title: "Case Studies",
      content: ["Real-world success story #1", "Lessons learned from implementation", "Best practices to follow"],
      imagePrompt: "Success case study with professional imagery",
      speakerNotes: "Let me share some real-world examples that demonstrate these concepts in action. These case studies provide valuable insights we can all learn from.",
      layout: "right"
    },
    {
      id: "6",
      title: "Conclusion & Next Steps",
      content: ["Summary of key takeaways", "Recommended actions", "Resources for further learning"],
      imagePrompt: "Forward looking conclusion with path ahead",
      speakerNotes: `In conclusion, ${topic} is a fascinating and important area. I encourage you to explore further and apply what you've learned today. Thank you for your attention!`,
      layout: "center"
    }
  ]
});

export const generatePresentationDraft = async (topic: string): Promise<Presentation> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Generate a professional presentation outline for the topic: "${topic}". Create exactly 6 slides.
    
For each slide, provide:
1. A unique id (like "1", "2", etc.)
2. A compelling title
3. 3-4 bullet points of content (as an array of strings)
4. A descriptive imagePrompt for a professional visual
5. Detailed speakerNotes (about 100 words) for what the presenter should say
6. A layout: either "left", "right", or "center"

Return ONLY valid JSON with no markdown formatting, in this exact structure:
{
  "topic": "${topic}",
  "slides": [
    {
      "id": "1",
      "title": "Introduction",
      "content": ["Point 1", "Point 2", "Point 3"],
      "imagePrompt": "A professional image showing...",
      "speakerNotes": "Welcome everyone. Today we will discuss...",
      "layout": "center"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();
    
    // Clean up the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    
    const parsed = JSON.parse(text) as Presentation;
    return parsed;
  } catch (error) {
    console.error("Error generating presentation, using demo data:", error);
    // Return demo presentation when API fails (quota exceeded, etc.)
    return getDemoPresentation(topic);
  }
};

export const generateSlideImage = async (prompt: string): Promise<string> => {
  // Using placeholder images from Unsplash since Gemini text models don't generate images
  const placeholderImages = [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&h=720&fit=crop',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&h=720&fit=crop',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1280&h=720&fit=crop',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1280&h=720&fit=crop',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1280&h=720&fit=crop',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1280&h=720&fit=crop',
  ];
  
  return placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
};
