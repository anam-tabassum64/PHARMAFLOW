import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-[#E6E5DD] p-5 shadow-subtle animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-3 bg-[#E6E5DD] rounded w-24" />
        <div className="w-8 h-8 bg-[#E6E5DD] rounded-lg" />
      </div>
      <div className="h-7 bg-[#E6E5DD] rounded w-32" />
      <div className="h-2.5 bg-[#E6E5DD] rounded w-44" />
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 5,
}) => {
  return (
    <div className="w-full bg-white rounded-xl border border-[#E6E5DD] shadow-subtle p-4 animate-pulse">
      <div className="h-8 bg-[#F1F0E9] rounded-lg mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, j) => (
              <div
                key={j}
                className="h-4 bg-[#E6E5DD] rounded flex-1"
                style={{ opacity: 1 - i * 0.1 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
