import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle,
} from 'lucide-react';
import {
  Player,
  RevealedRanking,
  GameRound,
} from '../types/game';
import { sounds } from '../utils/sound';
import { AIHost } from './AIHost';

interface VotingScreenProps {
  round: GameRound;
  currentPlayer: Player;
  players: Player[];
  revealedRankings: RevealedRanking[];
  hasVoted: boolean;
  onCastVote: (targetPlayerId: string, reactionPhrase: string) => void;
  onProceedToResults: () => void;
  isHost: boolean;
}

const REACTION_PHRASES = [
  'Needs immediate supervision 🚨',
  'Criminal behavior 🚔',
  'I need an explanation 🤨',
  'Certified chaos merchant 🤡',
  'Absolute disaster 💥',
  'Are you genuinely okay? 🫠',
];

export const VotingScreen: React.FC<VotingScreenProps> = ({
  round,
  currentPlayer,
  players,
  revealedRankings,
  hasVoted,
  onCastVote,
  onProceedToResults,
  isHost,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedPhrase, setSelectedPhrase] = useState<string>(REACTION_PHRASES[0]);

  const candidates = players.filter((p) => p.id !== currentPlayer.id);

  const handleVoteSubmit = () => {
    if (!selectedTarget || hasVoted) return;
    sounds.playStamp();
    onCastVote(selectedTarget, selectedPhrase);
  };

  const votedCount = players.filter((p) => p.hasVoted).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-5">
      {/* Title Header */}
      <div className="text-center">
        <span className="px-3 py-1 rounded bg-[#FF4834] text-white font-bungee text-xs uppercase tracking-wider border-2 border-[#141316] shadow-[2px_2px_0px_#141316] inline-block -rotate-1">
          VOTING BOOTH • WORST TASTE
        </span>
        <h2 className="font-bungee text-2xl sm:text-3xl text-[#141316] dark:text-[#FAF5E8] mt-2">
          WHO HAS THE WORST TASTE?
        </h2>
        <p className="text-xs text-[#4B4952] dark:text-[#CBD5E1] max-w-md mx-auto mt-1 font-medium font-['Fredoka']">
          Select the friend whose choices were the most chaotic or indefensible this round.
        </p>
      </div>

      {/* Host commentary */}
      <div className="flex justify-center">
        <AIHost
          mood="suspicious"
          speech={
            hasVoted
              ? 'Your secret verdict is cast. Friendships have permanently shattered over less than this!'
              : 'Cast your ballot! Who among you needs to be questioned by an international tribunal?'
          }
          compact
        />
      </div>

      {/* Voting Cards Grid */}
      {!hasVoted ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {candidates.map((candidate) => {
              const candRanking = revealedRankings.find((r) => r.playerId === candidate.id);
              const isSelected = selectedTarget === candidate.id;

              return (
                <motion.button
                  key={candidate.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    sounds.playCardSnap();
                    setSelectedTarget(candidate.id);
                  }}
                  className={`sketch-card p-4 rounded-xl text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#141316] dark:border-[#FFE600] bg-[#FFEFEA] dark:bg-[#322329] ring-4 ring-[#FF4834]'
                      : 'bg-white dark:bg-[#252230] hover:bg-[#FFFEF8] dark:hover:bg-[#2E2A3B]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      style={{ backgroundColor: candidate.color }}
                      className="w-10 h-10 rounded-md border-2 border-[#141316] flex items-center justify-center text-2xl shadow-[1px_1px_0px_#141316]"
                    >
                      {candidate.avatar}
                    </div>
                    <div>
                      <h4 className="font-bungee text-sm text-[#141316] dark:text-[#FAF5E8] tracking-wide">
                        {candidate.name}
                      </h4>
                      <span className="text-[10px] font-doodle font-bold text-[#FF4834] dark:text-[#FF7360]">
                        Nominee for Worst Choices
                      </span>
                    </div>
                  </div>

                  {/* Summary of their #1 and #4 choices */}
                  {candRanking && (
                    <div className="text-[11px] font-['Fredoka'] space-y-1 bg-[#FAF5E8] dark:bg-[#1E1C27] p-2.5 rounded border border-[#141316] dark:border-[#FAF5E8]/30 mt-2">
                      <div className="text-[#00A859] truncate font-medium">
                        <strong className="font-bungee text-[10px]">#1:</strong>{' '}
                        {round.items.find((i) => i.id === candRanking.rankedItemIds[0])?.title}
                      </div>
                      <div className="text-[#FF4834] truncate font-medium">
                        <strong className="font-bungee text-[10px]">#4:</strong>{' '}
                        {round.items.find((i) => i.id === candRanking.rankedItemIds[3])?.title}
                      </div>
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute top-3 right-3 text-[#FF4834]">
                      <CheckCircle size={20} fill="#FF4834" color="#FFFFFF" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Reaction Stickers Selector */}
          {selectedTarget && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="sketch-card bg-[#FFFDF5] dark:bg-[#1E1C27] rounded-xl p-4 space-y-2"
            >
              <label className="text-xs font-bungee uppercase text-[#141316] dark:text-[#FAF5E8] tracking-wider block">
                ATTACH A STICKER SLANDER:
              </label>
              <div className="flex flex-wrap gap-2">
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
                        ? 'bg-[#FF4834] text-white'
                        : 'bg-white dark:bg-[#252230] text-[#141316] dark:text-[#FAF5E8] hover:bg-[#FFE600]'
                    }`}
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Submit Vote CTA */}
          <button
            onClick={handleVoteSubmit}
            disabled={!selectedTarget}
            className={`sketch-btn w-full py-3.5 rounded-md font-bungee text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer ${
              selectedTarget
                ? 'bg-[#FF4834] text-white hover:bg-[#E53B28] shadow-[2px_2px_0px_#141316] dark:shadow-[2px_2px_0px_#FFE600]'
                : 'bg-[#E5E0D5] dark:bg-[#343044] text-[#9CA3AF] border-[#141316]/30 cursor-not-allowed shadow-none'
            }`}
          >
            <span>CAST MY WORST TASTE VOTE</span>
          </button>
        </div>
      ) : (
        /* Voted Confirmation */
        <div className="sketch-card-lg bg-[#FFFDF5] dark:bg-[#1E1C27] rounded-xl p-8 text-center space-y-4 relative">
          <div className="tape-strip -top-3 left-1/2 -translate-x-1/2" />
          <div className="text-4xl animate-bounce">🗳️</div>
          <h3 className="font-bungee text-xl text-[#141316] dark:text-[#FAF5E8]">
            YOUR BALLOT HAS BEEN CAST
          </h3>
          <p className="text-xs text-[#4B4952] dark:text-[#CBD5E1] max-w-sm mx-auto font-medium font-['Fredoka']">
            {votedCount} of {players.length} contestants have submitted their votes.
          </p>

          <div className="pt-4 border-t-2 border-[#141316]/15 dark:border-[#FAF5E8]/20 flex justify-center">
            <button
              onClick={() => {
                sounds.playVictoryFlourish();
                onProceedToResults();
              }}
              className="sketch-btn py-3 px-8 rounded-md bg-[#00E871] text-[#141316] font-bungee text-sm tracking-wider flex items-center gap-2 cursor-pointer hover:bg-[#00D063]"
            >
              <span>SEE ROUND WINNERS & SCORES ➔</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
