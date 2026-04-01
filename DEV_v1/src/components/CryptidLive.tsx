import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Volume2, VolumeX, Image as ImageIcon, Sparkles } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { cn } from '../lib/utils';
import { generateCryptidSketch } from '../services/gemini';

const getApiKey = () => {
  const masterKey = process.env.RESEARCH;
  return masterKey || process.env.GEMINI_API_KEY;
};

export default function CryptidLive() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [transcription, setTranscription] = useState<string>("");
  const [currentSketch, setCurrentSketch] = useState<string | null>(null);
  const [isSketching, setIsSketching] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const startSession = async () => {
    setIsConnecting(true);
    const systemInstruction = language === 'en' 
      ? "You are Dr. Alistair Thorne, a world-renowned cryptozoologist. You speak English with a seasoned, scientific tone. You are helpful and deeply passionate about the unknown. Keep your responses concise and engaging for a voice conversation."
      : "Eres el Dr. Alistair Thorne, un criptozoólogo de renombre mundial. Hablas español con un cálido acento puertorriqueño. Eres servicial, científico y profundamente apasionado por lo desconocido. Mantén tus respuestas concisas y atractivas para una conversación de voz.";

    try {
      const apiKey = getApiKey();
      const ai = new GoogleGenAI({ apiKey });
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Fenrir" } },
          },
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            startMic();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              playAudio(base64Audio);
            }
            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              setTranscription(prev => prev + " " + message.serverContent?.modelTurn?.parts?.[0]?.text);
            }
          },
          onclose: () => {
            stopSession();
          },
          onerror: (err: any) => {
            console.error(err);
            const errorMsg = err?.message || "";
            if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("PERMISSION_DENIED")) {
              if (window.aistudio) {
                window.aistudio.openSelectKey();
              }
            }
            stopSession();
          }
        }
      });
      sessionRef.current = session;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    sessionRef.current?.close();
    sessionRef.current = null;
    setIsConnected(false);
    stopMic();
  };

  const startMic = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
    processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

    processorRef.current.onaudioprocess = (e) => {
      if (isMuted) return;
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
      }
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
      sessionRef.current?.sendRealtimeInput({
        audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
      });
    };

    sourceRef.current.connect(processorRef.current);
    processorRef.current.connect(audioContextRef.current.destination);
  };

  const stopMic = () => {
    sourceRef.current?.disconnect();
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
    sourceRef.current = null;
    processorRef.current = null;
    audioContextRef.current = null;
  };

  const playAudio = (base64Data: string) => {
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const pcmData = new Int16Array(bytes.buffer);
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 0x7FFF;
    }

    const playCtx = new AudioContext({ sampleRate: 24000 });
    const buffer = playCtx.createBuffer(1, floatData.length, 24000);
    buffer.getChannelData(0).set(floatData);
    const source = playCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(playCtx.destination);
    source.start();
  };

  const handlePress = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isConnected && !isConnecting) {
      await startSession();
    }
    setIsMuted(false);
  };

  const handleRelease = () => {
    setIsMuted(true);
  };

  return (
    <div className="journal-card bg-[#5a2a27]/5 border-dashed border-2 border-[#5a2a27]/20 p-6 md:p-8 flex flex-col items-center space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl ink-text">Field Radio</h3>
        <p className="font-serif italic opacity-70 text-sm md:text-base">Direct voice link to Dr. Thorne's expedition camp.</p>
      </div>

      <div className="flex space-x-2 mb-4">
        {[
          { id: 'en', label: 'English' },
          { id: 'es', label: 'Español' },
        ].map((lang) => (
          <button
            key={lang.id}
            onClick={() => setLanguage(lang.id as any)}
            disabled={isConnected}
            className={cn(
              "px-3 py-1 text-xs font-serif italic border border-[#5a2a27] transition-all duration-300",
              language === lang.id ? "bg-[#5a2a27] text-[#f5f2ed]" : "text-[#5a2a27] hover:bg-[#5a2a27]/10",
              isConnected && "opacity-50 cursor-not-allowed"
            )}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <button
          onMouseDown={handlePress}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          onTouchStart={handlePress}
          onTouchEnd={handleRelease}
          disabled={isConnecting}
          className={cn(
            "w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-xl border-4",
            isConnected && !isMuted ? "bg-[#8b0000] border-[#8b0000]/20 animate-pulse scale-110" : "bg-[#5a2a27] border-[#5a2a27]/20 hover:scale-105"
          )}
        >
          {isConnecting ? (
            <Loader2 className="text-[#f5f2ed] animate-spin" size={32} />
          ) : isConnected && !isMuted ? (
            <>
              <Mic className="text-[#f5f2ed]" size={32} />
              <span className="text-[10px] text-[#f5f2ed] font-bold mt-1 uppercase">Live</span>
            </>
          ) : (
            <>
              <Mic className="text-[#f5f2ed]" size={32} />
              <span className="text-[10px] text-[#f5f2ed] font-bold mt-1 uppercase">Hold</span>
            </>
          )}
        </button>
        {isConnected && (
          <div className="absolute -bottom-2 -right-2">
            <button
              onClick={stopSession}
              className="p-2 bg-[#fdfcf0] border border-[#8b0000] rounded-full text-[#8b0000] shadow-md hover:bg-[#8b0000] hover:text-white transition-colors"
              title="Disconnect"
            >
              <MicOff size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="w-full max-w-md bg-[#fdfcf0]/50 p-4 rounded-sm border border-[#d4c5b9] min-h-[60px] flex items-center justify-center">
        <p className="font-serif italic text-xs md:text-sm text-center opacity-60">
          {!isConnected ? "Radio offline. Press and hold to connect." : (isMuted ? "Radio connected. Hold to speak." : "Transmitting...")}
        </p>
      </div>

      {transcription && (
        <div className="w-full max-w-md space-y-4">
          <div className="doc-typewriter relative group shadow-lg">
            <div className="absolute top-2 left-4 text-[10px] uppercase tracking-widest opacity-30 font-sans">Radio Transcript - {new Date().toLocaleDateString()}</div>
            <p className="mt-6 font-typewriter text-sm md:text-base leading-relaxed break-words overflow-hidden">{transcription}</p>
            
            <button
              onClick={async () => {
                setIsSketching(true);
                const sketch = await generateCryptidSketch(transcription);
                setCurrentSketch(sketch);
                setIsSketching(false);
              }}
              disabled={isSketching}
              className="absolute top-2 right-2 p-2 text-[#5a2a27] hover:bg-[#5a2a27]/10 rounded-full transition-all"
              title="Request Sketch from Dr. Thorne"
            >
              {isSketching ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={16} />}
            </button>
          </div>

          {currentSketch && (
            <div className="journal-card animate-in zoom-in-95 duration-500">
              <div className="border-4 border-[#5a2a27]/20 p-2 bg-white/50 -rotate-1 shadow-inner relative">
                <img 
                  src={currentSketch} 
                  alt="Dr. Thorne's Sketch" 
                  className="w-full h-auto grayscale contrast-125 sepia-[.5]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2 bg-[#5a2a27] text-[#f5f2ed] p-1 rounded-full">
                  <Sparkles size={12} />
                </div>
              </div>
              <p className="text-[10px] text-center italic opacity-60 mt-2">Sketch transmitted via Field Radio</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
