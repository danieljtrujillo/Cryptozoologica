import React, { useState, useEffect } from 'react';
import { MapPin, Search, Loader2, ExternalLink, Bookmark, Check } from 'lucide-react';
import { searchNearbyCryptids } from '../services/gemini';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../lib/auth';
import { apiPost } from '../lib/api';
import { cn } from '../lib/utils';
import { CryptidLink } from './CryptidLink';

export default function ExpeditionMap({ onCryptidClick }: { onCryptidClick?: (name: string) => void }) {
  const { user } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ text: string; sources: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedLocations, setSavedLocations] = useState<Set<string>>(new Set());

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
          setError("Location access denied. Using default coordinates (Florida, PR).");
          setLocation({ lat: 18.3630, lng: -66.5610 }); // Florida, PR
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

  const handleSaveLocation = async (name: string) => {
    if (!user || !location || savedLocations.has(name)) return;
    try {
      await apiPost('/api/saved-locations', {
        name: name,
        description: `Nearby sightings at ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
        lat: location.lat,
        lng: location.lng,
      });
      setSavedLocations(prev => new Set(prev).add(name));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 px-4 md:px-0">
      <header className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl ink-text">Expedition Map</h2>
        <p className="font-serif italic opacity-70 text-sm md:text-base">Locate elusive entities in your current vicinity.</p>
      </header>

      <div className="journal-card bg-[#fdfcf0] p-6 md:p-8 flex flex-col items-center space-y-6">
        <div className="flex items-center space-x-4 text-[#5a2a27] font-serif italic">
          <MapPin size={24} className="ink-text" />
          <div className="text-center md:text-left">
            <p className="text-[10px] md:text-xs uppercase tracking-widest opacity-50">Current Coordinates</p>
            <p className="text-lg md:text-xl">
              {location ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° W` : "Locating..."}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <button
            onClick={handleSearchNearby}
            disabled={loading || !location}
            className="btn-journal flex items-center justify-center space-x-2 px-8 py-4 text-lg md:text-xl"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
            <span>Scan Surroundings</span>
          </button>
          
          {user && location && (
            <button
              onClick={() => handleSaveLocation("Current Expedition Point")}
              disabled={savedLocations.has("Current Expedition Point")}
              className={cn(
                "btn-journal flex items-center justify-center space-x-2 px-8 py-4 text-lg md:text-xl",
                savedLocations.has("Current Expedition Point") && "opacity-50 cursor-default"
              )}
            >
              {savedLocations.has("Current Expedition Point") ? <Check size={20} /> : <Bookmark size={20} />}
              <span>{savedLocations.has("Current Expedition Point") ? "Point Saved" : "Save Point"}</span>
            </button>
          )}
        </div>

        {error && <p className="text-xs text-[#8b0000] italic text-center">{error}</p>}
      </div>

      {results && (
        <div className="journal-card animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-6">
            <span className="text-xs uppercase tracking-widest opacity-50">Local Intelligence</span>
            <h3 className="text-2xl md:text-3xl ink-text">Nearby Sightings & Lore</h3>
          </div>

          <div className="prose prose-sepia max-w-none font-serif leading-relaxed text-base md:text-lg break-words overflow-hidden">
            <ReactMarkdown
              components={{
                strong: ({ node, ...props }) => <CryptidLink onCryptidClick={onCryptidClick} {...props} />,
                em: ({ node, ...props }) => <CryptidLink onCryptidClick={onCryptidClick} {...props} />,
              }}
            >
              {results.text}
            </ReactMarkdown>
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
                    className="flex items-center space-x-2 text-[10px] md:text-xs font-serif italic text-[#5a2a27] hover:text-[#8b0000] underline"
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
