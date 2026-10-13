import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Compass,
  HelpCircle,
  LogIn,
  ArrowRight,
  Flame,
  Sparkles,
  Zap,
  Dice5,
  X,
} from 'lucide-react';
import { Player } from '../types/game';
import { sounds } from '../utils/sound';
import { ALL_CATEGORIES } from '../data/categories';
import { signInWithGoogle } from '../firebase';

export const AVATAR_LIST = [
  { id: 'pigeon', emoji: '🐦', label: 'Cursed Pigeon' },
  { id: 'toast', emoji: '🍞', label: 'Suspicious Toast' },
  { id: 'cat', emoji: '😾', label: 'Skeptical Cat' },
  { id: 'teapot', emoji: '🫖', label: 'Angry Teapot' },
  { id: 'alien', emoji: '👽', label: 'Turtleneck Alien' },
  { id: 'broccoli', emoji: '🥦', label: 'Disco Broccoli' },
  { id: 'potato', emoji: '🥔', label: 'Moody Potato' },
  { id: 'cactus', emoji: '🌵', label: 'Sheriff Cactus' },
  { id: 'frog', emoji: '🐸', label: 'Philosopher Frog' },
  { id: 'ghost', emoji: '👻', label: 'Shy Ghost' },
  { id: 'mushroom', emoji: '🍄', label: 'Chaotic Shroom' },
  { id: 'octopus', emoji: '🐙', label: 'Stressed Squid' },
];

export const COLOR_PALETTE = [
  '#FF4834', // Risograph Coral
  '#FFE600', // Acid Yellow
  '#00E871', // Toxic Green
  '#1E40FF', // Electric Cobalt
  '#9333EA', // Psychedelic Purple
  '#FF2E93', // Punk Pink
  '#FF8A00', // Clementine
  '#141316', // Comic Ink
];

