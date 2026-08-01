import React from 'react';
import { AudioButton } from './AudioButton';

export const ConceptCard = ({ 
  title, 
  symbol, 
  unit, 
  analogy, 
  description, 
  audioUrl, 
  children 
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
          {symbol} ({unit})
        </span>
      </div>

      <div className="bg-slate-50 rounded-xl p-3 my-2 border border-slate-100">
        {children}
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-xs font-bold text-amber-600 flex items-center gap-1">
          💡 التشبيه: <span className="font-normal text-slate-700">{analogy}</span>
        </p>
        <p className="text-xs text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
        <AudioButton audioUrl={audioUrl} />
      </div>
    </div>
  );
};