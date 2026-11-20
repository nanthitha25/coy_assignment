'use client';

import React from 'react';
import { Compass, Users, Lock, Sparkles } from 'lucide-react';

interface HomePlaceholderProps {
  onSwitchToDiscover: () => void;
}

export function HomePlaceholder({ onSwitchToDiscover }: HomePlaceholderProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-[#FFE4EC] border-2 border-[#1A1A1A] shadow-brutal flex items-center justify-center mb-5">
        <Users className="w-8 h-8 text-[#FF4D8D]" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-[#1A1A1A] rounded-full text-xs font-bold shadow-brutal-sm mb-3">
        <Lock className="w-3.5 h-3.5 text-[#FF4D8D]" />
        <span>Coy Home — Crush List</span>
      </div>

      <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-2">
        Existing Crush Space
      </h2>
      <p className="text-xs text-[#666666] max-w-xs mb-6 leading-relaxed">
        Per the assignment specification, this Home tab represents Coy's existing contact-matching experience. All new discovery functionality is built in the <strong>Discover</strong> tab!
      </p>

      {/* Mini preview card */}
      <div className="w-full max-w-xs bg-white border-2 border-[#1A1A1A] rounded-2xl p-4 shadow-brutal-sm text-left mb-6 space-y-2.5">
        <div className="text-xs font-bold text-[#1A1A1A] flex items-center justify-between">
          <span>Your crushes</span>
          <span className="text-[#8E8E93]">0 / 3</span>
        </div>
        <div className="p-2.5 bg-[#FAF8F5] border border-dashed border-[#1A1A1A]/40 rounded-xl text-center text-xs text-[#666666] font-medium">
          + Add a crush by phone or email
        </div>
      </div>

      <button
        onClick={onSwitchToDiscover}
        className="inline-flex items-center gap-2 px-5 py-3 bg-[#FF4D8D] text-white font-extrabold text-xs rounded-2xl border-2 border-[#1A1A1A] shadow-brutal hover:bg-[#E03875] active:translate-x-[2px] active:translate-y-[2px] active:shadow-brutal-active transition-all"
      >
        <Compass className="w-4 h-4" />
        <span>Switch to Discover Tab</span>
      </button>
    </div>
  );
}
