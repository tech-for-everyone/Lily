import { MediaTrack } from "../../types";
import { Play, Pause, Disc, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { motion } from "motion/react";

interface MediaCardProps {
  key?: string;
  media: MediaTrack;
  onTogglePlay: () => void;
}

export const MediaCard = ({ media, onTogglePlay }: MediaCardProps) => {
  return (
    <motion.div
      id="media-player-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/[0.08] transition-all rounded-3xl p-6 text-white shadow-2xl"
    >
      <div className="flex items-center gap-4">
        {/* Animated Spinning Vinyl Cover */}
        <motion.div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${media.coverGradient} p-0.5 shadow-lg flex items-center justify-center shrink-0`}
          animate={{ rotate: media.isPlaying ? 360 : 0 }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        >
          <div className="w-full h-full rounded-2xl bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Disc className={`w-7 h-7 ${media.isPlaying ? "text-cyan-300 animate-pulse" : "text-white/40"}`} />
          </div>
        </motion.div>

        {/* Track details */}
        <div className="flex-1 min-w-0">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400">
            Now Playing • {media.genre}
          </span>
          <h4 className="font-semibold text-sm sm:text-base text-white truncate">{media.title}</h4>
          <p className="text-xs text-white/50 truncate">{media.artist}</p>
        </div>

        {/* Play/Pause Button */}
        <button
          id="btn-media-toggle-play"
          onClick={onTogglePlay}
          className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-lg backdrop-blur-md transition-all active:scale-95 shrink-0"
          aria-label={media.isPlaying ? "Pause music" : "Play music"}
        >
          {media.isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>
      </div>

      {/* Real-time audio waveform animation simulation */}
      {media.isPlaying && (
        <div className="flex items-center justify-center gap-1.5 h-6 mt-4 pt-3 border-t border-white/10">
          <Volume2 className="w-3.5 h-3.5 text-cyan-400 mr-2" />
          {[30, 70, 45, 90, 60, 100, 40, 80, 50, 65, 35].map((h, i) => (
            <motion.span
              key={i}
              className="w-1 bg-gradient-to-t from-blue-400 to-cyan-300 rounded-full"
              animate={{
                height: [`${h * 0.2}px`, `${h * 0.22}px`, `${h * 0.15}px`],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.5 + (i % 4) * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
