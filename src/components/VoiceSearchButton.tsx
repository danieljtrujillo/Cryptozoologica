import React, { useState, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '../lib/utils';

interface VoiceSearchButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export default function VoiceSearchButton({ onTranscript, className }: VoiceSearchButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    startListening();
  };

  const handleMouseUp = () => {
    stopListening();
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      className={cn(
        "border border-[#5a2a27] text-[#5a2a27] hover:bg-[#5a2a27] hover:text-[#f5f2ed] transition-all duration-300 rounded-sm",
        isListening && "bg-[#8b0000] text-[#f5f2ed] animate-pulse",
        className
      )}
      title="Hold to speak"
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
}
