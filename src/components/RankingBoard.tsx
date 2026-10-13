import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Shuffle,
  RotateCcw,
  CheckCircle,
  Lock,
  Timer,
  Sparkles,
  HelpCircle,
  Flame,
} from 'lucide-react';
import { GameRound, RankingItem, Player } from '../types/game';
import { sounds } from '../utils/sound';
import { AIHost } from './AIHost';

interface RankingBoardProps {
  round: GameRound;
  roundNumber: number;
  totalRounds: number;
  currentPlayer: Player;
  players: Player[];
  hasSubmitted: boolean;
  onSubmitRanking: (rankedIds: ('A' | 'B' | 'C' | 'D')[]) => void;
  timerSeconds?: number;
  onTimeExpired?: () => void;
}

const TIER_META = [
  {
    rank: 1,
    label: '#1 BEST CHOICE',
    badge: 'bg-[#00E871] text-[#141316]',
    desc: 'Completely fine & defensible',
    border: 'border-[#00E871]',
    bg: 'bg-[#F2FCF6]',
    icon: '🥇',
  },
  {
    rank: 2,
    label: '#2 SOLID ENOUGH',
    badge: 'bg-[#4CC9F0] text-[#141316]',
    desc: 'Not great, but acceptable',
    border: 'border-[#4CC9F0]',
    bg: 'bg-[#F0FAFD]',
    icon: '👍',
  },
  {
    rank: 3,
    label: '#3 QUESTIONABLE',
    badge: 'bg-[#FFAA00] text-[#141316]',
    desc: 'Eyebrow-raising behavior',
    border: 'border-[#FFAA00]',
    bg: 'bg-[#FFFBF0]',
    icon: '⚠️',
  },
  {
    rank: 4,
    label: '#4 ABSOLUTE CRIME',
    badge: 'bg-[#FF4834] text-white',
    desc: 'Indefensible, unforgivable trash',
    border: 'border-[#FF4834]',
    bg: 'bg-[#FFF2F0]',
    icon: '🚨',
  },
];

