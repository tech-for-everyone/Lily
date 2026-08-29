import { motion } from "motion/react";
import { AssistantStatus } from "../types";
import { Mic, Sparkles, Volume2, AlertCircle, Loader2 } from "lucide-react";

interface SiriOrbProps {
  status: AssistantStatus;
  volumeLevel: number;
  glowTheme: "siri-classic" | "neon-aurora" | "cyber-purple" | "cosmic-amber" | "emerald-zen";
  onClick: () => void;
}

export const SiriOrb = ({
  status,
  volumeLevel,
  glowTheme,
  onClick,
}: SiriOrbProps) => {
  // Theme gradients configuration
  const themeGradients = {
    "siri-classic": {
      core: "from-cyan-400 via-fuchsia-500 to-indigo-600",
      outer: "from-pink-500/40 via-purple-600/30 to-blue-500/40",
      halo: "rgba(168, 85, 247, 0.45)",
      accent: "cyan",
    },
    "neon-aurora": {
      core: "from-emerald-400 via-teal-400 to-cyan-600",
      outer: "from-emerald-500/40 via-cyan-500/30 to-indigo-500/30",
      halo: "rgba(52, 211, 153, 0.45)",
      accent: "emerald",
    },
    "cyber-purple": {
      core: "from-violet-400 via-fuchsia-500 to-rose-600",
      outer: "from-purple-600/40 via-pink-600/30 to-indigo-700/30",
      halo: "rgba(217, 70, 239, 0.45)",
      accent: "fuchsia",
    },
    "cosmic-amber": {
      core: "from-amber-400 via-orange-500 to-rose-600",
      outer: "from-amber-500/40 via-rose-500/30 to-purple-700/30",
      halo: "rgba(245, 158, 11, 0.45)",
      accent: "amber",
    },
    "emerald-zen": {
      core: "from-teal-300 via-emerald-500 to-cyan-700",
      outer: "from-teal-500/40 via-emerald-600/30 to-blue-800/30",
      halo: "rgba(16, 185, 129, 0.45)",
      accent: "teal",
    },
  };

  const currentTheme = themeGradients[glowTheme] || themeGradients["siri-classic"];

  // Dynamic scale calculation based on volume level and status
  const dynamicScale = status === "listening"
    ? 1 + volumeLevel * 0.45
    : status === "speaking"
    ? 1.08
    : status === "processing"
    ? 1.04
    : 1;

  return (
    <div
      id="siri-orb-container"
      className="relative flex items-center justify-center cursor-pointer select-none group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Voice Assistant Status: ${status}. Click to interact.`}
    >
      {/* Outer ambient glow halo */}
      <motion.div
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full filter blur-[90px] pointer-events-none opacity-80"
        style={{ background: currentTheme.halo }}
        animate={{
          scale: status === "listening" ? [1, 1.25 + volumeLevel * 0.5, 1.1] : status === "speaking" ? [1.1, 1.25, 1.1] : [0.95, 1.05, 0.95],
          opacity: status === "idle" ? 0.45 : 0.9,
        }}
        transition={{
          repeat: Infinity,
          duration: status === "processing" ? 1.2 : 3,
          ease: "easeInOut",
        }}
      />

      {/* Frosted Glass Outer Vessel */}
      <motion.div
        className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-white/20 backdrop-blur-3xl bg-white/5 flex items-center justify-center relative shadow-2xl"
        animate={{
          scale: dynamicScale,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
      >
        {/* Dashed Spinning Orbital Ring */}
        <motion.div
          className="w-36 h-36 sm:w-42 sm:h-42 rounded-full border-2 border-dashed border-cyan-400/40 absolute"
          animate={{
            rotate: 360,
            scale: status === "listening" ? 1 + volumeLevel * 0.2 : 1,
          }}
          transition={{
            rotate: { repeat: Infinity, duration: status === "processing" ? 4 : 12, ease: "linear" },
            scale: { duration: 0.15 },
          }}
        />

        {/* Secondary Counter-Rotating Subtle Ring */}
        <motion.div
          className="w-44 h-44 sm:w-50 sm:h-50 rounded-full border border-white/10 absolute pointer-events-none"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        />

        {/* Main Siri Plasma Glowing Core */}
        <motion.div
          id="siri-plasma-core"
          className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br ${currentTheme.core} flex items-center justify-center relative shadow-lg shadow-indigo-500/40 p-1`}
          animate={{
            rotate: status === "processing" ? 360 : 0,
          }}
          transition={{
            rotate: { repeat: Infinity, duration: 4, ease: "linear" },
          }}
        >
          {/* Inner Frosted Glass Button Core */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-full border border-white/35 flex items-center justify-center shadow-inner relative z-10">
            {status === "idle" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <Mic className="w-6 h-6 text-white drop-shadow-md group-hover:scale-110 transition-transform" />
              </motion.div>
            )}

            {status === "listening" && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center gap-1 h-6"
              >
                {[40, 90, 60, 100, 50].map((h, i) => (
                  <motion.span
                    key={i}
                    className="w-1 bg-white rounded-full"
                    animate={{
                      height: [
                        `${Math.max(4, (h / 100) * 18 * (0.3 + volumeLevel * 0.9))}px`,
                        `${Math.max(6, (h / 100) * 18 * (0.6 + volumeLevel * 1.2))}px`,
                        `${Math.max(4, (h / 100) * 18 * (0.3 + volumeLevel * 0.9))}px`,
                      ],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.4 + i * 0.08,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>
            )}

            {status === "processing" && (
              <Loader2 className="w-6 h-6 text-white animate-spin drop-shadow" />
            )}

            {status === "speaking" && (
              <Volume2 className="w-6 h-6 text-white drop-shadow animate-pulse" />
            )}

            {status === "error" && (
              <AlertCircle className="w-6 h-6 text-rose-200 drop-shadow" />
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
