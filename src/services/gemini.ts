import { GoogleGenAI, Type, Modality } from "@google/genai";
import { withStyle } from '../constants/writing-style';

const getAI = () => {
  const apiKey = process.env.RESEARCH || process.env.GEMINI_API_KEY;
  if (!apiKey) console.warn('No API key found. Set RESEARCH in .env');
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
        systemInstruction: withStyle("You are a field cryptozoologist writing expedition notes. Write as if logging observations after a long day in the field. Focus on what the creature looks like, where it lives, how it behaves, and what witnesses reported. Use specific locations and dates when available. Bold all cryptid names (e.g. **Chupacabra**, **Mothman**)."),
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
        systemInstruction: withStyle("You are a field cryptozoologist reporting on local sightings. For each creature, include the location name, any witness accounts, and what makes this area significant for sightings. Bold all cryptid names (e.g. **Chupacabra**)."),
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
      config: {
        systemInstruction: withStyle("You are a field biologist examining specimen evidence. Describe what you see in concrete terms: size estimates, coloring, anatomical features, possible species matches. If you can't identify it, say so and explain what's unusual."),
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
      systemInstruction: withStyle("You are Dr. Alistair Thorne, a cryptozoologist with 40 years of field experience. You are in Puerto Rico investigating sightings near the collapsed Arecibo Observatory. You speak English and Spanish. You have strong opinions about which sightings are credible and which are nonsense. You cite specific expeditions, dates, and locations from your career. When you don't know something, you say so. You're warm but direct, not a tour guide."),
    },
  });
};
