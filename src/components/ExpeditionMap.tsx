import React, { useState, useEffect } from 'react';
import { MapPin, Search, Loader2, ExternalLink } from 'lucide-react';
import { searchNearbyCryptids } from '../services/gemini';
import ReactMarkdown from 'react-markdown';

export default function ExpeditionMap() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ text: string; sources: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error(err);
          setError("Location access denied. Using default coordinates (Arecibo, PR).");
          setLocation({ lat: 18.3444, lng: -66.7528 }); // Arecibo Observatory
        }
      );
    }
  }, []);

  const handleSearchNearby = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const result = await searchNearbyCryptids(location.lat, location.lng);
      setResults(result);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch nearby cryptids.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <h2 className="text-4xl ink-text">Expedition Map</h2>
        <p className="font-serif italic opacity-70">Locate elusive entities in your current vicinity.</p>
      </header>

      <div className="journal-card bg-[#fdfcf0] p-8 flex flex-col items-center space-y-6">
        <div className="flex items-center space-x-4 text-[#5a2a27] font-serif italic">
          <MapPin size={24} className="ink-text" />
          <div>
            <p className="text-xs uppercase tracking-widest opacity-50">Current Coordinates</p>
            <p className="text-xl">
              {location ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° W` : "Locating..."}
            </p>
          </div>
        </div>

        <button
          onClick={handleSearchNearby}
          disabled={loading || !location}
          className="btn-journal flex items-center space-x-2 px-8 py-4 text-xl"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search />}
          <span>Scan Surroundings</span>
        </button>

        {error && <p className="text-xs text-[#8b0000] italic">{error}</p>}
      </div>

      {results && (
        <div className="journal-card animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-6">
            <span className="text-xs uppercase tracking-widest opacity-50">Local Intelligence</span>
            <h3 className="text-3xl ink-text">Nearby Sightings & Lore</h3>
          </div>

          <div className="prose prose-sepia max-w-none font-serif leading-relaxed text-lg">
            <ReactMarkdown>{results.text}</ReactMarkdown>
          </div>

          {results.sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#d4c5b9]">
              <p className="text-xs uppercase tracking-widest opacity-50 mb-4">Grounding Sources</p>
              <div className="flex flex-wrap gap-3">
                {results.sources.map((source, i) => (
                  <a
                    key={i}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-xs font-serif italic text-[#5a2a27] hover:text-[#8b0000] underline"
                  >
                    <ExternalLink size={12} />
                    <span>Reference {i + 1}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
