import { GoogleGenAI, Type, Modality, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const searchCryptid = async (query: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide a detailed scientific journal entry for the cryptid: ${query}. Include its appearance, habitat, behavior, and any known sightings.`,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are a seasoned cryptozoologist writing a scientific expedition journal. Use a formal yet adventurous tone. Focus on biological and ecological aspects.",
    },
  });
  return response.text;
};

export const searchNearbyCryptids = async (lat: number, lng: number) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `What cryptids are reported near these coordinates: ${lat}, ${lng}? Focus on the Florida and Puerto Rico area, specifically near Arecibo if relevant.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng }
        }
      }
    },
  });
  
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  return {
    text: response.text,
    sources: groundingChunks?.map(chunk => chunk.maps?.uri).filter(Boolean) || []
  };
};

export const generateCryptidSketch = async (description: string, size: "1K" | "2K" | "4K" = "1K") => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        {
          text: `A detailed scientific field sketch of a cryptid: ${description}. The style should be hand-drawn with reddish-brown ink on aged, yellowish parchment paper. Include anatomical annotations and a scale bar.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4",
        imageSize: size
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const identifyCryptid = async (base64Image: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: "image/jpeg" } },
        { text: "Identify the cryptid in this image. If it's a new one, suggest a scientific name and describe its characteristics." }
      ]
    },
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });
  return response.text;
};

export const speakJournalEntry = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this journal entry with a seasoned, slightly weathered explorer's voice: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Fenrir' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    const binary = atob(base64Audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/pcm;rate=24000' });
    return URL.createObjectURL(blob);
  }
  return null;
};

export const createCryptidChat = () => {
  return ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: "You are Dr. Alistair Thorne, a world-renowned cryptozoologist with 40 years of field experience. You are currently in Puerto Rico investigating sightings near the Arecibo Observatory. You speak English and Spanish (with a warm Puerto Rican accent when appropriate). You are helpful, scientific, and deeply passionate about the unknown. You can help identify creatures, suggest how to attract them, and share lore from your travels.",
    },
  });
};
