import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Crown, ArrowRight } from 'lucide-react';
import { Player, GameRound, PlayerVote } from '../types/game';
import { sounds } from '../utils/sound';
import { AIHost } from './AIHost';

interface RoundResultsProps {
  round: GameRound;
  roundNumber: number;
  totalRounds: number;
  players: Player[];
  playerScoresEarned: Record<
    string,
    { consensus: number; worstChoices: number; special: number; total: number }
  >;
  worstChoicesWinners: string[];
  votes: PlayerVote[];
  isHost: boolean;
  onNextRound: () => void;
}

export const RoundResults: React.FC<RoundResultsProps> = ({
  round,
  roundNumber,
  totalRounds,
  players,
  playerScoresEarned,
  worstChoicesWinners,
  votes,
  isHost,
  onNextRound,
}) => {
  const isFinalRound = roundNumber >= totalRounds;
  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
  const winnerPlayers = players.filter((p) => worstChoicesWinners.includes(p.id));

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-5">
      {/* Top Banner */}
      <div className="text-center">
        <span className="px-3 py-1 rounded bg-[#FFE600] text-[#141316] font-bungee text-xs uppercase tracking-wider border-2 border-[#141316] shadow-[2px_2px_0px_#141316] inline-block -rotate-1">
          ROUND {roundNumber} OF {totalRounds} RESULTS
        </span>
        <h2 className="font-bungee text-2xl sm:text-3xl text-[#141316] dark:text-[#FAF5E8] mt-2">
          THE DUST SETTLES
        </h2>
      </div>

      {/* Host commentary */}
      <div className="flex justify-center">
        <AIHost
          mood="celebrating"
          speech={
            winnerPlayers.length > 0
              ? `Congratulations to ${winnerPlayers.map((w) => w.name).join(' & ')} for earning the prestigious Worst Taste Title! An astounding triumph of questionable judgment.`
              : 'A surprisingly unanimous round. Perhaps there is hope for this friend group after all!'
          }
        />
      </div>

      {/* Worst Choices Winner Spotlight Card */}
      {winnerPlayers.length > 0 && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="sketch-card bg-[#FFEFEA] dark:bg-[#2A212E] rounded-xl p-6 text-center space-y-3 relative overflow-hidden"
        >
          <div className="tape-strip -top-3 left-8" />
          <div className="tape-strip -top-3 right-8 rotate-3" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF4834] text-white text-[11px] font-bungee uppercase rounded border border-[#141316] shadow-[2px_2px_0px_#141316]">
            <Crown size={13} />
            <span>WORST CHOICES CHAMPION (+3 PTS)</span>
          </div>

          <div className="flex items-center justify-center gap-4">
            {winnerPlayers.map((winner) => (
              <div key={winner.id} className="flex flex-col items-center">
                <div
                  style={{ backgroundColor: winner.color }}
                  className="w-16 h-16 rounded-xl border-3 border-[#141316] flex items-center justify-center text-3xl shadow-[3px_3px_0px_#141316]"
                >
                  {winner.avatar}
                </div>
                <h3 className="font-bungee text-base sm:text-lg text-[#141316] dark:text-[#FAF5E8] mt-2">
                  {winner.name}
                </h3>
              </div>
            ))}
          </div>

          <p className="text-xs font-['Fredoka'] text-[#4B4952] dark:text-[#CBD5E1] max-w-md mx-auto">
            Awarded for gathering the most "Worst Rank" reaction votes from the room. Wear this crown with shameless pride!
          </p>
        </motion.div>
      )}

      {/* Live Leaderboard Table */}
      <div className="sketch-card bg-[#FFFDF5] dark:bg-[#1E1C27] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3 border-b-2 border-[#141316]/15 dark:border-[#FAF5E8]/20 pb-2.5">
          <h3 className="font-bungee text-xs text-[#141316] dark:text-[#FAF5E8] flex items-center gap-2">
            <Trophy size={16} className="text-[#FF4834]" />
            <span>CURRENT STANDINGS</span>
          </h3>
          <span className="text-[11px] font-doodle font-bold text-[#6B7280] dark:text-[#A8A5B3]">
            Consensus + Worst Taste Votes
          </span>
        </div>

        <div className="space-y-2">
          {sortedPlayers.map((p, idx) => {
            const roundBreakdown = playerScoresEarned[p.id] || {
              consensus: 0,
              worstChoices: 0,
              special: 0,
              total: 0,
            };

            return (
              <div
                key={p.id}
                className="p-3 rounded-lg border-2 border-[#141316]/20 dark:border-[#FAF5E8]/25 bg-white dark:bg-[#262332] flex items-center justify-between hover:border-[#141316] dark:hover:border-[#FFE600] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 font-bungee text-xs text-[#141316] dark:text-[#FAF5E8]">
                    #{idx + 1}
                  </span>
                  <div
                    style={{ backgroundColor: p.color }}
                    className="w-9 h-9 rounded-md border-2 border-[#141316] flex items-center justify-center text-lg shrink-0 shadow-[1px_1px_0px_#141316]"
                  >
                    {p.avatar}
                  </div>
                  <div>
                    <h4 className="font-bungee text-xs sm:text-sm text-[#141316] dark:text-[#FAF5E8] uppercase truncate">
                      {p.name}
                    </h4>
                    <div className="text-[11px] text-[#4B4952] dark:text-[#CBD5E1] font-medium font-['Fredoka']">
                      +{roundBreakdown.consensus} consensus{' '}
                      {roundBreakdown.worstChoices > 0 &&
                        `• +${roundBreakdown.worstChoices} worst taste`}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bungee text-sm sm:text-base text-[#141316] dark:text-[#FAF5E8]">
                    {p.totalScore} PTS
                  </div>
                  {roundBreakdown.total > 0 && (
                    <div className="text-[10px] font-bungee text-[#00E871]">
                      +{roundBreakdown.total} THIS ROUND
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Round Action */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => {
            sounds.playStamp();
            onNextRound();
          }}
          className="sketch-btn w-full sm:w-auto py-3.5 px-10 rounded-md bg-[#FF4834] text-white font-bungee text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:bg-[#E53B28] shadow-[3px_3px_0px_#141316] dark:shadow-[3px_3px_0px_#FFE600]"
        >
          <span>
            {isFinalRound ? 'PROCEED TO GRAND FINALE 🏆' : 'CONTINUE TO NEXT ROUND ➔'}
          </span>
        </button>
      </div>
    </div>
  );
};
