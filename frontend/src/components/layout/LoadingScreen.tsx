import React, { useState, useEffect } from 'react';
import { Pill, ShieldCheck, Activity } from 'lucide-react';

interface LoadingScreenProps {
  onComplete?: () => void;
  minDuration?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onComplete,
  minDuration = 1100,
}) => {
  const [progress, setProgress] = useState(15);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    'Preparing your workspace',
    'Organizing pharmacy inventory',
    'Loading clinical formulary',
    'Verifying batch safety registers',
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 20) + 15;
      });
    }, minDuration / 4);

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, minDuration / 3);

    const timeout = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        onComplete?.();
      }, 150);
    }, minDuration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearTimeout(timeout);
    };
  }, [minDuration, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8F7F2] text-[#252A27] px-6 transition-opacity duration-300">
      <div className="flex flex-col items-center max-w-sm w-full text-center">
        {/* Animated Brand Emblem */}
        <div className="relative mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#183D32] text-white flex items-center justify-center shadow-subtle">
            <Pill className="w-7 h-7 transform -rotate-45" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#E7EDE5] border-2 border-[#F8F7F2] flex items-center justify-center text-[#183D32]">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-xl font-heading font-extrabold tracking-tight text-[#183D32] mb-1">
          PHARMAFLOW
        </h1>
        <p className="text-xs text-[#777C76] font-medium tracking-wide uppercase mb-8">
          Pharmacy Operations & Inventory Platform
        </p>

        {/* Progress Bar Container */}
        <div className="w-full bg-[#E6E5DD] h-1 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-[#183D32] transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>

        {/* Dynamic Status Message */}
        <div className="h-5 flex items-center justify-center gap-1.5 text-xs text-[#777C76] font-medium">
          <Activity className="w-3 h-3 text-[#183D32] animate-pulse" />
          <span className="transition-all duration-200">
            {messages[messageIndex]}...
          </span>
        </div>
      </div>
    </div>
  );
};
