import React, { useState } from 'react';
import { Home } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({ src, alt, className = '', fallbackTitle }: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#EFECE6] border border-[#E7E5DF] text-[#4A5056] p-6 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Home className="w-8 h-8 text-[#154D34] mb-2" strokeWidth={1.5} />
        <span className="text-xs font-medium text-center">{fallbackTitle || alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
