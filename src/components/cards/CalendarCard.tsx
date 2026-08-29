import { CalendarEvent } from "../../types";
import { Calendar as CalIcon, Clock, MapPin } from "lucide-react";
import { motion } from "motion/react";

interface CalendarCardProps {
  key?: string;
  event: CalendarEvent;
}

export const CalendarCard = ({ event }: CalendarCardProps) => {
  return (
    <motion.div
      id={`cal-card-${event.id}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/[0.08] transition-all rounded-3xl p-6 text-white shadow-2xl"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center justify-center backdrop-blur-md">
            <CalIcon className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm sm:text-base tracking-wide text-white/90">Calendar Event</span>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/80 font-medium backdrop-blur-md">
          {event.date}
        </span>
      </div>

      <h3 className="text-base sm:text-lg font-medium text-white mt-3 mb-3">{event.title}</h3>

      <div className="space-y-2 text-xs text-white/70 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-rose-400" />
          <span>
            {event.time} ({event.durationMinutes} mins)
          </span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>{event.location}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
