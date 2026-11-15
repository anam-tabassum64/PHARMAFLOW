import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="space-y-3 p-4 bg-white rounded-lg border border-slate-200">
      <div className="h-8 bg-slate-100 rounded animate-pulse mb-3" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-6 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-lg bg-white p-4 border border-slate-200 space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-3.5 w-24 bg-slate-100 rounded" />
        <div className="h-7 w-7 bg-slate-100 rounded" />
      </div>
      <div className="h-6 w-32 bg-slate-100 rounded mt-2" />
      <div className="h-3 w-40 bg-slate-100 rounded" />
    </div>
  );
};
