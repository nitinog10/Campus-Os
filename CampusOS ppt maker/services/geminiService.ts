
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Presentation, Slide } from "../types";

const API_KEY = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generatePresentationDraft = async (topic: string): Promise<Presentation> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a professional presentation outline for the topic: "${topic}". Max 6 slides. 
    For each slide, provide:
    1. A title.
    2. 3-4 bullet points of content.
    3. A descriptive prompt for a professional image visual.
    4. A detailed "speaker note" or "script" that the presenter should say for this slide (about 100 words).
    5. A professional layout recommendation.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          slides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                content: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                imagePrompt: { type: Type.STRING },
                speakerNotes: { type: Type.STRING },
                layout: { 
                  type: Type.STRING,
                  enum: ['left', 'right', 'center']
                }
              },
              required: ['id', 'title', 'content', 'imagePrompt', 'layout', 'speakerNotes']
            }
          }
        },
        required: ['topic', 'slides']
      },
    },
  });

  const jsonStr = response.text.trim();
  return JSON.parse(jsonStr) as Presentation;
};

export const generateSlideImage = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `Professional, high-quality, high-resolution presentation slide visual for: ${prompt}. Cinematic lighting, minimalist, visually striking, abstract or representative but clean.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate image");
};
