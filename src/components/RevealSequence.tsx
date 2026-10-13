import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Vote,
  Sparkles,
  Flame,
  Crown,
} from 'lucide-react';
import {
  GameRound,
  RevealedRanking,
  Player,
  PlayerVote,
  RankingItem,
} from '../types/game';
import { sounds } from '../utils/sound';
import { AIHost } from './AIHost';

interface RevealSequenceProps {
  round: GameRound;
  revealedRankings: RevealedRanking[];
  currentPlayer: Player;
  players: Player[];
  votes?: PlayerVote[];
  hasVoted?: boolean;
  isHost: boolean;
  onCastVote?: (targetPlayerId: string, reactionPhrase: string) => void;
  onProceedToVoting?: () => void;
  onProceedToResults?: () => void;
}

const REACTION_PHRASES = [
  'Needs immediate supervision 🚨',
  'Criminal behavior 🚔',
  'I need an explanation 🤨',
  'Certified disaster 💥',
  'Are you genuinely okay? 🫠',
  'Unhinged judgment 🤡',
];

export const RevealSequence: React.FC<RevealSequenceProps> = ({
  round,
  revealedRankings,
  currentPlayer,
  players,
  votes = [],
  hasVoted = false,
  isHost,
  onCastVote,
  onProceedToResults,
  onProceedToVoting,
}) => {
  const [selectedPhrase, setSelectedPhrase] = useState(REACTION_PHRASES[0]);
  const [votedTargetId, setVotedTargetId] = useState<string | null>(null);
  const [aiRoast, setAiRoast] = useState<string | null>(null);

  useEffect(() => {
    sounds.playVictoryFlourish();
    fetchAiRoast();
  }, []);

  const fetchAiRoast = async () => {
    try {
      const summary = revealedRankings.map((r) => ({
        player: r.playerName,
        rank1_best: round.items.find((i) => i.id === r.rankedItemIds[0])?.title,
        rank4_worst: round.items.find((i) => i.id === r.rankedItemIds[3])?.title,
      }));

      const res = await fetch('/api/host-roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: round.category,
          scenario: round.prompt,
          playerRankings: summary,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiRoast(data.roast);
      }
    } catch (err) {
      console.warn('Roast fetch failed:', err);
    }
  };

  const getItem = (id: string): RankingItem => {
    return round.items.find((i) => i.id === id) || round.items[0];
  };

  // Find biggest polar disagreement (item ranked #1 by one player and #4 by another)
  const rank4Items = revealedRankings.map((r) => r.rankedItemIds[3]);
  const rank1Items = revealedRankings.map((r) => r.rankedItemIds[0]);

  let scandalousItem: RankingItem | null = null;
  for (const id of ['A', 'B', 'C', 'D']) {
    if (rank1Items.includes(id as any) && rank4Items.includes(id as any)) {
      scandalousItem = getItem(id);
      break;
    }
  }

  const handleVote = (targetPlayerId: string) => {
    if (hasVoted || votedTargetId) return;
    sounds.playStamp();
    setVotedTargetId(targetPlayerId);
    if (onCastVote) {
      onCastVote(targetPlayerId, selectedPhrase);
    }
  };

  const handleProceed = () => {
    sounds.playVictoryFlourish();
    if (onProceedToResults) {
      onProceedToResults();
    } else if (onProceedToVoting) {
      onProceedToVoting();
    }
  };

  // Count votes received per player
  const voteTally: Record<string, number> = {};
  votes.forEach((v) => {
    voteTally[v.targetPlayerId] = (voteTally[v.targetPlayerId] || 0) + 1;
  });

  const totalVotesCast = votes.length;
  const isUserVoted = hasVoted || votedTargetId !== null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-5">
      {/* Header Banner */}
      <div className="text-center space-y-1">
        <span className="px-3 py-1 rounded bg-[#FFE600] text-[#141316] font-bungee text-xs uppercase tracking-wider border-2 border-[#141316] shadow-[2px_2px_0px_#141316] inline-block -rotate-1">
          REVEAL & VOTE • {round.category}
        </span>
        <h2 className="font-bungee text-xl sm:text-3xl text-[#141316] dark:text-[#FAF5E8]">
          {round.prompt}
        </h2>
        <p className="text-xs sm:text-sm text-[#4B4952] dark:text-[#CBD5E1] max-w-xl mx-auto font-medium font-['Fredoka']">
          Everyone's choices are revealed below! Compare all ballots, then vote for whoever had the absolute worst judgment.
        </p>
      </div>

      {/* Host commentary */}
      <div className="flex justify-center">
        <AIHost
          mood={scandalousItem ? 'shocked' : 'celebrating'}
          speech={
            aiRoast ||
            (scandalousItem
              ? `Unbelievable! You couldn't agree even slightly on "${scandalousItem.title}". Cast your votes for the worst choices below!`
              : 'Behold the full spectrum of opinion! Vote on which friend deserves the Worst Taste crown.')
          }
        />
      </div>

      {/* Major Disagreement Callout Banner */}
      {scandalousItem && (
        <motion.div
          initial={{ scale: 0.96 }}
          animate={{ scale: 1 }}
          className="sketch-card bg-[#FFEFEA] dark:bg-[#2A212E] rounded-xl p-3.5 flex items-center gap-3 relative"
        >
          <div className="text-3xl">🚨</div>
          <div>
            <h4 className="font-bungee text-xs text-[#FF4834] uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={15} />
              <span>POLAR OPPOSITES DETECTED!</span>
            </h4>
            <p className="text-xs text-[#141316] dark:text-[#FAF5E8] mt-0.5 font-medium font-['Fredoka']">
              "{scandalousItem.title}" was ranked <strong className="text-[#00A859]">#1 (Best)</strong> by one player and <strong className="text-[#FF4834]">#4 (Absolute Trash)</strong> by another!
            </p>
          </div>
        </motion.div>
      )}

      {/* Reaction phrase picker for voting */}
      {!isUserVoted && (
        <div className="sketch-card bg-[#FFFDF5] dark:bg-[#1E1C27] rounded-xl p-3.5 space-y-2">
          <label className="text-[11px] font-bungee uppercase text-[#141316] dark:text-[#FAF5E8] tracking-wider block">
            CHOOSE A STICKER SLANDER BEFORE VOTING:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {REACTION_PHRASES.map((phrase) => (
              <button
                key={phrase}
                type="button"
                onClick={() => {
                  sounds.playVoteTick();
                  setSelectedPhrase(phrase);
                }}
                className={`sketch-btn px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer font-['Fredoka'] ${
                  selectedPhrase === phrase
                    ? 'bg-[#FF4834] text-white shadow-[2px_2px_0px_#141316]'
                    : 'bg-white dark:bg-[#252230] text-[#141316] dark:text-[#FAF5E8] hover:bg-[#FFE600] dark:hover:bg-[#343044]'
                }`}
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Everyone's Answers Revealed at the Same Place in a Side-by-Side Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {revealedRankings.map((r, pIdx) => {
          const isThisMe = r.playerId === currentPlayer.id;
          const votesReceived = voteTally[r.playerId] || 0;
          const isMyVotedPick = votedTargetId === r.playerId;

          return (
            <motion.div
              key={r.playerId}
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: pIdx * 0.08, duration: 0.3 }}
              className={`sketch-card relative rounded-xl p-3.5 flex flex-col justify-between ${
                isThisMe
                  ? 'bg-[#FFFEEA] dark:bg-[#2C291E] border-[#141316] dark:border-[#FFE600]'
                  : 'bg-[#FFFDF5] dark:bg-[#1E1C27]'
              }`}
            >
              <div>
                {/* Player Card Header */}
                <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b-2 border-[#141316]/15 dark:border-[#FAF5E8]/20">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      style={{ backgroundColor: r.color }}
                      className="w-8 h-8 rounded border-2 border-[#141316] flex items-center justify-center text-lg shrink-0 shadow-[1px_1px_0px_#141316]"
                    >
                      {r.avatar}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bungee text-xs text-[#141316] dark:text-[#FAF5E8] truncate">
                        {r.playerName}
                      </h4>
                      <span className="text-[10px] font-doodle font-bold text-[#6B7280] dark:text-[#A8A5B3]">
                        {isThisMe ? 'Your Ballot' : 'Contestant'}
                      </span>
                    </div>
                  </div>

                  {/* Live votes tally badge */}
                  {votesReceived > 0 && (
                    <div className="px-2 py-0.5 rounded bg-[#FF4834] text-white font-bungee text-[10px] border border-[#141316] shadow-[1px_1px_0px_#141316] shrink-0 animate-pulse">
                      {votesReceived} {votesReceived === 1 ? 'VOTE' : 'VOTES'}
                    </div>
                  )}
                </div>

                {/* 4 Revealed Choices in Order */}
                <div className="space-y-1.5 mb-3">
                  {r.rankedItemIds.map((itemId, idx) => {
                    const item = getItem(itemId);
                    const rank = idx + 1;
                    const tierBadge =
                      rank === 1
                        ? 'bg-[#00E871] text-[#141316]'
                        : rank === 2
                        ? 'bg-[#4CC9F0] text-[#141316]'
                        : rank === 3
                        ? 'bg-[#FFAA00] text-[#141316]'
                        : 'bg-[#FF4834] text-white';

                    return (
                      <div
                        key={itemId}
                        className="p-1.5 rounded-md border border-[#141316]/30 dark:border-[#FAF5E8]/25 bg-white dark:bg-[#252230] flex items-center gap-2 shadow-[1px_1px_0px_#141316]"
                      >
                        <span
                          className={`w-5 h-5 rounded font-bungee text-[9px] border border-[#141316] flex items-center justify-center shrink-0 ${tierBadge}`}
                        >
                          #{rank}
                        </span>
                        <span className="text-base shrink-0">{item.icon_suggestion}</span>
                        <span className="text-[11px] font-bold text-[#141316] dark:text-[#FAF5E8] truncate leading-tight">
                          {item.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Voting Action Area on each Card */}
              <div className="pt-2 border-t-2 border-[#141316]/10 dark:border-[#FAF5E8]/15">
                {isThisMe ? (
                  <div className="text-center py-2 text-[10px] font-bungee text-[#6B7280] dark:text-[#A8A5B3] bg-white/60 dark:bg-black/30 rounded border border-[#141316]/20 dark:border-[#FAF5E8]/20">
                    YOUR BALLOT
                  </div>
                ) : isMyVotedPick ? (
                  <div className="sketch-card text-center py-2 bg-[#FF4834] text-white font-bungee text-[11px] rounded flex items-center justify-center gap-1.5">
                    <CheckCircle size={14} />
                    <span>YOUR VOTE CAST!</span>
                  </div>
                ) : !isUserVoted ? (
                  <button
                    onClick={() => handleVote(r.playerId)}
                    className="sketch-btn w-full py-2 px-2 rounded bg-[#FFE600] hover:bg-[#FF4834] hover:text-white text-[#141316] font-bungee text-[11px] tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#141316]"
                  >
                    <Vote size={13} />
                    <span>VOTE WORST RANK</span>
                  </button>
                ) : (
                  <div className="text-center py-2 text-[10px] font-bungee text-[#9CA3AF] bg-gray-50 dark:bg-[#252230] rounded border border-[#141316]/15 dark:border-[#FAF5E8]/15">
                    CANDIDATE
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Sticky Bar: Voting Status & Advance to Results */}
      <div className="sketch-card-lg bg-[#FFFDF5] dark:bg-[#1E1C27] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bungee text-sm sm:text-base text-[#141316] dark:text-[#FAF5E8]">
              {isUserVoted ? '✓ YOUR VOTE IS SUBMITTED' : 'CAST YOUR VOTE ABOVE'}
            </h3>
            <span className="px-2 py-0.5 rounded bg-[#FFE600] border border-[#141316] font-bungee text-[10px] text-[#141316]">
              {totalVotesCast} / {players.length} VOTES IN
            </span>
          </div>
          <p className="text-xs text-[#4B4952] dark:text-[#CBD5E1] mt-0.5 font-medium font-['Fredoka']">
            {isUserVoted
              ? 'Great! Once all debaters have voted, proceed to the scoreboard to crown the Worst Taste Champion.'
              : 'Click "VOTE WORST RANK" on the player card with the most unacceptable ballot.'}
          </p>
        </div>

        <button
          onClick={handleProceed}
          className="sketch-btn w-full sm:w-auto py-3 px-6 rounded-md bg-[#00E871] text-[#141316] font-bungee text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:bg-[#00D063] shrink-0"
        >
          <span>SEE ROUND RESULTS & SCORES</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
