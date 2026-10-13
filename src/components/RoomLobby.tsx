import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Copy,
  Check,
  Crown,
  Play,
  Settings2,
  Clock,
  Sparkles,
  Bot,
  Flame,
} from 'lucide-react';
import { GameRoom, Player, GameSettings } from '../types/game';
import { sounds } from '../utils/sound';
import { ALL_CATEGORIES } from '../data/categories';
import { AIHost } from './AIHost';

interface RoomLobbyProps {
  room: GameRoom;
  currentPlayer: Player;
  players: Player[];
  onToggleReady: () => void;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onStartGame: () => void;
  onAddBotPlayer?: () => void;
}

const ROUND_PRESETS = [
  { count: 3, label: 'Quick Chaos', minTime: '6m' },
  { count: 5, label: 'Casual Chaos', minTime: '12m' },
  { count: 8, label: 'Proper Argument', minTime: '20m' },
  { count: 10, label: 'Full Experience', minTime: '25m' },
  { count: 15, label: 'Friendship Review', minTime: '40m' },
];

export const RoomLobby: React.FC<RoomLobbyProps> = ({
  room,
  currentPlayer,
  players,
  onToggleReady,
  onUpdateSettings,
  onStartGame,
  onAddBotPlayer,
}) => {
  const [copied, setCopied] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const isHost = currentPlayer.id === room.hostId || currentPlayer.isHost;

  const handleCopy = () => {
    navigator.clipboard.writeText(room.code);
    sounds.playClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePresetRounds = (count: number) => {
    sounds.playCardFlick();
    onUpdateSettings({ totalRounds: count });
  };

  const toggleModifier = (key: keyof GameSettings['modifiers']) => {
    sounds.playClick();
    onUpdateSettings({
      modifiers: {
        ...room.settings.modifiers,
        [key]: !room.settings.modifiers[key],
      },
    });
  };

  const toggleCategorySelection = (catName: string) => {
    sounds.playCardSnap();
    const current = room.settings.selectedCategories || [];
    const updated = current.includes(catName)
      ? current.filter((c) => c !== catName)
      : [...current, catName];
    onUpdateSettings({ selectedCategories: updated });
  };

  const canStart = players.length >= 2;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner Card */}
      <div className="sketch-card bg-[#FFFDF5] dark:bg-[#1E1C27] rounded-xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 relative">
        <div className="tape-strip -top-3 left-6" />
        <div>
          <div className="flex items-center gap-3">
            <span className="font-bungee text-2xl text-[#141316] dark:text-[#FAF5E8]">
              PARTY LOBBY
            </span>
            <span className="px-2.5 py-0.5 rounded bg-[#00E871] border-2 border-[#141316] font-bungee text-xs text-[#141316] shadow-[2px_2px_0px_#141316]">
              {players.length}/6 PLAYERS
            </span>
          </div>
          <p className="text-xs text-[#4B4952] dark:text-[#CBD5E1] mt-1 font-medium font-['Fredoka']">
            Share the invite code with your friends so they can join from their phones!
          </p>
        </div>

        {/* Room Code Badge */}
        <div className="flex items-center gap-3 bg-[#FFE600] border-2 border-[#141316] px-5 py-2.5 rounded-lg shadow-[3px_3px_0px_#141316] dark:shadow-[3px_3px_0px_#FFE600]">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-[#141316]">
              INVITE CODE
            </div>
            <div className="font-bungee text-2xl text-[#141316] tracking-widest">
              {room.code}
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="sketch-btn p-2 rounded bg-white text-[#141316] cursor-pointer hover:bg-[#FFF9CC]"
            title="Copy Invite Code"
          >
            {copied ? <Check size={18} className="text-[#00A859]" /> : <Copy size={18} />}
          </button>
        </div>
      </div>

      {/* Host Commentary Mascot */}
      <div className="flex justify-center md:justify-start">
        <AIHost
          mood="excited"
          speech={`Welcome party people! Let the chaos commence. ${
            players.length < 2 ? 'Add a friend or a test bot friend below to get ranking!' : 'Everyone assemble and prepare your worst opinions!'
          }`}
        />
      </div>

      {/* Grid: Contestants & Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Connected Contestants (5 cols) */}
        <div className="md:col-span-5 sketch-card bg-[#FFFDF5] dark:bg-[#1E1C27] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b-2 border-[#141316]/15 dark:border-[#FAF5E8]/20 pb-3">
              <h3 className="font-bungee text-xs text-[#141316] dark:text-[#FAF5E8] flex items-center gap-2">
                <Users size={16} className="text-[#FF4834]" />
                <span>PLAYERS IN ROOM</span>
              </h3>
              {isHost && onAddBotPlayer && players.length < 6 && (
                <button
                  onClick={() => {
                    sounds.playBoing();
                    onAddBotPlayer();
                  }}
                  className="sketch-btn text-[11px] font-bold text-[#141316] bg-[#FFE600] px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                  title="Add an AI test friend to play immediately"
                >
                  <Bot size={13} />
                  <span>+ Test Friend</span>
                </button>
              )}
            </div>

            {/* Players List */}
            <div className="space-y-2">
              {players.map((p) => {
                const isThisYou = p.id === currentPlayer.id;
                const isThisHost = p.id === room.hostId || p.isHost;

                return (
                  <motion.div
                    key={p.id}
                    layout
                    className={`p-2.5 rounded-lg border-2 flex items-center justify-between transition-all ${
                      isThisYou
                        ? 'bg-[#FFFEEA] dark:bg-[#2C291E] border-[#141316] dark:border-[#FFE600] shadow-[2px_2px_0px_#141316]'
                        : 'bg-white dark:bg-[#252230] border-[#141316]/30 dark:border-[#FAF5E8]/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        style={{ backgroundColor: p.color }}
                        className="w-9 h-9 rounded-md border-2 border-[#141316] flex items-center justify-center text-lg shrink-0 relative shadow-[1px_1px_0px_#141316]"
                      >
                        {p.avatar}
                        {isThisHost && (
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FFE600] border border-[#141316] flex items-center justify-center shadow-xs">
                            <Crown size={9} className="text-[#141316]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bungee text-xs text-[#141316] dark:text-[#FAF5E8] flex items-center gap-1.5 truncate">
                          <span>{p.name}</span>
                          {isThisYou && (
                            <span className="text-[9px] bg-[#1E40FF] text-white px-1 rounded font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-doodle text-[#6B7280] dark:text-[#A8A5B3]">
                          {isThisHost ? 'Room Captain' : 'Debater'}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`px-2 py-0.5 rounded text-[10px] font-bungee tracking-wider border ${
                        p.isReady
                          ? 'bg-[#00E871] text-[#141316] border-[#141316]'
                          : 'bg-white dark:bg-[#1E1C27] text-[#6B7280] dark:text-[#A8A5B3] border-[#141316]/30 dark:border-[#FAF5E8]/30'
                      }`}
                    >
                      {p.isReady ? 'READY' : 'WAITING'}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Ready Toggle Button */}
          <div className="mt-6 pt-4 border-t-2 border-[#141316]/15 dark:border-[#FAF5E8]/20">
            <button
              onClick={() => {
                sounds.playStamp();
                onToggleReady();
              }}
              className={`sketch-btn w-full py-3 rounded-md font-bungee text-xs tracking-wider transition-all cursor-pointer ${
                currentPlayer.isReady
                  ? 'bg-[#00E871] text-[#141316]'
                  : 'bg-[#FF4834] text-white hover:bg-[#E53B28]'
              }`}
            >
              {currentPlayer.isReady ? '✓ MARKED AS READY' : 'CLICK TO READY UP'}
            </button>
          </div>
        </div>

        {/* Right: Game Settings & Controls (7 cols) */}
        <div className="md:col-span-7 sketch-card bg-[#FFFDF5] dark:bg-[#1E1C27] rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#141316]/15 dark:border-[#FAF5E8]/20 pb-3">
              <h3 className="font-bungee text-xs text-[#141316] dark:text-[#FAF5E8] flex items-center gap-2">
                <Settings2 size={16} className="text-[#1E40FF] dark:text-[#60A5FA]" />
                <span>ROUND SETUP & RULES</span>
              </h3>
              {!isHost && (
                <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#A8A5B3] bg-white dark:bg-[#252230] px-2 py-0.5 rounded border border-[#141316] dark:border-[#FAF5E8]/30">
                  Host configuring
                </span>
              )}
            </div>

            {/* Rounds Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-black uppercase text-[#141316] dark:text-[#FAF5E8]">
                  Total Rounds
                </label>
                <span className="text-xs font-bungee text-[#FF4834] dark:text-[#FF7360]">
                  {room.settings.totalRounds} ROUNDS
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ROUND_PRESETS.map((p) => (
                  <button
                    key={p.count}
                    disabled={!isHost}
                    onClick={() => handlePresetRounds(p.count)}
                    className={`sketch-btn p-2 rounded-md text-left transition-all ${
                      room.settings.totalRounds === p.count
                        ? 'bg-[#FFE600] text-[#141316] font-bold shadow-[2px_2px_0px_#141316]'
                        : 'bg-white dark:bg-[#252230] text-[#4B4952] dark:text-[#CBD5E1] hover:bg-[#FAF5E8] dark:hover:bg-[#343044]'
                    } ${!isHost ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="text-xs font-bungee">{p.count} Rounds</div>
                    <div className="text-[10px] text-[#6B7280] dark:text-[#A8A5B3]">
                      {p.label} (~{p.minTime})
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-black uppercase text-[#141316] dark:text-[#FAF5E8]">
                  Category Mix
                </label>
                {isHost && (
                  <button
                    onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                    className="text-[11px] font-bungee text-[#1E40FF] dark:text-[#60A5FA] hover:underline cursor-pointer"
                  >
                    {showCategoryPicker ? 'HIDE' : 'FILTER (90+)'}
                  </button>
                )}
              </div>

              <div className="p-2.5 rounded-md bg-white dark:bg-[#252230] border-2 border-[#141316] dark:border-[#FAF5E8]/30 flex items-center justify-between text-xs font-bold text-[#141316] dark:text-[#FAF5E8]">
                <span>
                  {room.settings.selectedCategories?.length > 0
                    ? `${room.settings.selectedCategories.length} Categories Selected`
                    : 'All 90+ Chaos Categories (Randomized)'}
                </span>
                <Sparkles size={14} className="text-[#FF4834]" />
              </div>

              {/* Collapsible Picker */}
              {showCategoryPicker && (
                <div className="mt-2 p-3 rounded-md bg-[#FAF5E8] dark:bg-[#252230] border-2 border-[#141316] dark:border-[#FAF5E8]/30 max-h-48 overflow-y-auto space-y-1.5">
                  <input
                    type="text"
                    placeholder="Search scenarios..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full bg-white dark:bg-[#1E1C27] border-2 border-[#141316] dark:border-[#FAF5E8] rounded px-2.5 py-1 text-xs text-[#141316] dark:text-[#FAF5E8] mb-2 focus:outline-none"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {ALL_CATEGORIES.filter((c) =>
                      c.name.toLowerCase().includes(categorySearch.toLowerCase())
                    ).map((cat) => {
                      const isChecked = room.settings.selectedCategories?.includes(cat.name);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => toggleCategorySelection(cat.name)}
                          className={`p-1.5 rounded border-2 border-[#141316] dark:border-[#FAF5E8]/40 text-left flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
                            isChecked
                              ? 'bg-[#00E871] font-bold text-[#141316]'
                              : 'bg-white dark:bg-[#1E1C27] text-[#4B4952] dark:text-[#CBD5E1] hover:bg-gray-100 dark:hover:bg-[#343044]'
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span className="truncate">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Game Modifiers */}
            <div>
              <label className="text-[11px] font-black uppercase text-[#141316] dark:text-[#FAF5E8] block mb-1.5">
                Rules & Twists
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'doubleTrouble', label: '2x Stakes', desc: 'Double points' },
                  { key: 'mysteryCategory', label: 'Mystery', desc: 'Hidden title' },
                  { key: 'noMercy', label: 'No Mercy', desc: 'Bonus roast pts' },
                  { key: 'speedRound', label: 'Speedy', desc: '30s timer' },
                ].map((mod) => {
                  const isActive = (room.settings.modifiers as any)?.[mod.key];
                  return (
                    <button
                      key={mod.key}
                      disabled={!isHost}
                      onClick={() => toggleModifier(mod.key as any)}
                      className={`sketch-btn p-2 rounded-md text-left transition-all ${
                        isActive
                          ? 'bg-[#FFE600] text-[#141316] font-bold shadow-[2px_2px_0px_#141316]'
                          : 'bg-white dark:bg-[#252230] text-[#4B4952] dark:text-[#CBD5E1] hover:bg-[#FAF5E8] dark:hover:bg-[#343044]'
                      } ${!isHost ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="text-[11px] font-bungee">{mod.label}</div>
                      <div className="text-[9px] text-[#6B7280] dark:text-[#A8A5B3]">
                        {mod.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Start Game Action (Host Only) */}
          <div className="mt-6 pt-4 border-t-2 border-[#141316]/15 dark:border-[#FAF5E8]/20">
            {isHost ? (
              <button
                onClick={() => {
                  sounds.playVictoryFlourish();
                  onStartGame();
                }}
                disabled={!canStart}
                className="sketch-btn w-full py-3.5 rounded-md bg-[#FF4834] text-white font-bungee text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:bg-[#E53B28] disabled:opacity-40 disabled:cursor-not-allowed shadow-[3px_3px_0px_#141316] dark:shadow-[3px_3px_0px_#FFE600]"
              >
                <Play size={18} />
                <span>
                  {canStart ? 'LAUNCH CHAOS PARTY!' : 'NEED AT LEAST 2 PLAYERS'}
                </span>
              </button>
            ) : (
              <div className="p-3 rounded-md bg-[#FAF5E8] dark:bg-[#252230] border-2 border-[#141316] dark:border-[#FAF5E8]/30 text-center font-bungee text-xs text-[#6B7280] dark:text-[#CBD5E1]">
                WAITING FOR ROOM CAPTAIN TO LAUNCH...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
