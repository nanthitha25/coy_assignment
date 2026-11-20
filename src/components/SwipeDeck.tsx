'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  PanInfo,
} from 'framer-motion';
import { Heart, X, MapPin, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { PublicProfile, SwipeDirection } from '@/lib/types';

interface SwipeDeckProps {
  profiles: PublicProfile[];
  onSwipe: (targetUserId: string, direction: SwipeDirection) => void;
  isModalOpen: boolean;
}

export function SwipeDeck({ profiles, onSwipe, isModalOpen }: SwipeDeckProps) {
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  const currentProfile = profiles[0] as PublicProfile | undefined;
  const nextProfile = profiles[1] as PublicProfile | undefined;

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-15, 0, 15]);

  // Dynamic stamp opacities
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, -20], [1, 0]);

  const triggerSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (!currentProfile || swipingId) return;

      setSwipingId(currentProfile.id);
      setExitDirection(direction === 'LIKE' ? 'right' : 'left');

      const targetX = direction === 'LIKE' ? 500 : -500;
      animate(x, targetX, {
        duration: 0.3,
        ease: 'easeOut',
        onComplete: () => {
          onSwipe(currentProfile.id, direction);
          x.set(0);
          setSwipingId(null);
          setExitDirection(null);
        },
      });
    },
    [currentProfile, swipingId, onSwipe, x]
  );

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const swipeThreshold = 90;
    const velocityThreshold = 400;

    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      triggerSwipe('LIKE');
    } else if (
      info.offset.x < -swipeThreshold ||
      info.velocity.x < -velocityThreshold
    ) {
      triggerSwipe('PASS');
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 25 });
    }
  };

  // Keyboard shortcut listener (disabled if modal or drawer is open)
  useEffect(() => {
    if (isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        triggerSwipe('PASS');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        triggerSwipe('LIKE');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, triggerSwipe]);

  if (!currentProfile) return null;

  // Background pastel colors for interest pills
  const pillColors = [
    'bg-[#FFE4EC] text-[#FF4D8D]',
    'bg-[#FEF08A] text-[#854D0E]',
    'bg-[#D1FAE5] text-[#065F46]',
    'bg-[#F3E8FF] text-[#6B21A8]',
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-between px-4 py-2 w-full max-w-sm mx-auto select-none">
      {/* Card Deck Area */}
      <div className="relative w-full h-[470px] flex items-center justify-center">
        {/* Next Card (Stacked Behind for Depth) */}
        {nextProfile && (
          <div
            className="absolute inset-0 rounded-[28px] bg-white border-[2.5px] border-[#1A1A1A] shadow-brutal overflow-hidden scale-[0.95] translate-y-3 opacity-90 transition-all pointer-events-none"
            aria-hidden="true"
          >
            <div className="relative w-full h-full">
              <img
                src={nextProfile.avatarUrl}
                alt={nextProfile.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/micah/svg?seed=${nextProfile.name}`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <h3 className="text-2xl font-black">{nextProfile.name}, {nextProfile.age}</h3>
                <p className="text-xs text-white/80 font-medium">{nextProfile.cityOrCollege}</p>
              </div>
            </div>
          </div>
        )}

        {/* Top Active Card */}
        <motion.div
          key={currentProfile.id}
          style={{ x, rotate }}
          drag={!swipingId ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.8}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 rounded-[28px] bg-white border-[2.5px] border-[#1A1A1A] shadow-brutal-lg overflow-hidden cursor-grab active:cursor-grabbing z-20 flex flex-col justify-end"
        >
          {/* Card Portrait Photo */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={currentProfile.avatarUrl}
              alt={currentProfile.name}
              className="w-full h-full object-cover pointer-events-none"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/micah/svg?seed=${currentProfile.name}`;
              }}
            />
            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5 pointer-events-none" />
          </div>

          {/* Stamp Badges (Fade in upon dragging) */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-6 left-6 z-30 pointer-events-none rotate-[-12deg]"
          >
            <div className="px-4 py-1.5 bg-[#D1FAE5] border-[2.5px] border-[#1A1A1A] rounded-xl shadow-brutal flex items-center gap-1.5 text-emerald-900 font-black text-lg tracking-wider">
              <span>LIKE</span>
              <Heart className="w-5 h-5 fill-emerald-800" />
            </div>
          </motion.div>

          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute top-6 right-6 z-30 pointer-events-none rotate-[12deg]"
          >
            <div className="px-4 py-1.5 bg-[#FEF08A] border-[2.5px] border-[#1A1A1A] rounded-xl shadow-brutal flex items-center gap-1.5 text-amber-950 font-black text-lg tracking-wider">
              <span>PASS</span>
              <X className="w-5 h-5 stroke-[3]" />
            </div>
          </motion.div>

          {/* Card Details Footer */}
          <div className="relative z-20 p-5 text-white flex flex-col gap-2 pointer-events-none">
            {/* Name + Age */}
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">
                {currentProfile.name}, {currentProfile.age}
              </h2>
            </div>

            {/* City / College */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
              <MapPin className="w-3.5 h-3.5 text-[#FF4D8D] shrink-0" />
              <span className="truncate">{currentProfile.cityOrCollege}</span>
            </div>

            {/* Bio */}
            <p className="text-xs text-white/90 line-clamp-2 leading-relaxed">
              "{currentProfile.bio}"
            </p>

            {/* Interest Pills */}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {currentProfile.interests.map((tag, idx) => (
                <span
                  key={idx}
                  className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg border border-[#1A1A1A]/40 shadow-xs ${
                    pillColors[idx % pillColors.length]
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Control Buttons (Desktop & Accessibility Support) */}
      <div className="w-full mt-3 flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-6">
          {/* Pass Button */}
          <button
            onClick={() => triggerSwipe('PASS')}
            disabled={Boolean(swipingId)}
            className="w-16 h-16 rounded-full bg-white border-[2.5px] border-[#1A1A1A] shadow-brutal flex items-center justify-center text-[#1A1A1A] hover:bg-[#FEF08A] hover:scale-105 active:translate-x-[2px] active:translate-y-[2px] active:shadow-brutal-active transition-all disabled:opacity-50"
            aria-label="Pass (Swipe Left)"
            title="Pass (Left Arrow Key)"
          >
            <X className="w-7 h-7 stroke-[2.5]" />
          </button>

          {/* Like Button */}
          <button
            onClick={() => triggerSwipe('LIKE')}
            disabled={Boolean(swipingId)}
            className="w-16 h-16 rounded-full bg-[#FF4D8D] border-[2.5px] border-[#1A1A1A] shadow-brutal flex items-center justify-center text-white hover:bg-[#E03875] hover:scale-105 active:translate-x-[2px] active:translate-y-[2px] active:shadow-brutal-active transition-all disabled:opacity-50"
            aria-label="Like (Swipe Right)"
            title="Like (Right Arrow Key)"
          >
            <Heart className="w-7 h-7 fill-white" />
          </button>
        </div>

        {/* Keyboard helper hint */}
        <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-[#8E8E93] pt-1">
          <span className="flex items-center gap-0.5">
            <kbd className="px-1 py-0.2 bg-white border border-[#1A1A1A] rounded shadow-xs text-[10px]">←</kbd> Pass
          </span>
          <span>•</span>
          <span className="flex items-center gap-0.5">
            <kbd className="px-1 py-0.2 bg-white border border-[#1A1A1A] rounded shadow-xs text-[10px]">→</kbd> Like
          </span>
        </div>
      </div>
    </div>
  );
}
