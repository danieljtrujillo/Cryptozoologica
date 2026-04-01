import React from 'react';
import { PREFILLED_CRYPTIDS } from '../constants/cryptids';

interface CryptidLinkProps {
  children?: React.ReactNode;
  onCryptidClick?: (name: string) => void;
}

export function CryptidLink({ children, onCryptidClick, ...props }: CryptidLinkProps) {
  const text = typeof children === 'string' ? children : 
    Array.isArray(children) ? children.join('') : String(children || '');
  
  const match = PREFILLED_CRYPTIDS.find(c => 
    text.toLowerCase().includes(c.name.toLowerCase())
  );

  if (match && onCryptidClick) {
    return (
      <strong
        {...props}
        className="cursor-pointer text-[#8b0000] hover:underline decoration-dotted underline-offset-4 transition-colors hover:text-[#5a2a27]"
        onClick={() => onCryptidClick(match.name)}
        title={`View ${match.name} in archives`}
      >
        {children}
      </strong>
    );
  }

  return <strong {...props}>{children}</strong>;
}
