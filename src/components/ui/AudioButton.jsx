import React, { useState } from 'react';

export const AudioButton = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <button
      onClick={toggleAudio}
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
        isPlaying 
          ? 'bg-amber-500 text-white border border-amber-600' 
          : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
      }`}
    >
      <span>{isPlaying ? '⏸️ إيقاف' : '🔊 استمع للشرح الصوتي'}</span>
    </button>
  );
};