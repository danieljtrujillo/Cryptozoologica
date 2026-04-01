import { GoogleGenAI, Type, Modality } from "@google/genai";

declare global {
  interface Window {
    aistudio?: {
      openSelectKey: () => void;
    };
  }
}

const getAI = () => {
  const masterKey = process.env.RESEARCH;
  const apiKey = masterKey || process.env.GEMINI_API_KEY;
  return new GoogleGenAI({ apiKey });
};

const handleApiError = (err: any) => {
  const errorMsg = err?.message || "";
  if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("PERMISSION_DENIED")) {
    if (window.aistudio) {
      window.aistudio.openSelectKey();
    }
  }
  throw err;
};

export const searchCryptid = async (query: string): Promise<{ text: string; imageUrl: string | null }> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a detailed scientific journal entry for the cryptid: ${query}. Include its appearance, habitat, behavior, and any known sightings. Bold all proper names of cryptids that appear in your entry.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a seasoned cryptozoologist writing a scientific expedition journal. Use a formal yet adventurous tone. Focus on biological and ecological aspects. Bold all cryptid names (e.g. **Chupacabra**, **Mothman**).",
      },
    });

    let imageUrl: string | null = null;
    try {
      const sketchAi = getAI();
      const sketchResponse = await sketchAi.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: `A detailed scientific field sketch of the cryptid "${query}". Hand-drawn with reddish-brown ink on aged, yellowish parchment paper. Include anatomical annotations.`,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });
      for (const part of sketchResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (sketchErr) {
      console.warn("Sketch generation failed, proceeding without image:", sketchErr);
    }

    return { text: response.text || "", imageUrl };
  } catch (err) {
    handleApiError(err);
    return { text: "", imageUrl: null };
  }
};

export const searchNearbyCryptids = async (lat: number, lng: number) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What cryptids, folklore creatures, or unexplained phenomena are reported near these coordinates: ${lat}, ${lng}? Bold all cryptid names.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a cryptozoologist. Provide information about local cryptid sightings and folklore near these coordinates. Bold all cryptid names (e.g. **Chupacabra**).",
      },
    });
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    return {
      text: response.text || "",
      sources: groundingChunks?.map((chunk: any) => chunk.web?.uri || chunk.maps?.uri).filter(Boolean) || []
    };
  } catch (err) {
    handleApiError(err);
    return { text: "", sources: [] };
  }
};

export const generateCryptidSketch = async (description: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: `A detailed scientific field sketch of a cryptid: ${description}. The style should be hand-drawn with reddish-brown ink on aged, yellowish parchment paper. Include anatomical annotations and a scale bar.`,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (err) {
    handleApiError(err);
    return null;
  }
};

export const identifyCryptid = async (base64Image: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: "image/jpeg" } },
          { text: "Identify the cryptid in this image. If it's a new one, suggest a scientific name and describe its characteristics." }
        ]
      },
    });
    return response.text || "";
  } catch (err) {
    handleApiError(err);
    return "";
  }
};

export const speakJournalEntry = async (text: string) => {
  try {
    const ai = getAI();
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
    return base64Audio || null;
  } catch (err) {
    handleApiError(err);
    return null;
  }
};

export const createCryptidChat = () => {
  const ai = getAI();
  return ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: "You are Dr. Alistair Thorne, a world-renowned cryptozoologist with 40 years of field experience. You are currently in Puerto Rico investigating sightings near the Arecibo Observatory. You speak English and Spanish (with a warm Puerto Rican accent when appropriate). You are helpful, scientific, and deeply passionate about the unknown. You can help identify creatures, suggest how to attract them, and share lore from your travels.",
    },
  });
};
