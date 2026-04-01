import React, { useState, useRef, useEffect } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface VoiceSearchButtonProps {
  onTranscript: (transcript: string) => void;
  className?: string;
  isListening?: boolean;
}

export default function VoiceSearchButton({ onTranscript, className, isListening: externalIsListening }: VoiceSearchButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const holdTimerRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, [onTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
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
      type="button"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      className={cn(
        "p-2 rounded-full transition-all duration-300",
        isListening || externalIsListening ? "bg-[#8b0000] text-white animate-pulse scale-110" : "text-[#5a2a27] hover:bg-[#5a2a27]/10",
        className
      )}
      title="Press and hold to speak"
    >
      {isListening || externalIsListening ? <Loader2 className="animate-spin" size={20} /> : <Mic size={20} />}
    </button>
  );
}
