import { X, Sparkles, Timer, CloudSun, CheckSquare, Calculator, Music, Sliders, StickyNote, Calendar, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CapabilitiesModalProps {
  isOpen: boolean;
  onSelectPrompt: (prompt: string) => void;
  onClose: () => void;
}

export const CapabilitiesModal = ({
  isOpen,
  onSelectPrompt,
  onClose,
}: CapabilitiesModalProps) => {
  const capabilityCategories = [
    {
      title: "Timers & Alarms",
      icon: <Timer className="w-4 h-4 text-amber-400" />,
      prompts: [
        "Set a 5-minute timer for Pasta",
        "Set an alarm for 7:30 AM tomorrow",
        "Countdown 90 seconds for tea",
      ],
    },
    {
      title: "Weather & Forecast",
      icon: <CloudSun className="w-4 h-4 text-sky-400" />,
      prompts: [
        "What's the weather in Tokyo?",
        "Is it going to rain in London today?",
        "What is the temperature in New York?",
      ],
    },
    {
      title: "Reminders & Tasks",
      icon: <CheckSquare className="w-4 h-4 text-emerald-400" />,
      prompts: [
        "Remind me to call Mom at 6 PM",
        "Add buy groceries to my reminders",
        "Create a high priority task for project submission",
      ],
    },
    {
      title: "Calculations & Tips",
      icon: <Calculator className="w-4 h-4 text-cyan-400" />,
      prompts: [
        "Calculate 18% tip on an $86.50 dinner bill",
        "What is 450 divided by 12?",
        "Convert 15 kilometers to miles",
      ],
    },
    {
      title: "Music & Lo-Fi Beats",
      icon: <Music className="w-4 h-4 text-purple-400" />,
      prompts: [
        "Play some chill lofi music for studying",
        "Play smooth midnight jazz beats",
        "Play retro synthwave music",
      ],
    },
    {
      title: "Device Controls",
      icon: <Sliders className="w-4 h-4 text-indigo-400" />,
      prompts: [
        "Turn on the flashlight",
        "Enable Do Not Disturb mode",
        "Set brightness to 80%",
      ],
    },
    {
      title: "Notes & Memos",
      icon: <StickyNote className="w-4 h-4 text-yellow-400" />,
      prompts: [
        "Note that meeting is rescheduled to Wednesday",
        "Take a memo: Brainstorm ideas for the hackathon",
      ],
    },
    {
      title: "Calendar & Schedule",
      icon: <Calendar className="w-4 h-4 text-rose-400" />,
      prompts: [
        "Schedule a Dentist Appointment tomorrow at 3 PM",
        "Create calendar event: Team Sync at 11 AM",
      ],
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-2xl bg-[#080d1a]/85 border border-white/15 backdrop-blur-2xl rounded-3xl p-6 text-white shadow-2xl z-10 max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center backdrop-blur-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Voice Assistant Capabilities</h3>
                  <p className="text-xs text-white/50">Click any voice command to try it right away</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 border border-white/10 transition-all backdrop-blur-md"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of categories */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {capabilityCategories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="p-2 rounded-xl bg-white/10 border border-white/15">
                        {cat.icon}
                      </div>
                      <h4 className="font-semibold text-xs text-white/90">{cat.title}</h4>
                    </div>

                    <div className="space-y-1.5">
                      {cat.prompts.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            onSelectPrompt(p);
                            onClose();
                          }}
                          className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 text-[11px] text-white/70 hover:text-white transition-all flex items-center justify-between group backdrop-blur-sm"
                        >
                          <span className="truncate">"{p}"</span>
                          <ArrowRight className="w-3 h-3 text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
