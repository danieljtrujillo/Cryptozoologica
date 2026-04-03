import React from 'react';
import { motion } from 'motion/react';
import { Book, Map, FlaskConical, ClipboardList, LogOut, User, Archive } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';

interface JournalLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenArchive?: () => void;
}

export default function JournalLayout({ children, activeTab, setActiveTab, onOpenArchive }: JournalLayoutProps) {
  const { user, signOut } = useAuth();

  const tabs = [
    { id: 'journal', label: 'Journal', icon: Book },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'lab', label: 'Lab', icon: FlaskConical },
    { id: 'observations', label: 'Log', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#fdfcf0] border-r border-[#d4c5b9] p-6 flex-col shadow-lg z-10 sticky top-0 h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-serif italic ink-text">The Cryptid Journal</h1>
          <p className="text-xs text-[#5a2a27] opacity-60 mt-2">EST. 1886 | EXPEDITION LOG</p>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-sm transition-all duration-300 font-serif italic",
                activeTab === tab.id
                  ? "bg-[#5a2a27] text-[#f5f2ed] shadow-md translate-x-2"
                  : "text-[#5a2a27] hover:bg-[#5a2a27]/10"
              )}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}

          <div className="pt-6 mt-6 border-t border-[#d4c5b9]">
            <button 
              onClick={() => {
                setActiveTab('journal');
                onOpenArchive?.();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-sm transition-all duration-300 font-serif italic text-[#8b0000] hover:bg-[#8b0000]/10 border border-[#8b0000]/20"
            >
              <Archive size={20} />
              <span className="uppercase tracking-widest text-[10px] font-bold">Classified Archives</span>
            </button>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-[#d4c5b9]">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full border border-[#5a2a27] bg-[#5a2a27]/10 flex items-center justify-center text-sm font-serif uppercase">{user.name[0]}</div>
                <span className="text-xs font-serif italic truncate max-w-[100px]">{user.name}</span>
              </div>
              <button onClick={signOut} className="text-[#5a2a27] hover:text-[#8b0000]">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3 opacity-50">
              <User size={18} />
              <span className="text-xs font-serif italic">Not signed in</span>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-[#fdfcf0] border-b border-[#d4c5b9] p-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <h1 className="text-xl font-serif italic ink-text">The Cryptid Journal</h1>
        {user ? (
          <button onClick={signOut} className="text-[#5a2a27]">
            <LogOut size={18} />
          </button>
        ) : (
          <span className="text-[#5a2a27] opacity-50">
            <User size={18} />
          </span>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-12 overflow-y-auto bg-[#f5f2ed]/50">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#fdfcf0] border-t border-[#d4c5b9] flex justify-around items-center p-2 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center p-2 transition-all duration-300",
              activeTab === tab.id ? "text-[#5a2a27] scale-110" : "text-[#5a2a27]/40"
            )}
          >
            <tab.icon size={20} />
            <span className="text-[10px] font-serif italic mt-1">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
