/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import JournalLayout from './components/JournalLayout';
import FieldJournal from './components/FieldJournal';
import ExpeditionMap from './components/ExpeditionMap';
import ResearchLab from './components/ResearchLab';
import MyObservations from './components/MyObservations';
import CryptidLive from './components/CryptidLive';
import FundingGuard from './components/FundingGuard';
import { AuthProvider } from './lib/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState('journal');
  const [selectedCryptid, setSelectedCryptid] = useState<string | null>(null);
  const [showArchiveMenu, setShowArchiveMenu] = useState(false);

  const handleNavigateToCryptid = (name: string) => {
    setSelectedCryptid(name);
    setActiveTab('journal');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'journal':
        return (
          <FieldJournal 
            initialSearch={selectedCryptid} 
            onSearchCleared={() => setSelectedCryptid(null)} 
            showArchiveMenu={showArchiveMenu}
            onCloseArchiveMenu={() => setShowArchiveMenu(false)}
          />
        );
      case 'map':
        return <ExpeditionMap onCryptidClick={handleNavigateToCryptid} />;
      case 'lab':
        return (
          <div className="space-y-12">
            <ResearchLab />
            <div className="pt-12 border-t border-[#d4c5b9]">
              <CryptidLive />
            </div>
          </div>
        );
      case 'observations':
        return <MyObservations />;
      default:
        return <FieldJournal />;
    }
  };

  return (
    <AuthProvider>
      <FundingGuard>
        <JournalLayout 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          onOpenArchive={() => setShowArchiveMenu(true)}
        >
          {renderContent()}
        </JournalLayout>
      </FundingGuard>
    </AuthProvider>
  );
}

