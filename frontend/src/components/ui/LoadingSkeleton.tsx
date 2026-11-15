import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="h-10 bg-slate-800/80 rounded-xl mb-4" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-8 bg-slate-800/50 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse rounded-2xl bg-slate-850 p-5 border border-slate-750 space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 w-24 bg-slate-750 rounded" />
        <div className="h-8 w-8 bg-slate-750 rounded-xl" />
      </div>
      <div className="h-7 w-32 bg-slate-750 rounded mt-2" />
      <div className="h-3 w-40 bg-slate-750 rounded" />
    </div>
  );
};
