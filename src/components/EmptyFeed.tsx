'use client';

import React from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';

interface EmptyFeedProps {
  onReset: () => void;
  isResetting: boolean;
}

export function EmptyFeed({ onReset, isResetting }: EmptyFeedProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-[#FFE4EC] border-[2.5px] border-[#1A1A1A] shadow-brutal flex items-center justify-center mx-auto">
          <Sparkles className="w-10 h-10 text-[#FF4D8D]" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-[#FEF08A] border-2 border-[#1A1A1A] rounded-full p-1.5 shadow-brutal-sm">
          <span className="text-sm font-bold">✨</span>
        </div>
      </div>

      <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-2">
        You've seen everyone!
      </h2>
      <p className="text-sm text-[#666666] max-w-xs mb-8 leading-relaxed">
        You've swiped through all available profiles in your area. Want to replay the demo and test different matches?
      </p>

      <button
        onClick={onReset}
        disabled={isResetting}
        className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#FF4D8D] text-white font-extrabold text-sm rounded-2xl border-2 border-[#1A1A1A] shadow-brutal hover:bg-[#E03875] active:translate-x-[2px] active:translate-y-[2px] active:shadow-brutal-active transition-all disabled:opacity-60"
      >
        <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
        <span>{isResetting ? 'Resetting Data...' : 'Reset Demo Deck (32 Profiles)'}</span>
      </button>

      <p className="text-xs text-[#8E8E93] mt-4 font-mono">
        Resets swipes & matches back to fresh demo state
      </p>
    </div>
  );
}
