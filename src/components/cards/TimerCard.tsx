import { TimerItem } from "../../types";
import { Play, Pause, RotateCcw, Plus, Trash2, Bell } from "lucide-react";
import { motion } from "motion/react";

interface TimerCardProps {
  key?: string;
  timer: TimerItem;
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onAddMinute: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TimerCard = ({
  timer,
  onToggle,
  onReset,
  onAddMinute,
  onDelete,
}: TimerCardProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const progressPercent =
    timer.totalSeconds > 0
      ? ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100
      : 0;

  return (
    <motion.div
      id={`timer-card-${timer.id}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/[0.08] transition-all rounded-3xl p-6 text-white shadow-2xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Bell className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm sm:text-base tracking-wide text-white/90">{timer.label}</span>
        </div>
        {timer.isCompleted ? (
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-semibold animate-pulse backdrop-blur-md">
            Time's Up!
          </span>
        ) : (
          <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/80 font-medium backdrop-blur-md">
            {timer.isRunning ? "Active" : "Paused"}
          </span>
        )}
      </div>

      {/* Center Countdown Display */}
      <div className="flex flex-col items-center justify-center my-4">
        <span
          className={`text-5xl sm:text-6xl font-mono font-light tracking-wider ${
            timer.isCompleted ? "text-emerald-400 animate-bounce" : "text-white"
          }`}
        >
          {formatTime(timer.remainingSeconds)}
        </span>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
          <motion.div
            className={`h-full ${timer.isCompleted ? "bg-emerald-400" : "bg-gradient-to-r from-cyan-400 to-blue-500"}`}
            style={{ width: `${Math.min(100, progressPercent)}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-2.5 pt-2">
        <button
          id={`btn-toggle-timer-${timer.id}`}
          onClick={() => onToggle(timer.id)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-lg transition-all active:scale-95 ${
            timer.isRunning
              ? "bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:from-blue-400 hover:to-cyan-400"
          }`}
        >
          {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {timer.isRunning ? "Pause" : "Start"}
        </button>

        <button
          id={`btn-reset-timer-${timer.id}`}
          onClick={() => onReset(timer.id)}
          className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all backdrop-blur-md"
          title="Reset Timer"
          aria-label="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id={`btn-addmin-timer-${timer.id}`}
          onClick={() => onAddMinute(timer.id)}
          className="flex items-center gap-1 px-3 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/70 hover:text-white transition-all backdrop-blur-md"
          title="Add 1 Minute"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+1 min</span>
        </button>

        <button
          id={`btn-del-timer-${timer.id}`}
          onClick={() => onDelete(timer.id)}
          className="p-2.5 rounded-2xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-white/60 hover:text-rose-300 transition-all backdrop-blur-md ml-auto"
          title="Delete"
          aria-label="Delete Timer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
