import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, MapPin, Calendar, Loader2, ClipboardList, Book, Bookmark } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { apiGet, apiPost, apiDelete } from '../lib/api';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

export default function MyObservations() {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'sightings' | 'entries' | 'locations'>('sightings');
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cryptidName: '',
    description: '',
    locationName: '',
  });

  const [sightings, setSightings] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [sightingsLoading, setSightingsLoading] = useState(true);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [locationsLoading, setLocationsLoading] = useState(true);

  const fetchSightings = useCallback(() => {
    if (!user) return;
    setSightingsLoading(true);
    apiGet<any[]>('/api/observations').then(setSightings).catch(console.error).finally(() => setSightingsLoading(false));
  }, [user]);

  const fetchEntries = useCallback(() => {
    if (!user) return;
    setEntriesLoading(true);
    apiGet<any[]>('/api/saved-entries').then(setEntries).catch(console.error).finally(() => setEntriesLoading(false));
  }, [user]);

  const fetchLocations = useCallback(() => {
    if (!user) return;
    setLocationsLoading(true);
    apiGet<any[]>('/api/saved-locations').then(setLocations).catch(console.error).finally(() => setLocationsLoading(false));
  }, [user]);

  useEffect(() => {
    fetchSightings();
    fetchEntries();
    fetchLocations();
  }, [fetchSightings, fetchEntries, fetchLocations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;
    setLoading(true);
    try {
      await apiPost('/api/observations', {
        cryptidName: formData.cryptidName,
        description: formData.description,
        locationName: formData.locationName,
      });
      setFormData({ cryptidName: '', description: '', locationName: '' });
      setIsAdding(false);
      fetchSightings();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (!window.confirm("Are you sure you want to strike this from the record?")) return;
    try {
      const pathMap: Record<string, string> = {
        observations: '/api/observations',
        saved_entries: '/api/saved-entries',
        saved_locations: '/api/saved-locations',
      };
      await apiDelete(`${pathMap[collectionName]}/${id}`);
      if (collectionName === 'observations') fetchSightings();
      else if (collectionName === 'saved_entries') fetchEntries();
      else fetchLocations();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20 opacity-40 italic font-serif">
        <p>You must be signed in to access your personal journal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl ink-text">Personal Journal</h2>
          <p className="font-serif italic opacity-70 text-sm md:text-base">Your private collection of sightings, research, and points of interest.</p>
        </div>
        {activeSubTab === 'sightings' && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="btn-journal flex items-center space-x-2 w-full md:w-auto justify-center"
          >
            <Plus size={18} />
            <span>{isAdding ? 'Cancel' : 'New Sighting'}</span>
          </button>
        )}
      </header>

      <div className="flex border-b border-[#d4c5b9] overflow-x-auto scrollbar-none">
        {[
          { id: 'sightings', label: 'Sightings', icon: ClipboardList },
          { id: 'entries', label: 'Field Notes', icon: Book },
          { id: 'locations', label: 'Locations', icon: Bookmark },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveSubTab(tab.id as any); setIsAdding(false); }}
            className={cn(
              "flex items-center space-x-2 px-6 py-3 font-serif italic transition-all duration-300 border-b-2 whitespace-nowrap",
              activeSubTab === tab.id ? "border-[#5a2a27] text-[#5a2a27] bg-[#5a2a27]/5" : "border-transparent text-[#5a2a27]/50 hover:text-[#5a2a27]"
            )}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeSubTab === 'sightings' && (
        <div className="space-y-6">
          {isAdding && (
            <div className="journal-card animate-in slide-in-from-top-4 duration-500">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest opacity-50">Cryptid Name</label>
                    <input
                      type="text"
                      required
                      value={formData.cryptidName}
                      onChange={(e) => setFormData({ ...formData, cryptidName: e.target.value })}
                      className="w-full bg-transparent border-b border-[#5a2a27] p-2 focus:outline-none font-serif italic text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest opacity-50">Location</label>
                    <input
                      type="text"
                      required
                      value={formData.locationName}
                      onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                      className="w-full bg-transparent border-b border-[#5a2a27] p-2 focus:outline-none font-serif italic text-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest opacity-50">Description of Encounter</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-transparent border-b border-[#5a2a27] p-2 focus:outline-none font-serif italic text-lg min-h-[150px] resize-none"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-journal w-full py-4 text-xl flex items-center justify-center space-x-2">
                  {loading ? <Loader2 className="animate-spin" /> : <ClipboardList size={20} />}
                  <span>Seal Entry</span>
                </button>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {sightingsLoading ? (
              <div className="text-center py-20"><Loader2 className="animate-spin mx-auto" /></div>
            ) : sightings?.length === 0 ? (
              <div className="text-center py-20 opacity-30 italic font-serif">
                <p>No sightings recorded yet. The world is waiting.</p>
              </div>
            ) : (
              sightings?.map((obs: any, i) => (
                <div key={i} className="doc-handwritten group shadow-lg relative overflow-hidden -rotate-1 mb-8">
                  <div className="absolute top-2 left-4 text-[9px] uppercase tracking-widest opacity-30 font-sans">Observation Log - {new Date(obs.created_at).toLocaleDateString()}</div>
                  <div className="flex justify-between items-start mb-4 mt-4">
                    <div className="space-y-1">
                      <h3 className="text-2xl ink-text">{obs.cryptid_name}</h3>
                    </div>
                    <button onClick={() => handleDelete('observations', obs.id)} className="p-2 text-[#8b0000] opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="font-sketch text-xl leading-relaxed mb-6 italic break-words">"{obs.description}"</p>
                  <div className="flex flex-wrap gap-4 text-xs italic opacity-60">
                    <div className="flex items-center space-x-1"><MapPin size={14} /><span>{obs.location_name}</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'entries' && (
        <div className="grid grid-cols-1 gap-6">
          {entriesLoading ? (
            <div className="text-center py-20"><Loader2 className="animate-spin mx-auto" /></div>
          ) : entries?.length === 0 ? (
            <div className="text-center py-20 opacity-30 italic font-serif">
              <p>No field notes saved yet. Search the archives to add entries.</p>
            </div>
          ) : (
            entries?.map((entry: any, i) => (
              <div key={i} className="doc-scanned group overflow-visible shadow-xl mb-8">
                <div className="absolute top-2 left-4 text-[9px] uppercase tracking-widest opacity-30 font-sans">Field Note - {new Date(entry.created_at).toLocaleDateString()}</div>
                <div className="flex justify-between items-start mb-6 mt-4">
                  <div className="space-y-1">
                    <h3 className="text-3xl md:text-4xl ink-text border-b border-[#5a2a27]/20 pb-1">{entry.cryptid_name}</h3>
                  </div>
                  <button onClick={() => handleDelete('saved_entries', entry.id)} className="p-2 text-[#8b0000] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className={cn("prose prose-sepia max-w-none font-serif text-lg leading-relaxed break-words overflow-hidden", entry.image_url ? "md:col-span-3" : "md:col-span-4")}>
                    <ReactMarkdown>{entry.content}</ReactMarkdown>
                  </div>
                  {entry.image_url && (
                    <div className="md:col-span-1">
                      <div className="border-4 border-[#5a2a27]/10 p-2 bg-white/30 rotate-2 shadow-lg">
                        <img 
                          src={entry.image_url} 
                          alt={entry.cryptid_name} 
                          className="w-full h-auto grayscale contrast-125 sepia-[.3]"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-[#d4c5b9] flex justify-between items-center text-[10px] uppercase tracking-widest opacity-40 font-sans">
                  <span>Authorized Record: {entry.id.substring(0, 8)}</span>
                  <span>Property of The Cryptid Journal</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeSubTab === 'locations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {locationsLoading ? (
            <div className="text-center py-20 col-span-full"><Loader2 className="animate-spin mx-auto" /></div>
          ) : locations?.length === 0 ? (
            <div className="text-center py-20 opacity-30 italic font-serif col-span-full">
              <p>No locations saved yet. Use the map to mark points of interest.</p>
            </div>
          ) : (
            locations?.map((loc: any, i) => (
              <div key={i} className="journal-card group">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-widest opacity-50">Saved Location</span>
                    <h3 className="text-xl ink-text">{loc.name}</h3>
                  </div>
                  <button onClick={() => handleDelete('saved_locations', loc.id)} className="p-2 text-[#8b0000] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex items-center space-x-2 text-[#5a2a27] font-serif italic mb-4">
                  <MapPin size={16} className="ink-text" />
                  <span className="text-sm">{loc.lat.toFixed(4)}° N, {loc.lng.toFixed(4)}° W</span>
                </div>
                <p className="text-xs italic opacity-60">{loc.description}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