export const RankingBoard: React.FC<RankingBoardProps> = ({
  round,
  roundNumber,
  totalRounds,
  currentPlayer,
  players,
  hasSubmitted,
  onSubmitRanking,
  timerSeconds = 60,
  onTimeExpired,
}) => {
  const [items, setItems] = useState<RankingItem[]>(round.items);
  const [selectedSwapId, setSelectedSwapId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(timerSeconds);

  useEffect(() => {
    setItems(round.items);
  }, [round]);

  useEffect(() => {
    if (timerSeconds <= 0 || hasSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeExpired) onTimeExpired();
          return 0;
        }
        if (prev <= 6) {
          sounds.playVoteTick();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds, hasSubmitted, onTimeExpired]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (hasSubmitted) return;
    sounds.playCardSnap();
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setItems(newItems);
  };

  const handleItemClick = (id: string) => {
    if (hasSubmitted) return;
    sounds.playCardFlick();
    if (!selectedSwapId) {
      setSelectedSwapId(id);
    } else if (selectedSwapId === id) {
      setSelectedSwapId(null);
    } else {
      // Swap selected with clicked
      const idx1 = items.findIndex((i) => i.id === selectedSwapId);
      const idx2 = items.findIndex((i) => i.id === id);
      if (idx1 !== -1 && idx2 !== -1) {
        sounds.playStamp();
        const copy = [...items];
        const temp = copy[idx1];
        copy[idx1] = copy[idx2];
        copy[idx2] = temp;
        setItems(copy);
      }
      setSelectedSwapId(null);
    }
  };

  const handleShuffle = () => {
    if (hasSubmitted) return;
    sounds.playCardFlick();
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setItems(shuffled);
  };

  const handleInvert = () => {
    if (hasSubmitted) return;
    sounds.playCardFlick();
    setItems([...items].reverse());
  };

  const handleSubmit = () => {
    if (hasSubmitted) return;
    sounds.playStamp();
    const rankedIds = items.map((i) => i.id as 'A' | 'B' | 'C' | 'D');
    onSubmitRanking(rankedIds);
  };

  const submittedCount = players.filter(
    (p) => p.hasSubmittedRanking || (p.id === currentPlayer.id && hasSubmitted)
  ).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* Top Dilemma Spotlight Card */}
      <div className="sketch-card bg-[#FFFDF5] dark:bg-[#1E1C27] rounded-xl p-4 sm:p-5 text-center relative">
        <div className="tape-strip -top-3 left-10" />
        <div className="tape-strip -top-3 right-10 rotate-3" />

        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="px-2.5 py-1 rounded bg-[#FFE600] text-[#141316] font-bungee text-xs uppercase tracking-wider border-2 border-[#141316] shadow-[2px_2px_0px_#141316]">
            {round.category}
          </span>

          {timerSeconds > 0 && !hasSubmitted && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border-2 border-[#141316] font-bungee text-xs ${
                timeLeft <= 10
                  ? 'bg-[#FF4834] text-white animate-bounce'
                  : 'bg-white dark:bg-[#252230] text-[#141316] dark:text-[#FAF5E8]'
              }`}
            >
              <Timer size={14} />
              <span>{timeLeft}S LEFT</span>
            </div>
          )}
        </div>

        <h2 className="font-bungee text-lg sm:text-2xl text-[#141316] dark:text-[#FAF5E8] leading-snug max-w-xl mx-auto">
          {round.prompt}
        </h2>

        {/* Intuitive visual scale reference bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-4 pt-3 border-t-2 border-[#141316]/15 dark:border-[#FAF5E8]/20 text-[11px] font-bungee">
          {TIER_META.map((t) => (
            <div
              key={t.rank}
              className={`p-1.5 rounded border border-[#141316] flex flex-col items-center justify-center text-center ${t.badge}`}
            >
              <span>{t.icon} #{t.rank}</span>
              <span className="text-[9px] font-['Fredoka'] font-normal opacity-90 truncate max-w-full">
                {t.rank === 1 ? round.scale_labels.rank_1 : t.rank === 4 ? round.scale_labels.rank_4 : t.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Host commentary */}
      <div className="flex justify-center">
        <AIHost
          mood={hasSubmitted ? 'suspicious' : 'neutral'}
          speech={
            hasSubmitted
              ? 'Your secret ranking is locked in vault! Awaiting other players to reveal the chaos.'
              : round.host_commentary
          }
          compact
        />
      </div>

      {/* Reorderable Ranking List with Intuitive Structure */}
      <div className="space-y-3">
        {/* Interaction hint & Quick controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="text-xs font-black uppercase text-[#141316] dark:text-[#FAF5E8] flex items-center gap-1.5">
            <ArrowUpDown size={14} className="text-[#FF4834]" />
            <span>
              {selectedSwapId
                ? '👆 Tap any other card to swap positions!'
                : 'Tap cards or use ▲ ▼ arrows to rank'}
            </span>
          </div>

          {!hasSubmitted && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleInvert}
                className="sketch-btn px-2 py-1 rounded bg-white dark:bg-[#252230] text-[11px] font-bungee text-[#141316] dark:text-[#FAF5E8] flex items-center gap-1 cursor-pointer"
                title="Flip choices upside down"
              >
                <RotateCcw size={12} />
                <span>INVERT</span>
              </button>
              <button
                onClick={handleShuffle}
                className="sketch-btn px-2 py-1 rounded bg-white dark:bg-[#252230] text-[11px] font-bungee text-[#141316] dark:text-[#FAF5E8] flex items-center gap-1 cursor-pointer"
                title="Randomize choices"
              >
                <Shuffle size={12} />
                <span>SHUFFLE</span>
              </button>
            </div>
          )}
        </div>

        {/* 4 Animated Tier Cards */}
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {items.map((item, index) => {
              const tier = TIER_META[index];
              const isSelected = selectedSwapId === item.id;
              const isFirst = index === 0;
              const isLast = index === items.length - 1;

              return (
                <motion.div
                  key={item.id}
                  layout
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  onClick={() => handleItemClick(item.id)}
                  className={`sketch-card relative rounded-xl border-3 border-[#141316] dark:border-[#FAF5E8]/35 p-3.5 transition-all select-none cursor-pointer ${
                    isSelected
                      ? 'ring-4 ring-[#FFE600] scale-[1.02] bg-[#FFFEEA] dark:bg-[#343044] shadow-[5px_5px_0px_#141316] dark:shadow-[5px_5px_0px_#FFE600]'
                      : 'bg-white dark:bg-[#252230] hover:bg-[#FFFEF8] dark:hover:bg-[#2F2B3D]'
                  } ${hasSubmitted ? 'opacity-85 cursor-default' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Tier Slot Badge */}
                    <div
                      className={`px-2.5 py-1.5 rounded-md border-2 border-[#141316] font-bungee text-xs shrink-0 flex flex-col items-center justify-center min-w-[70px] shadow-[2px_2px_0px_#141316] ${tier.badge}`}
                    >
                      <span className="text-sm leading-none">{tier.icon}</span>
                      <span className="text-[10px] mt-0.5 tracking-wider">#{tier.rank}</span>
                    </div>

                    {/* Dilemma Icon */}
                    <div className="text-2xl shrink-0 p-2 rounded-md bg-[#FAF5E8] dark:bg-[#1D1B27] border-2 border-[#141316] dark:border-[#FAF5E8]/30">
                      {item.icon_suggestion || '📦'}
                    </div>

                    {/* Title & Description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bungee text-xs sm:text-sm text-[#141316] dark:text-[#FAF5E8] leading-tight">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-[#4B4952] dark:text-[#CBD5E1] font-medium leading-snug mt-0.5 font-['Fredoka']">
                        {item.description}
                      </p>
                      <span className="text-[10px] font-doodle font-bold text-[#6B7280] dark:text-[#A8A5B3]">
                        Slot status: {tier.label}
                      </span>
                    </div>

                    {/* Up / Down Navigation Controls */}
                    {!hasSubmitted ? (
                      <div
                        className="flex flex-col gap-1 shrink-0 ml-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          disabled={isFirst}
                          onClick={() => moveItem(index, 'up')}
                          className={`sketch-btn w-8 h-8 rounded flex items-center justify-center cursor-pointer ${
                            isFirst
                              ? 'opacity-20 cursor-not-allowed bg-gray-100 dark:bg-gray-800 shadow-none'
                              : 'bg-[#FFE600] text-[#141316] hover:bg-[#FFF266]'
                          }`}
                          title="Move up one slot"
                        >
                          <ArrowUp size={16} strokeWidth={3} />
                        </button>
                        <button
                          disabled={isLast}
                          onClick={() => moveItem(index, 'down')}
                          className={`sketch-btn w-8 h-8 rounded flex items-center justify-center cursor-pointer ${
                            isLast
                              ? 'opacity-20 cursor-not-allowed bg-gray-100 dark:bg-gray-800 shadow-none'
                              : 'bg-[#FF4834] text-white hover:bg-[#E53B28]'
                          }`}
                          title="Move down one slot"
                        >
                          <ArrowDown size={16} strokeWidth={3} />
                        </button>
                      </div>
                    ) : (
                      <div className="shrink-0 text-[#00A859] p-2">
                        <Lock size={18} />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Submission CTA & Contestant Status */}
      <div className="sketch-card bg-[#FFFDF5] dark:bg-[#1E1C27] rounded-xl p-4 md:p-5 space-y-3.5">
        {/* Opponents Status Row */}
        <div>
          <div className="flex items-center justify-between text-xs font-black uppercase text-[#141316] dark:text-[#FAF5E8] mb-1.5">
            <span>BALLOTS LOCKED IN</span>
            <span className="font-bungee text-[#1E40FF] dark:text-[#60A5FA]">
              {submittedCount} / {players.length} SUBMITTED
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {players.map((p) => {
              const isLocked = p.hasSubmittedRanking || (p.id === currentPlayer.id && hasSubmitted);
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border-2 border-[#141316] dark:border-[#FAF5E8]/30 text-xs font-bold transition-all shadow-[1px_1px_0px_#141316] ${
                    isLocked
                      ? 'bg-[#00E871] text-[#141316]'
                      : 'bg-white dark:bg-[#252230] text-[#6B7280] dark:text-[#A8A5B3]'
                  }`}
                  title={isLocked ? `${p.name} has submitted` : `${p.name} is still deciding`}
                >
                  <span>{p.avatar}</span>
                  <span className="truncate max-w-[70px]">{p.name}</span>
                  {isLocked && <CheckCircle size={12} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lock In Button */}
        {!hasSubmitted ? (
          <button
            onClick={handleSubmit}
            className="sketch-btn w-full py-4 rounded-md bg-[#FF4834] text-white font-bungee text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:bg-[#E53B28] shadow-[3px_3px_0px_#141316] dark:shadow-[3px_3px_0px_#FFE600]"
          >
            <Lock size={16} />
            <span>SEAL MY FINAL RANKING</span>
          </button>
        ) : (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="p-3.5 rounded-md bg-[#00E871] border-2 border-[#141316] text-center shadow-[2px_2px_0px_#141316]"
          >
            <span className="text-sm font-bungee text-[#141316] uppercase tracking-wider block">
              ✓ BALLOT SEALED IN VAULT
            </span>
            <span className="text-xs text-[#141316] font-medium mt-0.5 block font-['Fredoka']">
              Waiting for remaining debaters. Once all ballots are locked, everyone's rankings will be revealed together!
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
};
