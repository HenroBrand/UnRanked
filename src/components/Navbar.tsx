import React, { useState } from 'react';
import { Menu, Copy, Check, Trophy, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';
import { GameRoom } from '../types/game';
import { SettingsBurgerMenu } from './SettingsBurgerMenu';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  room?: GameRoom | null;
  onOpenLeaderboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  room,
  onOpenLeaderboard,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { isDarkMode } = useTheme();

  const handleCopyCode = () => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code);
    sounds.playClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenSettings = () => {
    sounds.playClick();
    setIsSettingsOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF5E8]/95 dark:bg-[#16141F]/95 backdrop-blur-sm border-b-[3px] border-[#141316] dark:border-[#FAF5E8]/40 px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-3 transition-colors">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-md bg-[#FFE600] text-[#141316] font-bungee text-xl flex items-center justify-center border-2 border-[#141316] shadow-[2px_2px_0px_#141316] -rotate-3 select-none">
            U
          </div>
          <div className="flex flex-col -space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bungee text-lg md:text-xl tracking-wider text-[#141316] dark:text-[#FAF5E8]">
                UNRANKED
              </span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-[#FF4834] text-white border border-[#141316] shadow-[1px_1px_0px_#141316] rotate-1 hidden sm:inline">
                CHAOS
              </span>
            </div>
            <span className="text-[11px] font-doodle font-bold text-[#6B7280] dark:text-[#A8A5B3] tracking-wide hidden sm:block">
              zero order, pure blasphemy
            </span>
          </div>
        </div>

        {/* Middle Zone: Room Code & Round Counter */}
        {room && (
          <div className="flex items-center gap-2">
            {/* Room Code Badge */}
            <button
              onClick={handleCopyCode}
              className="sketch-btn flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-md bg-white dark:bg-[#252230] text-[#141316] dark:text-[#FAF5E8] cursor-pointer group"
              title="Click to copy Room Code"
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF4834] dark:text-[#FF7360]">
                ROOM:
              </span>
              <span className="font-bungee text-xs md:text-sm tracking-wider group-hover:text-[#1E40FF] dark:group-hover:text-[#FFE600] transition-colors">
                {room.code}
              </span>
              {copied ? (
                <span className="text-[10px] font-bold text-[#00A859] flex items-center gap-0.5">
                  <Check size={12} /> COPIED!
                </span>
              ) : (
                <Copy size={12} className="text-[#6B7280] dark:text-[#A8A5B3] group-hover:text-[#141316] dark:group-hover:text-[#FAF5E8]" />
              )}
            </button>

            {/* Round Indicator */}
            {room.phase !== 'LOBBY' && room.roundNumber > 0 && (
              <div className="hidden sm:flex items-center px-2 py-1 rounded-md bg-[#00E871] border-2 border-[#141316] shadow-[2px_2px_0px_#141316] text-[10px] font-black tracking-wider text-[#141316] rotate-1">
                ROUND {room.roundNumber}/{room.totalRounds}
              </div>
            )}
          </div>
        )}

        {/* Action Zone: Leaderboard & Hidden Burger Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenLeaderboard && room && room.phase !== 'LOBBY' && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenLeaderboard();
              }}
              className="sketch-btn px-2.5 py-1.5 rounded-md bg-[#FFE600] text-[#141316] flex items-center gap-1.5 text-xs font-black cursor-pointer hover:bg-[#FFD700]"
              title="View Live Leaderboard"
            >
              <Trophy size={14} className="text-[#141316]" />
              <span className="hidden md:inline font-bungee text-[11px]">Scores</span>
            </button>
          )}

          {/* Hidden Burger Menu Button (Houses Theme, Audio & Settings) */}
          <button
            onClick={handleOpenSettings}
            className="sketch-btn px-2.5 py-1.5 rounded-md bg-white dark:bg-[#252230] text-[#141316] dark:text-[#FAF5E8] flex items-center gap-1.5 cursor-pointer hover:bg-[#FFE600] dark:hover:bg-[#343044] transition-all relative group"
            title="Open Settings & Sound Controls"
            aria-label="Open settings menu"
          >
            <Menu size={18} className="group-hover:rotate-6 transition-transform" />
            <span className="font-bungee text-[11px] hidden sm:inline">SETTINGS</span>
            {sounds.isMusicOn() && (
              <span className="w-2 h-2 rounded-full bg-[#00A859] absolute -top-1 -right-1 border border-[#141316] animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* Hidden Burger Menu Drawer */}
      <SettingsBurgerMenu
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        room={room}
      />
    </>
  );
};
