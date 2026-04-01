import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Loader2, KeyRound, AlertTriangle } from 'lucide-react';

declare global {
  interface Window {
    aistudio?: {
      openSelectKey: () => void;
    };
  }
}

interface FundingGuardProps {
  children: React.ReactNode;
}

export default function FundingGuard({ children }: FundingGuardProps) {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    setChecking(true);
    const masterKey = process.env.RESEARCH;
    const apiKey = masterKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Check if running in AI Studio environment
      if (window.aistudio) {
        // In AI Studio, the key might be injected later
        setHasKey(true);
      } else {
        // Local development - allow through for testing
        console.warn("No API key found. Running in local dev mode.");
        setHasKey(true);
      }
      setChecking(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      // Quick validation call
      await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Reply with only the word: OK",
      });
      setHasKey(true);
    } catch (err: any) {
      const errorMsg = err?.message || "";
      if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("PERMISSION_DENIED") || errorMsg.includes("API_KEY_INVALID")) {
        setHasKey(false);
        if (window.aistudio) {
          window.aistudio.openSelectKey();
        }
      } else {
        // Other errors (network, etc.) - let the user through
        console.warn("API key check failed with non-auth error:", err);
        setHasKey(true);
      }
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f2ed]">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin mx-auto text-[#5a2a27]" size={48} />
          <p className="font-serif italic text-[#5a2a27] opacity-70">Verifying expedition credentials...</p>
        </div>
      </div>
    );
  }

  if (hasKey === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f2ed] p-8">
        <div className="journal-card max-w-md text-center space-y-6">
          <AlertTriangle className="mx-auto text-[#8b0000]" size={48} />
          <h2 className="text-2xl ink-text">Expedition Funding Required</h2>
          <p className="font-serif italic opacity-70">
            A valid Gemini API key is required to access The Cryptid Journal's archives.
          </p>
          <button
            onClick={checkApiKey}
            className="btn-journal flex items-center justify-center space-x-2 mx-auto"
          >
            <KeyRound size={18} />
            <span>Retry Verification</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
