import React, { useState } from 'react';
import { Plus, Trash2, MapPin, Calendar, Loader2, ClipboardList } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, addDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function MyObservations() {
  const [user] = useAuthState(auth);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cryptidName: '',
    description: '',
    locationName: '',
  });

  const observationsRef = collection(db, 'observations');
  const q = user ? query(
    observationsRef,
    where('userId', '==', user.uid),
    orderBy('timestamp', 'desc')
  ) : null;

  const [observations, obsLoading] = useCollectionData(q);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;
    setLoading(true);
    try {
      await addDoc(observationsRef, {
        ...formData,
        userId: user.uid,
        timestamp: serverTimestamp(),
        location: {
          lat: 0, // In a real app, we'd get this from geolocation
          lng: 0,
          address: formData.locationName
        }
      });
      setFormData({ cryptidName: '', description: '', locationName: '' });
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to strike this observation from the record?")) return;
    try {
      await deleteDoc(doc(db, 'observations', id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20 opacity-40 italic font-serif">
        <p>You must be signed in to record observations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-4xl ink-text">My Observations</h2>
          <p className="font-serif italic opacity-70">A personal record of your encounters.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn-journal flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>{isAdding ? 'Cancel' : 'New Entry'}</span>
        </button>
      </header>

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
            <button
              type="submit"
              disabled={loading}
              className="btn-journal w-full py-4 text-xl flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <ClipboardList size={20} />}
              <span>Seal Entry</span>
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {obsLoading ? (
          <div className="text-center py-20"><Loader2 className="animate-spin mx-auto" /></div>
        ) : observations?.length === 0 ? (
          <div className="text-center py-20 opacity-30 italic font-serif">
            <p>No observations recorded yet. The world is waiting.</p>
          </div>
        ) : (
          observations?.map((obs: any, i) => (
            <div key={i} className="journal-card group">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-widest opacity-50">Observation Log</span>
                  <h3 className="text-2xl ink-text">{obs.cryptidName}</h3>
                </div>
                <button
                  onClick={() => handleDelete(obs.id)}
                  className="p-2 text-[#8b0000] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <p className="font-serif text-lg leading-relaxed mb-6 italic">"{obs.description}"</p>
              
              <div className="flex flex-wrap gap-4 text-xs italic opacity-60">
                <div className="flex items-center space-x-1">
                  <MapPin size={14} />
                  <span>{obs.locationName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{obs.timestamp?.toDate().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
