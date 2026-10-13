import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Crown,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';
import { Player, GameRoom } from '../types/game';
import { sounds } from '../utils/sound';
import { AIHost } from './AIHost';

interface FinalResultsProps {
  room: GameRoom;
  players: Player[];
  onRematch: () => void;
  onReturnToLobby: () => void;
}

const SATIRICAL_TITLES = [
  'Minister of Bad Decisions 📜',
  'CEO of Questionable Taste 👔',
  'Certified Chaos Merchant 🎪',
  'The Human Red Flag 🚩',
  'Supreme Court of Terrible Opinions ⚖️',
  'Professional Contrarian 🎭',
  "The Group's Last Brain Cell 🧠",
  'Surprisingly Functional Adult 🪴',
  'Agent of Unnecessary Conflict 🌪️',
  'Champion of the Wrong Answer 🥇',
];

export const FinalResults: React.FC<FinalResultsProps> = ({
  room,
  players,
  onRematch,
  onReturnToLobby,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    sounds.playVictoryFlourish();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  }, []);

  const sorted = [...players].sort((a, b) => b.totalScore - a.totalScore);
  const grandChampion = sorted[0];

  const playerTitles: Record<string, string> = {};
  sorted.forEach((p, idx) => {
    if (idx === 0) {
      playerTitles[p.id] = p.worstChoiceAwards > 0
        ? 'Supreme Chaos Overlord 👑'
        : 'The Group’s Last Brain Cell 🧠';
    } else if (p.worstChoiceAwards >= 2) {
      playerTitles[p.id] = 'Minister of Bad Decisions 📜';
    } else {
      playerTitles[p.id] = SATIRICAL_TITLES[(idx + p.name.length) % SATIRICAL_TITLES.length];
    }
  });

  const handleCopyShareSummary = () => {
    const summaryText = `🏆 UNRANKED: Order of Chaos — Final Standings!
Room Code: ${room.code}
Grand Champion: ${grandChampion?.name} (${grandChampion?.totalScore} pts) - ${playerTitles[grandChampion?.id || '']}
${sorted
  .map(
    (p, i) =>
      `#${i + 1} ${p.name}: ${p.totalScore} pts (${playerTitles[p.id]})`
  )
  .join('\n')}

Play UnRanked with your friends!`;

    navigator.clipboard.writeText(summaryText);
    sounds.playClick();
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [-3, 3, -3] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
          className="inline-block text-5xl"
        >
          🏆
        </motion.div>
        <h1 className="font-bungee text-4xl sm:text-5xl text-[#141316] dark:text-[#FAF5E8]">
          GRAND FINALE
        </h1>
        <p className="font-doodle text-xl text-[#FF4834] dark:text-[#FF7360] font-bold">
          Order of Chaos Award Ceremony
        </p>
      </div>

      {/* Host commentary */}
      <div className="flex justify-center">
        <AIHost
          mood="celebrating"
          speech={`What a magnificent circus of disastrous perspectives! All hail ${grandChampion?.name}, whose brazen confidence survived the gauntlet!`}
        />
      </div>

      {/* Grand Champion Podium Card */}
      {grandChampion && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sketch-card-lg bg-[#FFE600] rounded-xl p-8 text-center space-y-3 relative overflow-hidden"
        >
          <div className="tape-strip -top-3 left-10" />
          <div className="tape-strip -top-3 right-10 rotate-3" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141316] text-[#FFE600] text-xs font-bungee uppercase rounded shadow-[2px_2px_0px_#141316]">
            <Crown size={14} />
            <span>GRAND CHAOS CHAMPION</span>
          </div>

          <div
            style={{ backgroundColor: grandChampion.color }}
            className="w-24 h-24 rounded-2xl border-4 border-[#141316] flex items-center justify-center text-5xl mx-auto shadow-[4px_4px_0px_#141316] mt-2"
          >
            {grandChampion.avatar}
          </div>

          <h2 className="font-bungee text-2xl sm:text-3xl text-[#141316]">
            {grandChampion.name}
          </h2>

          <div className="text-sm font-bungee text-[#FF4834] bg-white border-2 border-[#141316] px-3 py-1 rounded-md inline-block shadow-[2px_2px_0px_#141316]">
            {playerTitles[grandChampion.id]}
          </div>

          <div className="text-3xl font-bungee text-[#141316] pt-1">
            {grandChampion.totalScore} POINTS
          </div>
        </motion.div>
      )}

      {/* Complete Rankings Roster */}
      <div className="sketch-card bg-[#FFFDF5] dark:bg-[#1E1C27] rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b-2 border-[#141316]/15 dark:border-[#FAF5E8]/20 pb-2.5">
          <h3 className="font-bungee text-xs text-[#141316] dark:text-[#FAF5E8] flex items-center gap-2">
            <Trophy size={16} className="text-[#FF4834]" />
            <span>FINAL ROSTER & SATIRICAL TITLES</span>
          </h3>
          <button
            onClick={handleCopyShareSummary}
            className="sketch-btn text-[11px] font-bungee text-[#141316] dark:text-[#FAF5E8] bg-white dark:bg-[#252230] px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer hover:bg-[#FFE600] dark:hover:bg-[#343044]"
          >
            {copiedShare ? (
              <>
                <Check size={12} className="text-[#00A859]" />
                <span>COPIED!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>SHARE RESULTS</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-2">
          {sorted.map((p, idx) => (
            <div
              key={p.id}
              className={`p-3 rounded-lg border-2 border-[#141316] dark:border-[#FAF5E8]/30 flex items-center justify-between ${
                idx === 0
                  ? 'bg-[#FFFEEA] dark:bg-[#2C291E]'
                  : 'bg-white dark:bg-[#252230]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-5 font-bungee text-xs text-[#141316] dark:text-[#FAF5E8]">
                  #{idx + 1}
                </span>
                <div
                  style={{ backgroundColor: p.color }}
                  className="w-10 h-10 rounded-md border-2 border-[#141316] flex items-center justify-center text-xl shrink-0 shadow-[1px_1px_0px_#141316]"
                >
                  {p.avatar}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bungee text-xs sm:text-sm text-[#141316] dark:text-[#FAF5E8] truncate">
                    {p.name}
                  </h4>
                  <div className="text-xs font-doodle font-bold text-[#FF4834] dark:text-[#FF7360] truncate">
                    {playerTitles[p.id]}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-bungee text-sm sm:text-base text-[#141316] dark:text-[#FAF5E8]">
                  {p.totalScore} PTS
                </div>
                <div className="text-[10px] text-[#6B7280] dark:text-[#A8A5B3] font-medium font-['Fredoka']">
                  {p.worstChoiceAwards} worst choice awards
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={() => {
            sounds.playStamp();
            onRematch();
          }}
          className="sketch-btn flex-1 py-3.5 px-6 rounded-md bg-[#00E871] text-[#141316] font-bungee text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:bg-[#00D063]"
        >
          <RotateCcw size={16} />
          <span>PLAY AGAIN (REMATCH)</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onReturnToLobby();
          }}
          className="sketch-btn py-3.5 px-6 rounded-md bg-white dark:bg-[#252230] border-2 border-[#141316] dark:border-[#FAF5E8]/30 font-bungee text-sm text-[#141316] dark:text-[#FAF5E8] flex items-center justify-center cursor-pointer hover:bg-[#FAF5E8] dark:hover:bg-[#343044]"
        >
          RETURN TO HOME
        </button>
      </div>
    </div>
  );
};
