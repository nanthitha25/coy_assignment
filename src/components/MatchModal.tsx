'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, MapPin, X } from 'lucide-react';
import { MatchWithProfile } from '@/lib/types';

interface MatchModalProps {
  match: MatchWithProfile | null;
  onClose: () => void;
  onViewMatches: () => void;
}

export function MatchModal({ match, onClose, onViewMatches }: MatchModalProps) {
  if (!match) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#1A1A1A]/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-sm bg-[#FAF8F5] border-[2.5px] border-[#1A1A1A] shadow-brutal-xl rounded-[32px] p-6 text-center z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border-2 border-[#1A1A1A] shadow-brutal-sm flex items-center justify-center text-[#1A1A1A] hover:bg-gray-100 active:translate-x-[1px] active:translate-y-[1px] transition-all"
            aria-label="Close match dialog"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Coy Logo badge */}
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#FFE4EC] border-2 border-[#1A1A1A] rounded-full text-xs font-bold text-[#FF4D8D] shadow-brutal-sm mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mutual Match</span>
          </div>

          {/* Overlapping Circles (Coy signature motif) */}
          <div className="relative flex items-center justify-center h-28 my-2">
            {/* Left Circle: Current User */}
            <motion.div
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: -24, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="w-20 h-20 rounded-full border-[2.5px] border-[#1A1A1A] shadow-brutal bg-[#FFE4EC] flex items-center justify-center z-10 overflow-hidden"
            >
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FF4D8D] to-[#FF85A2] text-white font-extrabold text-sm">
                <span>YOU</span>
              </div>
            </motion.div>

            {/* Right Circle: Matched Profile */}
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 24, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="w-20 h-20 rounded-full border-[2.5px] border-[#1A1A1A] shadow-brutal bg-white z-20 overflow-hidden"
            >
              <img
                src={match.avatarUrl}
                alt={match.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/micah/svg?seed=${match.name}`;
                }}
              />
            </motion.div>

            {/* Center Heart Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 500 }}
              className="absolute z-30 w-9 h-9 rounded-full bg-[#FF4D8D] border-2 border-[#1A1A1A] shadow-brutal-sm flex items-center justify-center text-white"
            >
              <Heart className="w-5 h-5 fill-white" />
            </motion.div>
          </div>

          {/* Match Title */}
          <h3 className="text-3xl font-black text-[#1A1A1A] tracking-tight mt-2">
            It's a match!
          </h3>
          <p className="text-sm font-medium text-[#666666] mt-1 mb-4">
            You and <span className="text-[#1A1A1A] font-bold">{match.name}</span> both liked each other!
          </p>

          {/* Mini Profile Summary Card */}
          <div className="bg-white border-2 border-[#1A1A1A] rounded-2xl p-3 shadow-brutal-sm text-left mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="font-extrabold text-[#1A1A1A] text-base">
                {match.name}, {match.age}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#666666] font-medium">
                <MapPin className="w-3 h-3 text-[#FF4D8D]" />
                <span className="truncate max-w-[140px]">{match.cityOrCollege}</span>
              </span>
            </div>
            <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed">
              "{match.bio}"
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={onViewMatches}
              className="w-full py-3.5 bg-[#FF4D8D] text-white font-extrabold text-sm rounded-2xl border-2 border-[#1A1A1A] shadow-brutal hover:bg-[#E03875] active:translate-x-[2px] active:translate-y-[2px] active:shadow-brutal-active transition-all"
            >
              View in Matches
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 bg-white text-[#1A1A1A] font-bold text-sm rounded-2xl border-2 border-[#1A1A1A] shadow-brutal-sm hover:bg-gray-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              Keep Swiping
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
