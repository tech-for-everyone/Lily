import { VoiceSettings } from "../types";
import { X, Volume2, Sparkles, Sliders, Palette, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SettingsModalProps {
  isOpen: boolean;
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: VoiceSettings) => void;
  onClose: () => void;
}

export const SettingsModal = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
}: SettingsModalProps) => {
  const geminiVoices = ["Kore", "Puck", "Zephyr", "Fenrir", "Charon"] as const;

  const glowThemes = [
    { id: "siri-classic", name: "Siri Classic", color: "from-cyan-400 to-fuchsia-500" },
    { id: "neon-aurora", name: "Neon Aurora", color: "from-emerald-400 to-cyan-500" },
    { id: "cyber-purple", name: "Cyber Purple", color: "from-violet-500 to-pink-500" },
    { id: "cosmic-amber", name: "Cosmic Amber", color: "from-amber-400 to-rose-500" },
    { id: "emerald-zen", name: "Emerald Zen", color: "from-teal-400 to-emerald-600" },
  ] as const;

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
            className="relative w-full max-w-lg bg-[#080d1a]/85 border border-white/15 backdrop-blur-2xl rounded-3xl p-6 text-white shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center backdrop-blur-md">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-lg">Assistant Settings</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 border border-white/10 transition-all backdrop-blur-md"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 pt-4">
              {/* Voice Generation Engine */}
              <div>
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-cyan-400" /> Speech Engine
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => onUpdateSettings({ ...settings, ttsProvider: "gemini" })}
                    className={`p-3.5 rounded-2xl border text-left transition-all backdrop-blur-md ${
                      settings.ttsProvider === "gemini"
                        ? "bg-blue-600/30 border-blue-400/50 text-cyan-200 shadow-lg shadow-blue-900/20"
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="font-medium text-xs text-white">Gemini Cloud TTS</div>
                    <div className="text-[11px] text-white/50 mt-0.5">High-fidelity AI voice</div>
                  </button>

                  <button
                    onClick={() => onUpdateSettings({ ...settings, ttsProvider: "browser" })}
                    className={`p-3.5 rounded-2xl border text-left transition-all backdrop-blur-md ${
                      settings.ttsProvider === "browser"
                        ? "bg-blue-600/30 border-blue-400/50 text-cyan-200 shadow-lg shadow-blue-900/20"
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="font-medium text-xs text-white">Browser Synthesis</div>
                    <div className="text-[11px] text-white/50 mt-0.5">Zero latency local speech</div>
                  </button>
                </div>
              </div>

              {/* Gemini Voice Persona */}
              {settings.ttsProvider === "gemini" && (
                <div>
                  <label className="text-xs font-semibold text-white/80 uppercase tracking-wider block mb-2">
                    Gemini Voice Personality
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {geminiVoices.map((v) => (
                      <button
                        key={v}
                        onClick={() => onUpdateSettings({ ...settings, geminiVoice: v })}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all backdrop-blur-md ${
                          settings.geminiVoice === v
                            ? "bg-blue-600/40 border-blue-400 text-white shadow-md shadow-blue-500/20"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ambient Glow Aura Theme */}
              <div>
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-cyan-400" /> Siri Glow Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {glowThemes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onUpdateSettings({ ...settings, ambientGlowTheme: t.id })}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-medium transition-all backdrop-blur-md ${
                        settings.ambientGlowTheme === t.id
                          ? "bg-white/15 border-white/40 text-white shadow-lg"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${t.color} shrink-0`} />
                      <span className="truncate">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Speech Rate & Pitch Sliders */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
                    <span>Speech Rate ({settings.speechRate}x)</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.3"
                    step="0.05"
                    value={settings.speechRate}
                    onChange={(e) => onUpdateSettings({ ...settings, speechRate: Number(e.target.value) })}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-white">Sound Effects (SFX)</div>
                    <div className="text-[11px] text-white/50">Play chimes on listening and action success</div>
                  </div>
                  <button
                    onClick={() => onUpdateSettings({ ...settings, sfxEnabled: !settings.sfxEnabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.sfxEnabled ? "bg-cyan-500 shadow-md shadow-cyan-500/30" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.sfxEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-white">Auto Speak Response</div>
                    <div className="text-[11px] text-white/50">Read out answers using text-to-speech automatically</div>
                  </div>
                  <button
                    onClick={() => onUpdateSettings({ ...settings, autoSpeakResponse: !settings.autoSpeakResponse })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.autoSpeakResponse ? "bg-cyan-500 shadow-md shadow-cyan-500/30" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.autoSpeakResponse ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Done button */}
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-xs font-medium backdrop-blur-md shadow-lg transition-all"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
