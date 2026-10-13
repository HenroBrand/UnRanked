import React from 'react';
import { motion } from 'motion/react';
import { HostMood } from '../types/game';

interface AIHostProps {
  mood: HostMood;
  speech?: string;
  compact?: boolean;
}

export const AIHost: React.FC<AIHostProps> = ({
  mood = 'neutral',
  speech,
  compact = false,
}) => {
  return (
    <div className={`relative flex items-end gap-3.5 ${compact ? 'scale-90 origin-bottom' : ''}`}>
      {/* Careless Doodle Mascot: The Chaos Goblin */}
      <motion.div
        animate={{
          scaleY: mood === 'excited' ? [1, 1.18, 0.88, 1] : [1, 1.05, 0.95, 1],
          scaleX: mood === 'excited' ? [1, 0.88, 1.15, 1] : [1, 0.96, 1.04, 1],
          rotate: mood === 'shocked' ? [-6, 6, -6] : [0, 2, -2, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: mood === 'excited' ? 0.8 : 2.2,
          ease: 'easeInOut',
        }}
        className="relative shrink-0 select-none cursor-pointer"
      >
        {/* Paper tape on ear/head */}
        <div className="absolute -top-3 left-2 rotate-[-15deg] z-20">
          <div className="w-7 h-3 bg-[#FF4834] border border-[#141316] text-[8px] font-bungee text-white flex items-center justify-center shadow-[1px_1px_0px_#141316]">
            HOT
          </div>
        </div>

        {/* Doodle Body */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-[#FFE600] border-[3px] border-[#141316] shadow-[4px_4px_0px_#141316] flex flex-col items-center justify-center relative overflow-hidden p-2 rotate-[-2deg]">
          {/* Sketchy highlight */}
          <div className="absolute top-1.5 left-2 w-4 h-1.5 bg-white border border-[#141316] rounded-sm -rotate-12 pointer-events-none" />

          {/* Googly / Animated Face */}
          <div className="relative z-10 flex flex-col items-center mt-1">
            {/* Eyes */}
            <div className="flex items-center gap-1.5">
              {mood === 'shocked' ? (
                <>
                  <div className="w-4 h-4 rounded-full bg-white border-2 border-[#141316] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-[#141316] rounded-full" />
                  </div>
                  <div className="w-5 h-5 rounded-full bg-white border-2 border-[#141316] flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-[#FF4834] rounded-full" />
                  </div>
                </>
              ) : mood === 'suspicious' ? (
                <>
                  <div className="w-4 h-2 bg-white border-2 border-[#141316] rounded-t-full flex items-center justify-center">
                    <div className="w-1.5 h-1 bg-[#141316] rounded-full" />
                  </div>
                  <div className="w-4 h-4 rounded-full bg-white border-2 border-[#141316] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-[#141316] rounded-full" />
                  </div>
                </>
              ) : mood === 'excited' || mood === 'celebrating' ? (
                <>
                  <span className="text-sm font-black text-[#141316] leading-none">★</span>
                  <span className="text-sm font-black text-[#141316] leading-none">★</span>
                </>
              ) : mood === 'laughing' ? (
                <>
                  <span className="text-xs font-black text-[#141316] leading-none">＞</span>
                  <span className="text-xs font-black text-[#141316] leading-none">＜</span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 rounded-full bg-white border-2 border-[#141316] flex items-center justify-center shadow-[1px_1px_0px_#141316]">
                    <div className="w-1.5 h-1.5 bg-[#141316] rounded-full ml-0.5" />
                  </div>
                  <div className="w-4 h-4 rounded-full bg-white border-2 border-[#141316] flex items-center justify-center shadow-[1px_1px_0px_#141316]">
                    <div className="w-1.5 h-1.5 bg-[#141316] rounded-full mr-0.5" />
                  </div>
                </>
              )}
            </div>

            {/* Mouth */}
            <div className="mt-1">
              {mood === 'shocked' ? (
                <div className="w-3.5 h-3.5 rounded-full bg-[#141316] border border-white" />
              ) : mood === 'laughing' || mood === 'celebrating' ? (
                <div className="w-4 h-2 rounded-b-full bg-[#FF4834] border border-[#141316]" />
              ) : mood === 'disappointed' ? (
                <div className="w-4 h-1 bg-[#141316] -rotate-6" />
              ) : mood === 'offended' ? (
                <div className="w-3 h-2 rounded-full border-2 border-[#141316] bg-white" />
              ) : (
                <div className="w-3.5 h-1.5 rounded-b-full bg-[#141316]" />
              )}
            </div>
          </div>

          {/* Tiny paper tie */}
          <div className="absolute -bottom-1 w-4 h-2.5 bg-[#FF4834] border border-[#141316] rotate-45 z-10" />
        </div>
      </motion.div>

      {/* Comic Speech Bubble */}
      {speech && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative max-w-sm bg-[#FFFDF5] dark:bg-[#1E1C27] p-3.5 rounded-lg border-2 border-[#141316] dark:border-[#FAF5E8]/40 shadow-[4px_4px_0px_#141316] dark:shadow-[4px_4px_0px_#FFE600] text-[#141316] dark:text-[#FAF5E8]"
        >
          {/* Triangular pointer tail */}
          <div className="absolute -left-2.5 bottom-3.5 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-[#141316] dark:border-r-[#FAF5E8]/40 border-b-[6px] border-b-transparent" />
          <div className="absolute -left-1.5 bottom-3.5 w-0 h-0 border-t-[5px] border-t-transparent border-r-[7px] border-r-[#FFFDF5] dark:border-r-[#1E1C27] border-b-[5px] border-b-transparent" />

          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bungee tracking-wider text-[#FF4834] dark:text-[#FF7360] bg-[#FFEFEA] dark:bg-[#2C2129] px-1.5 py-0.5 rounded border border-[#141316] dark:border-[#FAF5E8]/20">
              PROFESSOR CHAOS
            </span>
            <span className="text-[10px] font-doodle font-bold text-[#6B7280] dark:text-[#A8A5B3]">
              live reaction
            </span>
          </div>
          <p className="text-xs md:text-sm font-semibold leading-snug text-[#141316] dark:text-[#FAF5E8] font-['Fredoka']">
            "{speech}"
          </p>
        </motion.div>
      )}
    </div>
  );
};
