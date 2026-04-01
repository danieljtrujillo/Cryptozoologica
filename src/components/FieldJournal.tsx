import React, { useState } from 'react';
import { Search, Volume2, Loader2, Book } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { searchCryptid, speakJournalEntry } from '../services/gemini';

export default function FieldJournal() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [entry, setEntry] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const result = await searchCryptid(query);
      setEntry(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (!entry) return;
    try {
      const url = await speakJournalEntry(entry);
      if (url) {
        setAudioUrl(url);
        const audio = new Audio(url);
        audio.play();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <h2 className="text-4xl ink-text">Field Journal</h2>
        <p className="font-serif italic opacity-70">Consult the archives for known and obscure entities.</p>
      </header>

      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter cryptid name (e.g. Chupacabra, Mothman)..."
          className="w-full bg-[#fdfcf0] border-b-2 border-[#5a2a27] p-4 pr-12 focus:outline-none font-serif italic text-lg"
        />
        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5a2a27]">
          {loading ? <Loader2 className="animate-spin" /> : <Search />}
        </button>
      </form>

      {entry && (
        <div className="journal-card animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest opacity-50">Archive Entry</span>
              <h3 className="text-3xl ink-text">{query}</h3>
            </div>
            <button
              onClick={handleSpeak}
              className="p-2 rounded-full hover:bg-[#5a2a27]/10 text-[#5a2a27] transition-colors"
              title="Listen to entry"
            >
              <Volume2 size={24} />
            </button>
          </div>

          <div className="prose prose-sepia max-w-none font-serif leading-relaxed text-lg">
            <ReactMarkdown>{entry}</ReactMarkdown>
          </div>

          <div className="mt-8 pt-6 border-t border-[#d4c5b9] flex justify-between items-center text-xs italic opacity-50">
            <span>Verified by Dr. Thorne</span>
            <span>Ref: CRYP-LOG-{Math.floor(Math.random() * 10000)}</span>
          </div>
        </div>
      )}

      {!entry && !loading && (
        <div className="text-center py-20 opacity-30">
          <Book size={64} className="mx-auto mb-4" />
          <p className="font-serif italic">The pages are blank. Begin your research.</p>
        </div>
      )}
    </div>
  );
}
