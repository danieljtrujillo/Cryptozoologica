import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2, Volume2, VolumeX, ImageIcon, Sparkles } from 'lucide-react';
import { GoogleGenAI, Modality, type LiveServerMessage } from '@google/genai';
import { cn } from '../lib/utils';
import { generateCryptidSketch } from '../services/gemini';

function getApiKey(): string {
  const research = (typeof process !== 'undefined' && process.env?.RESEARCH) || '';
  const gemini = import.meta.env.VITE_GEMINI_API_KEY || '';
  return research || gemini;
}

export default function CryptidLive() {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [sketchUrl, setSketchUrl] = useState<string | null>(null);
  const [sketchLoading, setSketchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'es'>('en');

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  const systemInstructions: Record<string, string> = {
    en: "You are a cryptozoology field expert on a live radio channel. Speak dramatically and knowledgeably about cryptids, monsters, and unexplained creatures. Keep responses concise for voice. Reference folklore, witness accounts, and your own 'field experience'.",
    es: "Eres un experto en criptozoología en un canal de radio en vivo. Habla dramáticamente y con conocimiento sobre críptidos, monstruos y criaturas inexplicables. Mantén las respuestas concisas para voz. Referencia folclore, testimonios de testigos y tu propia 'experiencia de campo'. Responde siempre en español."
  };

  const connect = useCallback(async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      const msg = 'No API key found. Please set VITE_GEMINI_API_KEY.';
      setError(msg);
      if ((window as any).aistudio?.setError) (window as any).aistudio.setError(msg);
      return;
    }
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const session = await ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: [Modality.AUDIO, Modality.TEXT],
          systemInstruction: systemInstructions[language],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orus' } } }
        },
        callbacks: {
          onopen: () => setIsConnected(true),
          onmessage: (msg: LiveServerMessage) => {
            if (msg.serverContent?.modelTurn?.parts) {
              for (const part of msg.serverContent.modelTurn.parts) {
                if (part.text) setResponse(prev => prev + part.text);
                if (part.inlineData?.data) {
                  const pcm = base64ToPcm(part.inlineData.data);
                  audioQueueRef.current.push(pcm);
                  if (!isPlayingRef.current) playAudioQueue();
                }
              }
            }
            if (msg.serverContent?.turnComplete) setIsSpeaking(false);
          },
          onerror: (e: any) => {
            console.error('Live error:', e);
            setError(e.message || 'Connection error');
            if ((window as any).aistudio?.setError) (window as any).aistudio.setError(e.message);
          },
          onclose: () => {
            setIsConnected(false);
            setIsListening(false);
          }
        }
      });
      sessionRef.current = session;
    } catch (err: any) {
      const msg = err.message || 'Failed to connect';
      setError(msg);
      if ((window as any).aistudio?.setError) (window as any).aistudio.setError(msg);
    }
  }, [language]);

  const disconnect = useCallback(() => {
    sessionRef.current?.close();
    sessionRef.current = null;
    stopMic();
    setIsConnected(false);
  }, []);

  useEffect(() => { return () => { disconnect(); }; }, []);

  const base64ToPcm = (b64: string): Float32Array => {
    const raw = atob(b64);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    const pcm16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) float32[i] = pcm16[i] / 32768;
    return float32;
  };

  const playAudioQueue = async () => {
    if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    isPlayingRef.current = true;
    setIsSpeaking(true);
    while (audioQueueRef.current.length > 0) {
      const chunk = audioQueueRef.current.shift()!;
      const buf = audioContextRef.current.createBuffer(1, chunk.length, 24000);
      buf.getChannelData(0).set(chunk);
      const src = audioContextRef.current.createBufferSource();
      src.buffer = buf;
      src.connect(audioContextRef.current.destination);
      src.start();
      await new Promise(r => src.onended = r);
    }
    isPlayingRef.current = false;
    setIsSpeaking(false);
  };

  const startMic = async () => {
    if (!sessionRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
      streamRef.current = stream;
      const ac = new AudioContext({ sampleRate: 16000 });
      await ac.audioWorklet.addModule(
        URL.createObjectURL(new Blob([`
          class PCMProcessor extends AudioWorkletProcessor {
            process(inputs) {
              const input = inputs[0][0];
              if (input) this.port.postMessage(input);
              return true;
            }
          }
          registerProcessor('pcm-processor', PCMProcessor);
        `], { type: 'application/javascript' }))
      );
      const src = ac.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(ac, 'pcm-processor');
      worklet.port.onmessage = (e) => {
        const float32: Float32Array = e.data;
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) int16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32768));
        const bytes = new Uint8Array(int16.buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        const b64 = btoa(binary);
        sessionRef.current?.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: b64 } });
      };
      src.connect(worklet);
      worklet.connect(ac.destination);
      workletNodeRef.current = worklet;
      setIsListening(true);
      setResponse('');
    } catch (err: any) {
      setError('Microphone access denied');
    }
  };

  const stopMic = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    workletNodeRef.current?.disconnect();
    workletNodeRef.current = null;
    setIsListening(false);
  };

  const generateSketch = async () => {
    if (!response) return;
    setSketchLoading(true);
    try {
      const url = await generateCryptidSketch(response.substring(0, 500));
      setSketchUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setSketchLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl ink-text">Cryptid Live</h2>
          <p className="font-serif italic opacity-70 text-sm md:text-base">Real-time voice channel to the field.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setLanguage(l => l === 'en' ? 'es' : 'en')} className="btn-journal text-sm px-3 py-1">
            {language === 'en' ? '🇺🇸 EN' : '🇪🇸 ES'}
          </button>
          {!isConnected ? (
            <button onClick={connect} className="btn-journal flex items-center space-x-2">
              <Sparkles size={18} />
              <span>Go Live</span>
            </button>
          ) : (
            <button onClick={disconnect} className="btn-journal flex items-center space-x-2 opacity-70">
              <span>Disconnect</span>
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="journal-card border-red-800/30 bg-red-950/10 text-red-900">
          <p className="font-serif italic">{error}</p>
        </div>
      )}

      {isConnected && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <button
              onMouseDown={startMic}
              onMouseUp={stopMic}
              onMouseLeave={stopMic}
              onTouchStart={startMic}
              onTouchEnd={stopMic}
              className={cn(
                "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl",
                isListening
                  ? "bg-[#8b0000] scale-110 ring-4 ring-[#8b0000]/30 animate-pulse"
                  : "bg-[#5a2a27] hover:bg-[#8b0000] hover:scale-105"
              )}
            >
              {isListening ? <Mic size={48} className="text-white" /> : <MicOff size={48} className="text-white/70" />}
            </button>
          </div>
          <p className="text-center font-serif italic opacity-50 text-sm">
            {isListening ? 'Transmitting... Release to send.' : 'Hold to speak into the field radio.'}
          </p>

          {isSpeaking && (
            <div className="flex items-center justify-center space-x-2 text-[#5a2a27]">
              <Volume2 size={20} className="animate-pulse" />
              <span className="font-serif italic text-sm">Receiving transmission...</span>
            </div>
          )}

          {response && (
            <div className="journal-card space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="ink-text text-lg">Transcript</h3>
                <button
                  onClick={generateSketch}
                  disabled={sketchLoading}
                  className="btn-journal text-sm flex items-center space-x-1 px-3 py-1"
                >
                  {sketchLoading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                  <span>Sketch</span>
                </button>
              </div>
              <p className="font-serif italic leading-relaxed whitespace-pre-wrap break-words">{response}</p>
              {sketchUrl && (
                <div className="border-4 border-[#5a2a27]/10 p-2 bg-white/30 max-w-sm mx-auto">
                  <img src={sketchUrl} alt="Cryptid sketch" className="w-full grayscale contrast-125 sepia-[.3]" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!isConnected && !error && (
        <div className="text-center py-20 opacity-30 italic font-serif">
          <p>Press "Go Live" to open the field channel.</p>
        </div>
      )}
    </div>
  );
}
