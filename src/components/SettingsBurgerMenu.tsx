import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Volume2,
  VolumeX,
  Music,
  Music2,
  Moon,
  Sun,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { useTheme } from '../context/ThemeContext';
import { GameRoom } from '../types/game';

interface SettingsBurgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  room?: GameRoom | null;
}

export const SettingsBurgerMenu: React.FC<SettingsBurgerMenuProps> = ({
  isOpen,
  onClose,
  room,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMusicOn, setIsMusicOn] = useState(sounds.isMusicOn());
  const [isSfxOn, setIsSfxOn] = useState(sounds.isSfxOn());
  const [sfxVolume, setSfxVolume] = useState(sounds.getSfxVolume() * 100);
  const [musicVolume, setMusicVolume] = useState(sounds.getMusicVolume() * 100);
  const [copiedCode, setCopiedCode] = useState(false);
  const [testSoundPlayed, setTestSoundPlayed] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleToggleMusic = () => {
    const next = sounds.toggleMusic();
    setIsMusicOn(next);
  };

  const handleToggleSfx = () => {
    const next = sounds.toggleSfx();
    setIsSfxOn(next);
  };

  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSfxVolume(val);
    sounds.setSfxVolume(val / 100);
  };

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setMusicVolume(val);
    sounds.setMusicVolume(val / 100);
  };

  const handlePlayTestSound = () => {
    sounds.playStamp();
    setTestSoundPlayed(true);
    setTimeout(() => setTestSoundPlayed(false), 1000);
  };

  const handleCopyCode = () => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code);
    sounds.playClick();
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#141316]/70 backdrop-blur-xs cursor-pointer"
      />

      {/* Slide-in Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-sm sm:max-w-md bg-[#FFFDF5] dark:bg-[#1D1B27] text-[#141316] dark:text-[#FAF5E8] h-full shadow-2xl border-l-[3.5px] border-[#141316] dark:border-[#FAF5E8] flex flex-col z-10 overflow-y-auto"
      >
        <div className="tape-strip top-4 left-6" />

        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b-[3px] border-[#141316] dark:border-[#FAF5E8]/30 flex items-center justify-between bg-[#FAF5E8] dark:bg-[#16141F]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#FFE600] border-2 border-[#141316] text-[#141316] flex items-center justify-center font-bold shadow-[2px_2px_0px_#141316]">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="font-bungee text-base sm:text-lg text-[#141316] dark:text-[#FAF5E8] leading-none">
                GAME SETTINGS
              </h2>
              <span className="text-[10px] font-doodle font-bold text-[#FF4834] dark:text-[#FF7360] uppercase tracking-wider">
                Audio, Theme & Controls
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="sketch-btn p-1.5 rounded-md bg-white dark:bg-[#282534] text-[#141316] dark:text-[#FAF5E8] cursor-pointer hover:bg-[#FF4834] hover:text-white transition-colors"
            title="Close Settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-4 sm:p-5 space-y-6 flex-1 overflow-y-auto">
          {/* 1. Theme / Appearance Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b-2 border-[#141316]/15 dark:border-[#FAF5E8]/20 pb-1.5">
              <span className="font-bungee text-xs text-[#141316] dark:text-[#FAF5E8] flex items-center gap-1.5">
                <Moon size={14} className="text-[#FFE600]" />
                <span>APPEARANCE & THEME</span>
              </span>
              <span className="text-[10px] font-doodle font-bold text-[#6B7280] dark:text-[#A8A5B3]">
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (isDarkMode) toggleTheme();
                  sounds.playClick();
                }}
                className={`sketch-btn p-3 rounded-lg flex flex-col items-center gap-1.5 cursor-pointer text-xs font-bungee transition-all ${
                  !isDarkMode
                    ? 'bg-[#FFE600] text-[#141316] font-bold shadow-[3px_3px_0px_#141316]'
                    : 'bg-white dark:bg-[#282534] text-[#6B7280] dark:text-[#E2DFD2]'
                }`}
              >
                <Sun size={20} className={!isDarkMode ? 'text-[#FF4834]' : ''} />
                <span>☀️ KRAFT LIGHT</span>
                <span className="text-[9px] font-doodle font-normal">Notebook Paper</span>
              </button>

              <button
                onClick={() => {
                  if (!isDarkMode) toggleTheme();
                  sounds.playClick();
                }}
                className={`sketch-btn p-3 rounded-lg flex flex-col items-center gap-1.5 cursor-pointer text-xs font-bungee transition-all ${
                  isDarkMode
                    ? 'bg-[#00E871] text-[#141316] font-bold shadow-[3px_3px_0px_#141316] dark:shadow-[3px_3px_0px_#FFE600]'
                    : 'bg-white dark:bg-[#282534] text-[#6B7280] dark:text-[#E2DFD2]'
                }`}
              >
                <Moon size={20} className={isDarkMode ? 'text-[#141316]' : ''} />
                <span>🌙 CHAOS DARK</span>
                <span className="text-[9px] font-doodle font-normal">Midnight Punk</span>
              </button>
            </div>
          </div>

          {/* 2. Audio & Soundtrack Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#141316]/15 dark:border-[#FAF5E8]/20 pb-1.5">
              <span className="font-bungee text-xs text-[#141316] dark:text-[#FAF5E8] flex items-center gap-1.5">
                <Music size={14} className="text-[#FF4834]" />
                <span>AUDIO CONTROLS</span>
              </span>
              <span className="text-[10px] font-doodle font-bold text-[#6B7280] dark:text-[#A8A5B3]">
                Independent Toggles
              </span>
            </div>

            {/* Background Music Toggle */}
            <div className="p-3 rounded-lg bg-white dark:bg-[#252230] border-2 border-[#141316] dark:border-[#FAF5E8]/30 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bungee text-xs text-[#141316] dark:text-[#FAF5E8] flex items-center gap-1.5">
                    <Music size={15} className={isMusicOn ? 'text-[#00A859]' : 'text-[#6B7280]'} />
                    <span>BACKGROUND MUSIC</span>
                  </div>
                  <p className="text-[11px] font-['Fredoka'] text-[#6B7280] dark:text-[#A8A5B3]">
                    Quirky procedural soundtrack
                  </p>
                </div>

                <button
                  onClick={handleToggleMusic}
                  className={`sketch-btn px-3 py-1.5 rounded-md font-bungee text-xs cursor-pointer transition-colors ${
                    isMusicOn
                      ? 'bg-[#00E871] text-[#141316] font-bold'
                      : 'bg-[#E5E0D5] dark:bg-[#343044] text-[#6B7280] dark:text-[#A8A5B3]'
                  }`}
                >
                  {isMusicOn ? 'MUSIC ON' : 'MUSIC OFF'}
                </button>
              </div>

              {/* Music Volume Slider */}
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[10px] font-bungee text-[#6B7280] dark:text-[#A8A5B3] w-12">
                  VOL: {Math.round(musicVolume)}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVolume}
                  onChange={handleMusicVolumeChange}
                  disabled={!isMusicOn}
                  className="w-full accent-[#FFE600] cursor-pointer disabled:opacity-30"
                />
              </div>
            </div>

            {/* Game Sound Effects Toggle */}
            <div className="p-3 rounded-lg bg-white dark:bg-[#252230] border-2 border-[#141316] dark:border-[#FAF5E8]/30 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bungee text-xs text-[#141316] dark:text-[#FAF5E8] flex items-center gap-1.5">
                    {isSfxOn ? (
                      <Volume2 size={16} className="text-[#00A859]" />
                    ) : (
                      <VolumeX size={16} className="text-[#FF4834]" />
                    )}
                    <span>GAME SOUND EFFECTS</span>
                  </div>
                  <p className="text-[11px] font-['Fredoka'] text-[#6B7280] dark:text-[#A8A5B3]">
                    Clicks, card plucks, buzzers & fanfares
                  </p>
                </div>

                <button
                  onClick={handleToggleSfx}
                  className={`sketch-btn px-3 py-1.5 rounded-md font-bungee text-xs cursor-pointer transition-colors ${
                    isSfxOn
                      ? 'bg-[#FFE600] text-[#141316] font-bold'
                      : 'bg-[#FF4834] text-white'
                  }`}
                >
                  {isSfxOn ? 'SFX ON' : 'SFX MUTED'}
                </button>
              </div>

              {/* SFX Volume Slider & Test Button */}
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[10px] font-bungee text-[#6B7280] dark:text-[#A8A5B3] w-12">
                  VOL: {Math.round(sfxVolume)}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVolume}
                  onChange={handleSfxVolumeChange}
                  disabled={!isSfxOn}
                  className="w-full accent-[#FF4834] cursor-pointer disabled:opacity-30"
                />
              </div>

              <div className="pt-1">
                <button
                  onClick={handlePlayTestSound}
                  disabled={!isSfxOn}
                  className="sketch-btn w-full py-1.5 px-2 rounded bg-[#FAF5E8] dark:bg-[#343044] text-[#141316] dark:text-[#FAF5E8] font-bungee text-[10px] flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#FFE600] disabled:opacity-40"
                >
                  <Play size={11} />
                  <span>{testSoundPlayed ? 'BOOM! 💥' : 'TEST SOUND EFFECT'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Room & Session Info (if in room) */}
          {room && (
            <div className="p-3 rounded-lg bg-[#FFEFEA] dark:bg-[#2C2129] border-2 border-[#141316] dark:border-[#FAF5E8]/30 space-y-2">
              <span className="font-bungee text-xs text-[#FF4834] dark:text-[#FF7360] flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>CURRENT PARTY ROOM</span>
              </span>

              <div className="flex items-center justify-between bg-white dark:bg-[#1D1B24] p-2 rounded border border-[#141316]/30">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#6B7280] dark:text-[#A8A5B3] block">
                    ROOM CODE
                  </span>
                  <span className="font-bungee text-sm text-[#141316] dark:text-[#FAF5E8] tracking-wider">
                    {room.code}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="sketch-btn px-2.5 py-1 rounded bg-[#FFE600] text-[#141316] font-bungee text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedCode ? 'COPIED!' : 'COPY'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs font-['Fredoka'] font-medium text-[#4B4952] dark:text-[#E2DFD2]">
                <span>Phase: <strong className="font-bungee uppercase">{room.phase}</strong></span>
                <span>Round: <strong className="font-bungee">{room.roundNumber}/{room.totalRounds}</strong></span>
              </div>
            </div>
          )}

          {/* 4. Quick Rules Guide */}
          <div className="p-3 rounded-lg bg-[#FAF5E8] dark:bg-[#23202E] border-2 border-[#141316]/20 dark:border-[#FAF5E8]/20 space-y-1.5 text-xs">
            <span className="font-bungee text-[11px] text-[#141316] dark:text-[#FAF5E8] flex items-center gap-1">
              <HelpCircle size={13} /> HOW TO PLAY & WIN
            </span>
            <ul className="space-y-1 text-[11px] font-['Fredoka'] text-[#4B4952] dark:text-[#A8A5B3]">
              <li>• Drag cards to rank from <strong>#1 (Best)</strong> to <strong>#4 (Worst)</strong>.</li>
              <li>• Earn <strong>+3 pts</strong> when your choices match the group consensus.</li>
              <li>• Earn <strong>+3 pts</strong> for winning the infamous "Worst Taste" vote!</li>
            </ul>
          </div>
        </div>

        {/* Footer Done Button */}
        <div className="p-4 border-t-2 border-[#141316] dark:border-[#FAF5E8]/30 bg-[#FAF5E8] dark:bg-[#16141F]">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="sketch-btn w-full py-2.5 rounded-lg bg-[#141316] dark:bg-[#FAF5E8] text-[#FAF5E8] dark:text-[#141316] font-bungee text-xs tracking-wider cursor-pointer hover:opacity-90 transition-opacity"
          >
            SAVE & CLOSE MENU
          </button>
        </div>
      </motion.div>
    </div>
  );
};
