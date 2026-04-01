import React, { useState, useEffect } from 'react';
import { Coins, ExternalLink, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function FundingGuard({ children }: { children: React.ReactNode }) {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    const masterKey = process.env.RESEARCH;
    if (masterKey) {
      setHasKey(true);
      return;
    }

    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    } else {
      // Fallback for local dev if window.aistudio is missing
      setHasKey(true);
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success as per guidelines to avoid race conditions
      setHasKey(true);
    }
  };

  if (hasKey === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e8dcc4]">
        <Loader2 className="animate-spin text-[#5a2a27]" size={48} />
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e8dcc4] p-4">
        <div className="journal-card max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-[#5a2a27]/10 rounded-full flex items-center justify-center mx-auto">
            <Coins className="text-[#5a2a27]" size={40} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl ink-text">Expedition Funding</h2>
            <p className="font-serif italic opacity-70">
              To visualize the unknown and transmit sketches from the field, we require verified research funding.
            </p>
          </div>

          <div className="p-4 bg-[#5a2a27]/5 border border-dashed border-[#5a2a27]/30 rounded-sm text-sm font-serif italic text-left space-y-3">
            <p>• Advanced imaging requires a paid Gemini API key.</p>
            <p>• Your key will be used to generate archetypal sketches and analyze field specimens.</p>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-[#7a1a1a] hover:underline"
            >
              <span>Learn about Research Grants (Billing)</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <button
            onClick={handleSelectKey}
            className="btn-journal w-full py-4 text-xl"
          >
            Authorize Funding
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
