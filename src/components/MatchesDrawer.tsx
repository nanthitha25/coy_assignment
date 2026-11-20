'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, MapPin, Sparkles, Clock } from 'lucide-react';
import { MatchWithProfile } from '@/lib/types';

interface MatchesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  matches: MatchWithProfile[];
  isLoading: boolean;
}

export function MatchesDrawer({
  isOpen,
  onClose,
  matches,
  isLoading,
}: MatchesDrawerProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#1A1A1A]/50 backdrop-blur-xs"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="relative w-full max-w-sm h-full bg-[#FAF8F5] border-l-[2.5px] border-[#1A1A1A] shadow-brutal-xl z-50 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b-2 border-[#1A1A1A] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FFE4EC] border-2 border-[#1A1A1A] flex items-center justify-center text-[#FF4D8D]">
                <Heart className="w-4 h-4 fill-[#FF4D8D]" />
              </div>
              <h2 className="text-lg font-black text-[#1A1A1A] tracking-tight">
                Mutual Matches
              </h2>
              <span className="px-2 py-0.5 text-xs font-black bg-[#FEF08A] border-2 border-[#1A1A1A] rounded-full shadow-brutal-sm">
                {matches.length}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border-2 border-[#1A1A1A] shadow-brutal-sm flex items-center justify-center text-[#1A1A1A] hover:bg-gray-100 active:translate-x-[1px] active:translate-y-[1px] transition-all"
              aria-label="Close matches panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subheader privacy banner */}
          <div className="px-5 py-2.5 bg-[#FFE4EC] border-b-2 border-[#1A1A1A] text-[11px] text-[#1A1A1A] font-semibold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FF4D8D] shrink-0" />
            <span>Core Coy Promise: Only mutual likes are ever revealed.</span>
          </div>

          {/* Match List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#666666]">
                <div className="w-6 h-6 border-2 border-[#FF4D8D] border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-xs font-bold font-mono">Loading matches...</span>
              </div>
            ) : matches.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-[#F3E8FF] border-2 border-[#1A1A1A] shadow-brutal flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-[#A855F7]" />
                </div>
                <h3 className="text-base font-black text-[#1A1A1A] mb-1">
                  No mutual matches yet
                </h3>
                <p className="text-xs text-[#666666] max-w-[220px] leading-relaxed">
                  When someone you like also likes you back on Coy, they'll appear here right away!
                </p>
              </div>
            ) : (
              matches.map((m) => (
                <div
                  key={m.id}
                  className="bg-white border-2 border-[#1A1A1A] rounded-2xl p-3.5 shadow-brutal hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex flex-col gap-2.5"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={m.avatarUrl}
                      alt={m.name}
                      className="w-14 h-14 rounded-xl border-2 border-[#1A1A1A] object-cover shrink-0 shadow-brutal-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/micah/svg?seed=${m.name}`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-[#1A1A1A] text-sm truncate">
                          {m.name}, {m.age}
                        </h4>
                        <span className="flex items-center gap-1 text-[10px] text-[#8E8E93] font-mono">
                          <Clock className="w-3 h-3" />
                          <span>Matched</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[#FF4D8D] font-bold mt-0.5 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{m.cityOrCollege}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed bg-[#FAF8F5] p-2 rounded-lg border border-gray-100">
                    "{m.bio}"
                  </p>

                  {m.interests && m.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {m.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[10px] font-bold bg-[#FAF8F5] border border-[#1A1A1A] rounded-md text-[#1A1A1A]"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
