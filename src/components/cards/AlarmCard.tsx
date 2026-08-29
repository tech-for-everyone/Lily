import { AlarmItem } from "../../types";
import { Clock } from "lucide-react";
import { motion } from "motion/react";

interface AlarmCardProps {
  key?: string;
  alarm: AlarmItem;
  onToggle: (id: string) => void;
}

export const AlarmCard = ({ alarm, onToggle }: AlarmCardProps) => {
  return (
    <motion.div
      id={`alarm-card-${alarm.id}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/[0.08] transition-all rounded-3xl p-6 text-white shadow-2xl flex items-center justify-between"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center backdrop-blur-md">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <span className="text-3xl sm:text-4xl font-light tracking-tight">{alarm.time}</span>
          <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
            <span>{alarm.label}</span>
            <span>•</span>
            <span>{alarm.days?.join(", ") || "Daily"}</span>
          </div>
        </div>
      </div>

      <button
        id={`toggle-alarm-${alarm.id}`}
        onClick={() => onToggle(alarm.id)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          alarm.enabled ? "bg-emerald-500 shadow-md shadow-emerald-500/30" : "bg-white/20"
        }`}
        aria-label="Toggle Alarm"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            alarm.enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </motion.div>
  );
};
