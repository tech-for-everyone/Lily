import { ChatMessage } from "../types";
import { X, Volume2, Bot, User, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HistoryDrawerProps {
  isOpen: boolean;
  messages: ChatMessage[];
  onClose: () => void;
  onReplay: (text: string) => void;
  onClear: () => void;
}

export const HistoryDrawer = ({
  isOpen,
  messages,
  onClose,
  onReplay,
  onClear,
}: HistoryDrawerProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#080d1a]/80 border-l border-white/10 z-50 p-6 flex flex-col text-white shadow-2xl backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center backdrop-blur-md">
                  <Bot className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-base">Conversation History</h3>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={onClear}
                    className="p-2 text-white/50 hover:text-rose-400 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 transition-all backdrop-blur-md"
                    title="Clear history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 border border-white/10 transition-all backdrop-blur-md"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-white/40 p-6">
                  <Bot className="w-12 h-12 mb-3 opacity-30 text-cyan-400" />
                  <p className="text-sm font-medium text-white/80">No voice commands yet</p>
                  <p className="text-xs text-white/50 mt-1">
                    Tap the Siri orb or click a prompt to start interacting.
                  </p>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5 text-[11px] text-white/50">
                      {m.sender === "user" ? (
                        <>
                          <span>You</span>
                          <User className="w-3 h-3 text-cyan-300" />
                        </>
                      ) : (
                        <>
                          <Bot className="w-3 h-3 text-blue-300" />
                          <span>Gemini Siri</span>
                        </>
                      )}
                      <span>• {m.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed backdrop-blur-xl border ${
                        m.sender === "user"
                          ? "bg-blue-600/30 border-blue-400/40 text-white rounded-tr-none shadow-lg shadow-blue-900/20"
                          : "bg-white/5 text-white/90 rounded-tl-none border-white/10 shadow-lg"
                      }`}
                    >
                      <p>{m.text}</p>
                      {m.sender === "assistant" && (
                        <button
                          onClick={() => onReplay(m.text)}
                          className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-200 mt-2 font-medium"
                        >
                          <Volume2 className="w-3 h-3" /> Replay Speech
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
