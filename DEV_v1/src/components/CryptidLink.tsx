import React from 'react';
import { PREFILLED_CRYPTIDS } from '../constants/cryptids';

interface CryptidLinkProps {
  children?: React.ReactNode;
  onCryptidClick?: (name: string) => void;
}

export const CryptidLink: React.FC<CryptidLinkProps> = ({ children, onCryptidClick }) => {
  const text = String(children);
  
  // Check if the text matches any known cryptid
  const cryptid = PREFILLED_CRYPTIDS.find(c => 
    text.toLowerCase().includes(c.name.toLowerCase())
  );

  if (cryptid && onCryptidClick) {
    return (
      <button 
        onClick={() => onCryptidClick(cryptid.name)}
        className="text-[#8b0000] font-bold hover:underline decoration-dotted underline-offset-4 text-left whitespace-normal inline"
      >
        {children}
      </button>
    );
  }

  return <span>{children}</span>;
};
