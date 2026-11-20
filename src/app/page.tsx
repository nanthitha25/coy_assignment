'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Compass, Home, Heart, Sparkles } from 'lucide-react';
import { PublicProfile, MatchWithProfile, SwipeDirection } from '@/lib/types';
import { SwipeDeck } from '@/components/SwipeDeck';
import { MatchModal } from '@/components/MatchModal';
import { MatchesDrawer } from '@/components/MatchesDrawer';
import { EmptyFeed } from '@/components/EmptyFeed';
import { HomePlaceholder } from '@/components/HomePlaceholder';

export default function DiscoverApp() {
  const [activeTab, setActiveTab] = useState<'discover' | 'home'>('discover');
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isMatchesOpen, setIsMatchesOpen] = useState<boolean>(false);
  const [currentMatchModal, setCurrentMatchModal] = useState<MatchWithProfile | null>(null);

  // Fetch feed profiles from /api/feed
  const fetchFeed = useCallback(async () => {
    try {
      setIsLoadingFeed(true);
      const res = await fetch('/api/feed');
      if (!res.ok) throw new Error('Failed to load feed');
      const data = await res.json();
      setProfiles(data.profiles || []);
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setIsLoadingFeed(false);
    }
  }, []);

  // Fetch matches from /api/matches
  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch('/api/matches');
      if (!res.ok) throw new Error('Failed to load matches');
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err) {
      console.error('Error fetching matches:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFeed();
    fetchMatches();
  }, [fetchFeed, fetchMatches]);

  // Handle Swipe (Like or Pass)
  const handleSwipe = async (targetUserId: string, direction: SwipeDirection) => {
    // Optimistically advance the card deck
    setProfiles((prev) => prev.filter((p) => p.id !== targetUserId));

    try {
      const res = await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, direction }),
      });

      if (!res.ok) {
        throw new Error('Swipe request failed');
      }

      const result = await res.json();

      if (result.matched && result.match) {
        // Trigger Match Modal
        setCurrentMatchModal(result.match);
        // Refresh matches list
        setMatches((prev) => [result.match, ...prev]);
      }
    } catch (error) {
      console.error('Failed to register swipe:', error);
      // On network failure, re-fetch feed to keep client state synchronized
      fetchFeed();
    }
  };

  // Reset demo state via /api/reset
  const handleReset = async () => {
    try {
      setIsResetting(true);
      const res = await fetch('/api/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');
      await Promise.all([fetchFeed(), fetchMatches()]);
    } catch (err) {
      console.error('Error during demo reset:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-dvh sm:min-h-0 relative select-none">
      {/* Top Header */}
      <header className="px-5 py-3.5 bg-white border-b-[2.5px] border-[#1A1A1A] flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2">
          {/* coy. wordmark */}
          <span className="text-2xl font-black tracking-tight text-[#1A1A1A]">
            coy<span className="text-[#FF4D8D]">.</span>
          </span>

          {/* Active Feature Badge */}
          {activeTab === 'discover' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-black bg-[#FFE4EC] border-2 border-[#1A1A1A] rounded-full text-[#FF4D8D] shadow-brutal-sm">
              <Sparkles className="w-3 h-3" />
              <span>Discover</span>
            </span>
          )}
        </div>

        {/* Matches Button with live count */}
        <button
          onClick={() => setIsMatchesOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] border-2 border-[#1A1A1A] rounded-2xl shadow-brutal-sm hover:bg-[#FFE4EC] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          aria-label="View matches"
        >
          <Heart className="w-4 h-4 text-[#FF4D8D] fill-[#FF4D8D]" />
          <span className="text-xs font-black text-[#1A1A1A]">Matches</span>
          <span className="w-5 h-5 rounded-full bg-[#FF4D8D] text-white text-[10px] font-extrabold flex items-center justify-center">
            {matches.length}
          </span>
        </button>
      </header>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'home' ? (
          <HomePlaceholder onSwitchToDiscover={() => setActiveTab('discover')} />
        ) : isLoadingFeed ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#666666]">
            <div className="w-8 h-8 border-3 border-[#FF4D8D] border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs font-mono font-bold">Loading Discover Feed...</span>
          </div>
        ) : profiles.length === 0 ? (
          <EmptyFeed onReset={handleReset} isResetting={isResetting} />
        ) : (
          <SwipeDeck
            profiles={profiles}
            onSwipe={handleSwipe}
            isModalOpen={isMatchesOpen || Boolean(currentMatchModal)}
          />
        )}
      </div>

      {/* Bottom Navigation Tab Bar */}
      <nav className="border-t-[2.5px] border-[#1A1A1A] bg-white px-6 py-2.5 flex items-center justify-around shrink-0 z-30 shadow-xs">
        {/* Home Tab (Placeholder per spec) */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-[#FF4D8D] font-extrabold scale-105'
              : 'text-[#8E8E93] hover:text-[#1A1A1A] font-semibold'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.8]' : 'stroke-2'}`} />
          <span className="text-[11px]">Home</span>
        </button>

        {/* Discover Tab (Core functionality per spec) */}
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all relative ${
            activeTab === 'discover'
              ? 'text-[#FF4D8D] font-extrabold scale-105'
              : 'text-[#8E8E93] hover:text-[#1A1A1A] font-semibold'
          }`}
        >
          <Compass className={`w-5 h-5 ${activeTab === 'discover' ? 'stroke-[2.8]' : 'stroke-2'}`} />
          <span className="text-[11px]">Discover</span>
          {activeTab === 'discover' && (
            <span className="absolute -bottom-1 w-5 h-1 bg-[#FF4D8D] rounded-full" />
          )}
        </button>
      </nav>

      {/* "It's a Match!" Celebration Modal */}
      <MatchModal
        match={currentMatchModal}
        onClose={() => setCurrentMatchModal(null)}
        onViewMatches={() => {
          setCurrentMatchModal(null);
          setIsMatchesOpen(true);
        }}
      />

      {/* Matches Drawer Sheet */}
      <MatchesDrawer
        isOpen={isMatchesOpen}
        onClose={() => setIsMatchesOpen(false)}
        matches={matches}
        isLoading={false}
      />
    </div>
  );
}
