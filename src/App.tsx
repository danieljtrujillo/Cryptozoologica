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

export default function App() {
  const [activeTab, setActiveTab] = useState('journal');

  const renderContent = () => {
    switch (activeTab) {
      case 'journal':
        return <FieldJournal />;
      case 'map':
        return <ExpeditionMap />;
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
    <JournalLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </JournalLayout>
  );
}