interface HomeScreenProps {
  player: Player;
  onUpdatePlayer: (updated: Partial<Player>) => void;
  onCreateRoom: (totalRounds: number, selectedCategories: string[]) => void;
  onJoinRoom: (code: string) => void;
  isJoining?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  player,
  onUpdatePlayer,
  onCreateRoom,
  onJoinRoom,
  isJoining = false,
}) => {
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdatePlayer({ name: e.target.value.slice(0, 18) });
  };

  const handleSelectAvatar = (emoji: string) => {
    sounds.playBoing();
    onUpdatePlayer({ avatar: emoji });
  };

  const handleSelectColor = (color: string) => {
    sounds.playCardSnap();
    onUpdatePlayer({ color });
  };

  const handleGoogleAuth = async () => {
    sounds.playClick();
    setIsSigningIn(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        onUpdatePlayer({
          name: user.displayName?.split(' ')[0] || player.name,
        });
      }
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) {
      setJoinError('Please enter a room code');
      return;
    }
    setJoinError('');
    sounds.playStamp();
    onJoinRoom(joinCodeInput.trim());
  };

  const filteredCategories = ALL_CATEGORIES.filter(
    (c) =>
      c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
      c.group.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-65px)] px-4 py-8 max-w-4xl mx-auto flex flex-col justify-center items-center">
      {/* Title Hero */}
      <div className="text-center mb-8 relative">
        {/* Playful Floating Badges */}
        <motion.div
          animate={{ y: [-3, 3, -3], rotate: [-2, 3, -2] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FFE600] border-2 border-[#141316] shadow-[2px_2px_0px_#141316] text-xs font-black text-[#141316] mb-3"
        >
          <Zap size={14} className="text-[#FF4834]" />
          <span>CAREFREE PARTY GAME • 2–6 PLAYERS</span>
        </motion.div>

        <h1 className="font-bungee text-5xl sm:text-7xl font-black tracking-wider text-[#141316] dark:text-[#FAF5E8] leading-none select-none">
          UN<span className="text-[#FF4834] drop-shadow-[4px_4px_0px_#141316] dark:drop-shadow-[4px_4px_0px_#FFE600]">RANKED</span>
        </h1>
        
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="font-doodle text-xl sm:text-2xl text-[#1E40FF] dark:text-[#60A5FA] font-bold rotate-[-1deg]">
            "Rank the absurd. Roast your friends."
          </span>
          <span className="px-2 py-0.5 rounded bg-[#00E871] border border-[#141316] text-[11px] font-black uppercase text-[#141316] rotate-2">
            CHAOS MODE
          </span>
        </div>

        <p className="text-sm sm:text-base text-[#4B4952] dark:text-[#CBD5E1] max-w-lg mx-auto mt-2 font-medium leading-relaxed font-['Fredoka']">
          Secretly rank four ridiculous dilemmas from completely acceptable to absolute unforgivable trash. 
          Unanimous agreement? Impossible.
        </p>
      </div>

      {/* Main Sketch Card */}
      <div className="w-full relative sketch-card-lg bg-[#FFFDF5] dark:bg-[#1E1C27] rounded-xl p-6 md:p-8">
        {/* Decorative Tape Strips on corners */}
        <div className="tape-strip -top-3 left-8" />
        <div className="tape-strip -top-3 right-8 rotate-3" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Player Persona Setup (5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-between border-b md:border-b-0 md:border-r-2 border-[#141316]/20 dark:border-[#FAF5E8]/20 pb-6 md:pb-0 md:pr-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bungee tracking-wider text-[#141316] bg-[#FFE600] px-2 py-0.5 rounded border border-[#141316]">
                  YOUR PERSONA
                </span>
                <button
                  onClick={handleGoogleAuth}
                  disabled={isSigningIn}
                  className="sketch-btn text-xs font-bold text-[#141316] dark:text-[#FAF5E8] bg-white dark:bg-[#282534] px-2.5 py-1 rounded flex items-center gap-1.5 cursor-pointer hover:bg-[#FFF9CC]"
                  title="Sign in with Google to preserve profile"
                >
                  <LogIn size={12} className="text-[#1E40FF] dark:text-[#60A5FA]" />
                  <span>{isSigningIn ? 'Connecting...' : 'Google Sync'}</span>
                </button>
              </div>

              {/* Display Name Input */}
              <div className="mb-4">
                <label className="block text-xs font-black uppercase tracking-wider text-[#141316] dark:text-[#FAF5E8] mb-1">
                  Your Nickname
                </label>
                <input
                  type="text"
                  value={player.name}
                  onChange={handleNameChange}
                  placeholder="Enter nickname"
                  maxLength={18}
                  className="w-full bg-white dark:bg-[#282534] border-2 border-[#141316] dark:border-[#FAF5E8] rounded-md px-3.5 py-2 text-sm font-bold text-[#141316] dark:text-[#FAF5E8] focus:outline-none focus:bg-[#FFFEEA] dark:focus:bg-[#343044] shadow-[2px_2px_0px_#141316] dark:shadow-[2px_2px_0px_#FFE600]"
                />
              </div>

              {/* Avatar Selector */}
              <div className="mb-4">
                <label className="block text-xs font-black uppercase tracking-wider text-[#141316] dark:text-[#FAF5E8] mb-1.5 flex items-center justify-between">
                  <span>Pick Your Creature</span>
                  <span className="text-[11px] font-bold text-[#FF4834]">
                    {player.avatar}
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_LIST.map((av) => (
                    <button
                      key={av.id}
                      onClick={() => handleSelectAvatar(av.emoji)}
                      className={`h-11 rounded-md text-2xl flex items-center justify-center border-2 transition-transform cursor-pointer ${
                        player.avatar === av.emoji
                          ? 'border-[#141316] dark:border-[#FAF5E8] bg-[#FFE600] text-[#141316] shadow-[3px_3px_0px_#141316] dark:shadow-[3px_3px_0px_#FFE600] scale-105'
                          : 'border-[#141316]/20 dark:border-[#FAF5E8]/30 bg-white dark:bg-[#282534] hover:border-[#141316] hover:bg-[#FAF5E8] dark:hover:bg-[#343044]'
                      }`}
                      title={av.label}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Signature Accent Color */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#141316] dark:text-[#FAF5E8] mb-1.5">
                  War Paint Color
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleSelectColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded border-2 border-[#141316] transition-transform cursor-pointer shadow-[1px_1px_0px_#141316] ${
                        player.color === c ? 'scale-125 ring-2 ring-black dark:ring-white' : 'opacity-85 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Preview Ticket */}
            <div className="mt-5 p-3 rounded-md bg-[#FAF5E8] dark:bg-[#282534] border-2 border-[#141316] dark:border-[#FAF5E8]/40 flex items-center gap-3 shadow-[2px_2px_0px_#141316] dark:shadow-[2px_2px_0px_#FFE600]">
              <div
                style={{ backgroundColor: player.color }}
                className="w-10 h-10 rounded border-2 border-[#141316] flex items-center justify-center text-2xl shrink-0 shadow-[2px_2px_0px_#141316]"
              >
                {player.avatar}
              </div>
              <div className="min-w-0">
                <div className="font-bungee text-xs text-[#141316] dark:text-[#FAF5E8] tracking-wide truncate">
                  {player.name || 'Anonymous Rebel'}
                </div>
                <div className="text-[12px] font-doodle font-bold text-[#6B7280] dark:text-[#A8A5B3]">
                  Ready to argue over hot takes
                </div>
              </div>
            </div>
          </div>

          {/* Right: Room Actions (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Create Room Box */}
              <div className="p-5 rounded-lg bg-[#FFEFEA] dark:bg-[#2D212E] border-2 border-[#141316] dark:border-[#FAF5E8]/30 shadow-[4px_4px_0px_#141316] dark:shadow-[4px_4px_0px_#FFE600] relative">
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="w-10 h-10 rounded-md bg-[#FF4834] text-white flex items-center justify-center shrink-0 border-2 border-[#141316] shadow-[2px_2px_0px_#141316]">
                    <Flame size={20} />
                  </div>
                  <div>
                    <h3 className="font-bungee text-base text-[#141316] dark:text-[#FAF5E8]">
                      Host Private Party
                    </h3>
                    <p className="text-xs text-[#4B4952] dark:text-[#CBD5E1] mt-0.5 font-medium">
                      Generate a 5-character code for your friends to join on their phones.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sounds.playStamp();
                    onCreateRoom(5, []);
                  }}
                  className="sketch-btn w-full py-3 px-4 rounded-md bg-[#FF4834] text-white font-bungee text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:bg-[#E53B28] shadow-[2px_2px_0px_#141316] dark:shadow-[2px_2px_0px_#FFE600]"
                >
                  <span>CREATE PARTY ROOM</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Join Room Form */}
              <div className="p-5 rounded-lg bg-[#E6FAF2] dark:bg-[#182823] border-2 border-[#141316] dark:border-[#FAF5E8]/30 shadow-[4px_4px_0px_#141316] dark:shadow-[4px_4px_0px_#FFE600]">
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="w-10 h-10 rounded-md bg-[#00E871] text-[#141316] flex items-center justify-center shrink-0 border-2 border-[#141316] shadow-[2px_2px_0px_#141316]">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-bungee text-base text-[#141316] dark:text-[#FAF5E8]">
                      Join Friends
                    </h3>
                    <p className="text-xs text-[#4B4952] dark:text-[#CBD5E1] mt-0.5 font-medium">
                      Enter the 5-character room code from your host!
                    </p>
                  </div>
                </div>

                <form onSubmit={handleJoinSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => {
                      setJoinCodeInput(e.target.value.toUpperCase());
                      setJoinError('');
                    }}
                    placeholder="E.G. K9X2P"
                    maxLength={6}
                    className="w-full uppercase font-bungee text-center text-base tracking-widest bg-white dark:bg-[#282534] border-2 border-[#141316] dark:border-[#FAF5E8] rounded-md px-3.5 py-2 text-[#141316] dark:text-[#FAF5E8] focus:outline-none focus:bg-[#FFFEEA] dark:focus:bg-[#343044] shadow-[2px_2px_0px_#141316] dark:shadow-[2px_2px_0px_#FFE600]"
                  />
                  <button
                    type="submit"
                    disabled={isJoining}
                    className="sketch-btn shrink-0 py-2 px-6 rounded-md bg-[#00E871] text-[#141316] font-bungee text-sm tracking-wider cursor-pointer hover:bg-[#00D063]"
                  >
                    {isJoining ? 'JOINING...' : 'JOIN'}
                  </button>
                </form>
                {joinError && (
                  <p className="text-xs text-[#FF4834] font-bold mt-1.5">{joinError}</p>
                )}
              </div>
            </div>

            {/* Footer Info Links */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t-2 border-[#141316]/15 dark:border-[#FAF5E8]/20 mt-4">
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowCategoriesModal(true);
                }}
                className="text-xs font-black uppercase text-[#141316] dark:text-[#FAF5E8] hover:text-[#1E40FF] dark:hover:text-[#FFE600] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Compass size={15} className="text-[#FF4834]" />
                <span>Browse 90+ Scenarios</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setShowHowToPlay(true);
                }}
                className="text-xs font-black uppercase text-[#141316] dark:text-[#FAF5E8] hover:text-[#FF4834] dark:hover:text-[#FFE600] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <HelpCircle size={15} className="text-[#00E871]" />
                <span>How To Play</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Explorer Modal */}
      {showCategoriesModal && (
        <div className="fixed inset-0 z-50 bg-[#141316]/75 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#FFFDF5] dark:bg-[#1E1C27] sketch-card-lg rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col"
          >
            <div className="p-4 border-b-2 border-[#141316] dark:border-[#FAF5E8]/30 flex items-center justify-between bg-[#FFE600] text-[#141316]">
              <div className="flex items-center gap-2">
                <Compass size={20} className="text-[#141316]" />
                <h3 className="font-bungee text-base text-[#141316]">
                  90+ CHAOS CATEGORIES
                </h3>
              </div>
              <button
                onClick={() => setShowCategoriesModal(false)}
                className="sketch-btn p-1 rounded bg-white text-[#141316] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 border-b border-[#141316]/20 dark:border-[#FAF5E8]/20 bg-white dark:bg-[#252230]">
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search categories (e.g. food, pet, office)..."
                className="w-full bg-[#FAF5E8] dark:bg-[#1E1C27] border-2 border-[#141316] dark:border-[#FAF5E8] rounded-md px-3.5 py-2 text-xs font-bold text-[#141316] dark:text-[#FAF5E8] focus:outline-none"
              />
            </div>

            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 rounded-md bg-white dark:bg-[#252230] border-2 border-[#141316] dark:border-[#FAF5E8]/30 shadow-[2px_2px_0px_#141316] dark:shadow-[2px_2px_0px_#FFE600] flex items-start gap-2.5"
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <h4 className="font-bold text-xs text-[#141316] dark:text-[#FAF5E8]">{cat.name}</h4>
                    <span className="text-[10px] font-black uppercase text-[#1E40FF] dark:text-[#60A5FA]">
                      {cat.group}
                    </span>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1] line-clamp-2 mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* How To Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 bg-[#141316]/75 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#FFFDF5] dark:bg-[#1E1C27] sketch-card-lg rounded-xl max-w-lg w-full max-h-[85vh] flex flex-col"
          >
            <div className="p-4 border-b-2 border-[#141316] dark:border-[#FAF5E8]/30 flex items-center justify-between bg-[#00E871] text-[#141316]">
              <div className="flex items-center gap-2">
                <HelpCircle size={20} className="text-[#141316]" />
                <h3 className="font-bungee text-base text-[#141316]">HOW TO PLAY</h3>
              </div>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="sketch-btn p-1 rounded bg-white text-[#141316] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs font-medium text-[#141316] dark:text-[#FAF5E8] font-['Fredoka']">
              <div className="p-3 rounded-md bg-white dark:bg-[#252230] border-2 border-[#141316] dark:border-[#FAF5E8]/30 shadow-[2px_2px_0px_#141316] dark:shadow-[2px_2px_0px_#FFE600]">
                <div className="font-bungee text-[13px] text-[#FF4834] mb-1">
                  1. SECRET RANKING
                </div>
                <p className="text-[#4B4952] dark:text-[#CBD5E1]">
                  Each round, 4 bizarre dilemmas are dealt. Drag or tap them to rank from #1 (Completely fine) to #4 (Absolute crime). Nobody can see your picks yet!
                </p>
              </div>

              <div className="p-3 rounded-md bg-white dark:bg-[#252230] border-2 border-[#141316] dark:border-[#FAF5E8]/30 shadow-[2px_2px_0px_#141316] dark:shadow-[2px_2px_0px_#FFE600]">
                <div className="font-bungee text-[13px] text-[#1E40FF] dark:text-[#60A5FA] mb-1">
                  2. ALL ANSWERS REVEALED
                </div>
                <p className="text-[#4B4952] dark:text-[#CBD5E1]">
                  Everyone's secret ranking choices are revealed side-by-side on one single screen. Compare every friend's order simultaneously!
                </p>
              </div>

              <div className="p-3 rounded-md bg-white dark:bg-[#252230] border-2 border-[#141316] dark:border-[#FAF5E8]/30 shadow-[2px_2px_0px_#141316] dark:shadow-[2px_2px_0px_#FFE600]">
                <div className="font-bungee text-[13px] text-[#00E871] mb-1">
                  3. VOTE FOR WORST CHOICES
                </div>
                <p className="text-[#4B4952] dark:text-[#CBD5E1]">
                  Vote on who had the most indefensible, chaotic rankings this round. The player with the worst taste earns the Worst Choices Trophy!
                </p>
              </div>

              <div className="p-3 rounded-md bg-white dark:bg-[#252230] border-2 border-[#141316] dark:border-[#FAF5E8]/30 shadow-[2px_2px_0px_#141316] dark:shadow-[2px_2px_0px_#FFE600]">
                <div className="font-bungee text-[13px] text-[#FFAA00] mb-1">
                  4. WINNING
                </div>
                <p className="text-[#4B4952] dark:text-[#CBD5E1]">
                  Points are awarded for consensus matches with the group median, plus bonus points for taking home Worst Choices champion titles.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
