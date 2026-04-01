import React from 'react';
import { motion } from 'motion/react';
import { Book, Map, FlaskConical, ClipboardList, LogOut, User } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, signIn, signOut } from '../lib/firebase';
import { cn } from '../lib/utils';

interface JournalLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function JournalLayout({ children, activeTab, setActiveTab }: JournalLayoutProps) {
  const [user] = useAuthState(auth);

  const tabs = [
    { id: 'journal', label: 'Field Journal', icon: Book },
    { id: 'map', label: 'Expedition Map', icon: Map },
    { id: 'lab', label: 'Research Lab', icon: FlaskConical },
    { id: 'observations', label: 'My Observations', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#fdfcf0] border-r border-[#d4c5b9] p-6 flex flex-col shadow-lg z-10">
        <div className="mb-12">
          <h1 className="text-3xl font-serif italic ink-text text-center md:text-left">The Cryptid Journal</h1>
          <p className="text-xs text-[#5a2a27] opacity-60 text-center md:text-left mt-2">EST. 1886 | EXPEDITION LOG</p>
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
        </nav>

        <div className="mt-auto pt-6 border-t border-[#d4c5b9]">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-[#5a2a27]" />
                <span className="text-xs font-serif italic truncate max-w-[100px]">{user.displayName}</span>
              </div>
              <button onClick={signOut} className="text-[#5a2a27] hover:text-[#8b0000]">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="w-full flex items-center justify-center space-x-2 btn-journal"
            >
              <User size={18} />
              <span>Begin Expedition</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-12 overflow-y-auto bg-[#f5f2ed]/50">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
