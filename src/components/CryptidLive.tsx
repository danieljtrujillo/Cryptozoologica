import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Volume2, VolumeX } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { cn } from '../lib/utils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function CryptidLive() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcription, setTranscription] = useState<string>("");
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are Dr. Alistair Thorne, a world-renowned cryptozoologist. You are currently in the field in Puerto Rico. You speak English and Spanish with a warm Puerto Rican accent. You are helpful, scientific, and deeply passionate about the unknown. You can help identify creatures, suggest how to attract them, and share lore from your travels. Keep your responses concise and engaging for a voice conversation.",
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
          onerror: (err) => {
            console.error(err);
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

  return (
    <div className="journal-card bg-[#5a2a27]/5 border-dashed border-2 border-[#5a2a27]/20 p-8 flex flex-col items-center space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl ink-text">Field Radio</h3>
        <p className="font-serif italic opacity-70">Direct voice link to Dr. Thorne's expedition camp.</p>
      </div>

      <div className="relative">
        <button
          onClick={isConnected ? stopSession : startSession}
          disabled={isConnecting}
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl border-4",
            isConnected ? "bg-[#8b0000] border-[#8b0000]/20 animate-pulse" : "bg-[#5a2a27] border-[#5a2a27]/20 hover:scale-105"
          )}
        >
          {isConnecting ? (
            <Loader2 className="text-[#f5f2ed] animate-spin" size={40} />
          ) : isConnected ? (
            <MicOff className="text-[#f5f2ed]" size={40} />
          ) : (
            <Mic className="text-[#f5f2ed]" size={40} />
          )}
        </button>
        {isConnected && (
          <div className="absolute -bottom-2 -right-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-[#fdfcf0] border border-[#d4c5b9] rounded-full text-[#5a2a27] shadow-md"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        )}
      </div>

      <div className="w-full max-w-md bg-[#fdfcf0]/50 p-4 rounded-sm border border-[#d4c5b9] min-h-[60px] flex items-center justify-center">
        <p className="font-serif italic text-sm text-center opacity-60">
          {isConnected ? (isMuted ? "Radio muted..." : "Listening for your voice...") : "Radio offline. Click to connect."}
        </p>
      </div>

      {transcription && (
        <div className="w-full max-w-md p-4 bg-[#fdfcf0] border border-[#d4c5b9] rounded-sm shadow-inner">
          <p className="text-xs uppercase tracking-widest opacity-50 mb-2">Radio Log</p>
          <p className="font-serif italic text-sm ink-text leading-relaxed">{transcription}</p>
        </div>
      )}
    </div>
  );
}
