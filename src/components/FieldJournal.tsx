import React, { useState, useEffect } from 'react';
import { Search, Volume2, Loader2, Book, Bookmark, Check, ChevronRight, UserX, X, Archive } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { searchCryptid, speakJournalEntry } from '../services/gemini';
import { useAuth } from '../lib/auth';
import { apiPost } from '../lib/api';
import { PREFILLED_CRYPTIDS, CryptidEntry } from '../constants/cryptids';
import { cn } from '../lib/utils';
import { CryptidLink } from './CryptidLink';
import { motion, AnimatePresence } from 'motion/react';

import VoiceSearchButton from './VoiceSearchButton';

export default function FieldJournal({ 
  initialSearch, 
  onSearchCleared,
  showArchiveMenu,
  onCloseArchiveMenu
}: { 
  initialSearch?: string | null; 
  onSearchCleared?: () => void;
  showArchiveMenu?: boolean;
  onCloseArchiveMenu?: () => void;
}) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [entry, setEntry] = useState<{ text: string; imageUrl: string | null; isPrefilled?: boolean; researcher?: string; style?: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialSearch) {
      const prefilled = PREFILLED_CRYPTIDS.find(c => c.name.toLowerCase() === initialSearch.toLowerCase());
      if (prefilled) {
        loadPrefilled(prefilled);
      } else {
        handleSearch(undefined, initialSearch);
      }
      if (onSearchCleared) onSearchCleared();
    }
  }, [initialSearch]);

  const handleSearch = async (e?: React.FormEvent, searchQuery?: string) => {
    if (e) e.preventDefault();
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;
    
    // Check if it's a prefilled cryptid first
    const prefilled = PREFILLED_CRYPTIDS.find(c => c.name.toLowerCase() === finalQuery.toLowerCase());
    if (prefilled) {
      loadPrefilled(prefilled);
      return;
    }

    setLoading(true);
    setIsSaved(false);
    setQuery(finalQuery);
    
    try {
      const result = await searchCryptid(finalQuery);
      setEntry(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPrefilled = (cryptid: CryptidEntry) => {
    setQuery(cryptid.name);
    setEntry({
      text: cryptid.journalEntry,
      imageUrl: null,
      isPrefilled: true,
      researcher: cryptid.redactedResearcher,
      style: cryptid.style
    });
    onCloseArchiveMenu?.();
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (!user || !entry || isSaved) return;
    try {
      await apiPost('/api/saved-entries', {
        cryptidName: query,
        content: entry.text,
        imageUrl: entry.imageUrl,
      });
      setIsSaved(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSpeak = async () => {
    if (!entry) return;
    try {
      const base64Audio = await speakJournalEntry(entry.text);
      if (base64Audio) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const arrayBuffer = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0)).buffer;
        
        // The TTS returns 24kHz mono PCM
        const audioBuffer = audioContext.createBuffer(1, arrayBuffer.byteLength / 2, 24000);
        const nowBuffering = audioBuffer.getChannelData(0);
        const dataView = new DataView(arrayBuffer);
        
        for (let i = 0; i < audioBuffer.length; i++) {
          nowBuffering[i] = dataView.getInt16(i * 2, true) / 32768;
        }
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 md:px-0">
      <header className="text-center space-y-4">
        <div className="flex justify-center items-center space-x-4">
          <h2 className="text-3xl md:text-5xl ink-text">Field Journal</h2>
        </div>
        <p className="font-serif italic opacity-70 text-sm md:text-lg">Consult the archives for known and obscure entities.</p>
      </header>

      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search (e.g. Chupacabra)..."
            className="w-full bg-[#fdfcf0] border-b-2 border-[#5a2a27] p-4 pr-12 focus:outline-none font-serif italic text-lg"
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5a2a27]">
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
          </button>
        </div>
        <VoiceSearchButton 
          onTranscript={(text) => {
            setQuery(text);
            handleSearch(undefined, text);
          }} 
          className="p-4"
        />
      </form>

      {loading && (
        <div className="text-center py-20">
          <Loader2 className="animate-spin mx-auto text-[#5a2a27]" size={48} />
          <p className="mt-4 font-serif italic opacity-50">Decrypting archive files...</p>
        </div>
      )}

      {entry && !loading && (
        <div className={cn(
          "animate-in fade-in slide-in-from-bottom-4 duration-700 relative overflow-visible shadow-2xl",
          entry.style ? `doc-${entry.style}` : "journal-card"
        )}>
          {entry.isPrefilled && (
            <div className="absolute top-0 right-0 bg-[#8b0000] text-[#f5f2ed] px-4 py-1 text-[10px] uppercase tracking-tighter rotate-45 translate-x-8 translate-y-2 shadow-sm z-10">
              Classified
            </div>
          )}
          
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest opacity-50">Archive Entry</span>
              <h3 className="text-3xl md:text-4xl ink-text border-b-2 border-[#5a2a27]/20 inline-block pb-1">{query}</h3>
              {entry.isPrefilled && (
                <div className="flex items-center space-x-2 text-xs font-serif italic text-[#8b0000] mt-2">
                  <UserX size={14} />
                  <span>Researcher: {entry.researcher}</span>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              {user && !entry.isPrefilled && (
                <button
                  onClick={handleSave}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isSaved ? "text-green-600 bg-green-50" : "text-[#5a2a27] hover:bg-[#5a2a27]/10"
                  )}
                  title={isSaved ? "Saved to Journal" : "Save to Journal"}
                >
                  {isSaved ? <Check size={24} /> : <Bookmark size={24} />}
                </button>
              )}
              <button
                onClick={handleSpeak}
                className="p-2 rounded-full hover:bg-[#5a2a27]/10 text-[#5a2a27] transition-colors"
                title="Listen to entry"
              >
                <Volume2 size={24} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className={cn(
              "prose prose-sepia max-w-none font-serif leading-relaxed text-base md:text-xl break-words overflow-hidden",
              entry.style === 'newspaper' ? "columns-1 md:columns-2 gap-8" : ""
            )}>
              <ReactMarkdown
                components={{
                  strong: ({ node, ...props }) => <CryptidLink onCryptidClick={(name) => handleSearch(undefined, name)} {...props} />,
                  em: ({ node, ...props }) => <CryptidLink onCryptidClick={(name) => handleSearch(undefined, name)} {...props} />,
                }}
              >
                {entry.text}
              </ReactMarkdown>
            </div>
            
            {entry.imageUrl && (
              <div className="space-y-4 mt-8">
                <div className="border-8 border-[#5a2a27]/10 p-4 bg-white/50 rotate-1 shadow-2xl max-w-2xl mx-auto">
                  <img 
                    src={entry.imageUrl} 
                    alt={query} 
                    className="w-full h-auto grayscale contrast-125 sepia-[.5]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-xs text-center italic opacity-60">Fig. 1: Archetypal representation of {query} - Recovered Evidence</p>
              </div>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-[#d4c5b9] flex flex-col md:flex-row justify-between items-center text-xs md:text-sm italic opacity-50 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="bg-[#5a2a27]/10 px-2 py-1 rounded">{entry.isPrefilled ? "SOURCE: REDACTED ARCHIVES" : "VERIFIED BY DR. THORNE"}</span>
              <span>REF: CRYP-LOG-{Math.floor(Math.random() * 10000)}</span>
            </div>
            <div className="font-typewriter opacity-40">PROPERTY OF [REDACTED]</div>
          </div>
        </div>
      )}

      {!entry && !loading && (
        <div className="text-center py-20 opacity-30">
          <Book size={64} className="mx-auto mb-6" />
          <p className="font-serif italic text-xl">The pages are blank. Select an archive entry or begin your research.</p>
        </div>
      )}

      {/* Archive Menu Overlay */}
      <AnimatePresence>
        {showArchiveMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#e8dcc4] flex flex-col p-6 md:p-12 overflow-hidden"
          >
            <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
              <div className="flex justify-between items-center mb-12">
                <div className="space-y-1">
                  <h2 className="text-4xl md:text-6xl ink-text italic">Classified Archives</h2>
                  <p className="text-xs uppercase tracking-[0.3em] opacity-50">Authorized Personnel Only</p>
                </div>
                <button 
                  onClick={onCloseArchiveMenu}
                  className="p-4 hover:bg-[#5a2a27]/10 rounded-full transition-colors"
                >
                  <X size={48} className="text-[#5a2a27]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-[#5a2a27]/20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {PREFILLED_CRYPTIDS.map((cryptid) => (
                    <button
                      key={cryptid.id}
                      onClick={() => loadPrefilled(cryptid)}
                      className="group relative p-8 text-left border border-[#c5b396] bg-[#f4ead5] hover:bg-[#5a2a27] transition-all duration-500 shadow-lg hover:shadow-2xl hover:-translate-y-1"
                    >
                      <div className="relative z-10">
                        <h4 className="text-2xl ink-text group-hover:text-[#f5f2ed] transition-colors mb-2">{cryptid.name}</h4>
                        <p className="text-[10px] font-serif italic opacity-60 group-hover:text-[#f5f2ed]/70 transition-colors mb-4">{cryptid.scientificName}</p>
                        <div className="flex items-center text-[10px] uppercase tracking-widest text-[#8b0000] group-hover:text-[#f5f2ed]/80">
                          <span className="border border-current px-2 py-0.5">Access File</span>
                          <ChevronRight size={12} className="ml-1" />
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Archive size={48} className="text-[#5a2a27] group-hover:text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-[#d4c5b9] text-center opacity-30 text-xs italic">
                All entries are subject to Section 42 of the [REDACTED] Protocol.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
