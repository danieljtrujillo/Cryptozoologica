import { GoogleGenAI, Type, Modality, ThinkingLevel } from "@google/genai";

const getAI = () => {
  const masterKey = process.env.RESEARCH;
  const apiKey = masterKey || process.env.GEMINI_API_KEY;
  return new GoogleGenAI({ apiKey });
};

const handleApiError = (error: any) => {
  const errorMsg = error?.message || "";
  if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("PERMISSION_DENIED")) {
    if (window.aistudio) {
      window.aistudio.openSelectKey();
    }
  }
  throw error;
};

export const searchCryptid = async (query: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a detailed scientific journal entry for the cryptid: ${query}. Include its appearance, habitat, behavior, and any known sightings. Also, provide a very brief, 1-sentence physical description of the creature at the end of your response, prefixed with 'IMAGE_PROMPT: '.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a seasoned cryptozoologist writing a scientific expedition journal. Use a formal yet adventurous tone. Focus on biological and ecological aspects.",
      },
    });
    
    const text = response.text;
    const imagePromptMatch = text.match(/IMAGE_PROMPT: (.*)/);
    const imagePrompt = imagePromptMatch ? imagePromptMatch[1] : query;
    const cleanText = text.replace(/IMAGE_PROMPT: .*/, '').trim();

    // Generate a sketch based on the prompt
    const imageUrl = await generateCryptidSketch(imagePrompt);

    return { text: cleanText, imageUrl };
  } catch (error) {
    return handleApiError(error);
  }
};

export const searchNearbyCryptids = async (lat: number, lng: number) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What cryptids are reported near these coordinates: ${lat}, ${lng}? Focus on Florida, Puerto Rico (the municipality near Arecibo, NOT the US state) and the surrounding karst region.`,
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
  } catch (error) {
    return handleApiError(error);
  }
};

export const generateCryptidSketch = async (description: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            text: `A professional scientific field sketch of a cryptid: ${description}. 
            The style MUST show the artist's process: include light, rough, graphite-like "construction lines" or "starting lines" that establish the basic shapes and proportions (circles for joints, ovals for torso) underneath the final detailed ink work. 
            Use reddish-brown ink for the final details on aged, yellowish parchment paper. 
            Include anatomical annotations, handwritten notes, and a scale bar. 
            The sketch should look like it was drawn quickly but accurately in a field journal.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4",
          imageSize: "1K"
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image generation failed:", error);
    return handleApiError(error);
  }
  return null;
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
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });
    return response.text;
  } catch (error) {
    return handleApiError(error);
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

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createCryptidChat = () => {
  const ai = getAI();
  return ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: "You are Dr. Alistair Thorne, a world-renowned cryptozoologist with 40 years of field experience. You are currently in Florida, Puerto Rico (the municipality near Arecibo, NOT the US state) investigating sightings near the Arecibo Observatory. You speak English and Spanish (with a warm Puerto Rican accent when appropriate). You are helpful, scientific, and deeply passionate about the unknown. You can help identify creatures, suggest how to attract them, and share lore from your travels. If asked about Florida, clarify you are in the Puerto Rican municipality.",
    },
  });
};
