import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface YearSelectorProps {
  year: number;
  onYearChange: (newYear: number) => void;
}

export const YearSelector: React.FC<YearSelectorProps> = ({ year, onYearChange }) => {
  return (
    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
        <button onClick={() => onYearChange(year - 1)} className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ChevronLeft size={20} />
        </button>
        <span className="font-bold text-lg text-slate-800">{year}년</span>
        <button onClick={() => onYearChange(year + 1)} className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ChevronRight size={20} />
        </button>
    </div>
  );
};
