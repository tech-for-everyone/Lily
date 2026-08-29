import { ReminderItem } from "../../types";
import { CheckCircle2, Circle, ListTodo, Tag } from "lucide-react";
import { motion } from "motion/react";

interface ReminderCardProps {
  key?: string;
  reminders: ReminderItem[];
  onToggle: (id: string) => void;
}

export const ReminderCard = ({ reminders, onToggle }: ReminderCardProps) => {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">High</span>;
      case "medium":
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">Medium</span>;
      default:
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-500/20 text-slate-300">Normal</span>;
    }
  };

  return (
    <motion.div
      id="reminders-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/[0.08] transition-all rounded-3xl p-6 text-white shadow-2xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center backdrop-blur-md">
            <ListTodo className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm sm:text-base tracking-wide text-white/90">Reminders</span>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/80 font-medium backdrop-blur-md">
          {reminders.filter((r) => !r.completed).length} pending
        </span>
      </div>

      <div className="space-y-2 mt-2 max-h-56 overflow-y-auto pr-1">
        {reminders.map((item) => (
          <div
            key={item.id}
            onClick={() => onToggle(item.id)}
            className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
              item.completed
                ? "bg-white/[0.02] border-white/5 opacity-50"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <button className="mt-0.5 text-white/50 hover:text-emerald-400 transition-colors" aria-label="Toggle completed">
              {item.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs sm:text-sm font-medium leading-snug ${
                  item.completed ? "line-through text-white/40" : "text-white/90"
                }`}
              >
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {item.dueTime && (
                  <span className="text-[11px] text-white/50">{item.dueTime}</span>
                )}
                {getPriorityBadge(item.priority)}
                {item.category && (
                  <span className="flex items-center gap-1 text-[10px] text-white/50">
                    <Tag className="w-2.5 h-2.5" />
                    {item.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
