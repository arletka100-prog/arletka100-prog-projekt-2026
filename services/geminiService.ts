
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Category, NewsItem, GroundingSource } from "../types";

const API_KEY = process.env.API_KEY || '';

export const fetchNewsByCategory = async (category: Category): Promise<NewsItem[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `Provide the top 3 most important and detailed news stories from Poland today specifically regarding the category: ${category}. 
  The response must be in English. 
  For each story, provide:
  - A catchy title
  - A 2-sentence summary
  - A detailed 3-paragraph report
  - A representative image description for a placeholder`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            content: { type: Type.STRING },
            imageDesc: { type: Type.STRING }
          },
          required: ["title", "summary", "content", "imageDesc"]
        }
      }
    }
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources: GroundingSource[] = groundingChunks
    .filter(chunk => chunk.web)
    .map(chunk => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri || '#'
    }));

  try {
    const rawData = JSON.parse(response.text);
    return rawData.map((item: any, index: number) => ({
      id: `${category}-${Date.now()}-${index}`,
      title: item.title,
      summary: item.summary,
      content: item.content,
      category,
      timestamp: new Date().toLocaleTimeString(),
      sources: sources.slice(0, 3), // Attach relevant sources
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(item.title)}/800/450`
    }));
  } catch (e) {
    console.error("Failed to parse news JSON", e);
    throw new Error("Failed to load briefing data.");
  }
};

export const generateSpeech = async (text: string): Promise<Uint8Array> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this news report professionally: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data generated");
  
  return decodeBase64(base64Audio);
};

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
