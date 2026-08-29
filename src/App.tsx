/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent } from "react";
import { useVoiceAssistant } from "./hooks/useVoiceAssistant";
import { SiriOrb } from "./components/SiriOrb";
import { QuickPromptPills } from "./components/QuickPromptPills";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { SettingsModal } from "./components/SettingsModal";
import { CapabilitiesModal } from "./components/CapabilitiesModal";

// Cards
import { WeatherCard } from "./components/cards/WeatherCard";
import { TimerCard } from "./components/cards/TimerCard";
import { AlarmCard } from "./components/cards/AlarmCard";
import { ReminderCard } from "./components/cards/ReminderCard";
import { NoteCard } from "./components/cards/NoteCard";
import { CalculatorCard } from "./components/cards/CalculatorCard";
import { DeviceCard } from "./components/cards/DeviceCard";
import { MediaCard } from "./components/cards/MediaCard";
import { CalendarCard } from "./components/cards/CalendarCard";
import { SearchCard } from "./components/cards/SearchCard";
import { SystemdCard } from "./components/cards/SystemdCard";
import { AppLauncherCard } from "./components/cards/AppLauncherCard";
import { LinuxSystemCard } from "./components/cards/LinuxSystemCard";
import { TerminalCard } from "./components/cards/TerminalCard";

import {
  Mic,
  MicOff,
  Sparkles,
  History,
  Sliders,
  Send,
  HelpCircle,
  Clock,
  CheckCircle2,
  Volume2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const {
    status,
    transcript,
    interimTranscript,
    volumeLevel,
    messages,
    activeCards,
    timers,
    alarms,
    reminders,
    notes,
    deviceState,
    currentMedia,
    calendarEvents,
    settings,
    setSettings,
    setDeviceState,
    startListening,
    stopListening,
    processVoiceCommand,
    speakText,
    toggleTimer,
    resetTimer,
    addTimerMinute,
    deleteTimer,
    toggleReminder,
    toggleAlarm,
    setCurrentMedia,
  } = useVoiceAssistant();

  const [textInput, setTextInput] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCapabilitiesOpen, setIsCapabilitiesOpen] = useState(false);

  const handleSubmitText = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim() || status === "processing") return;
    const cmd = textInput.trim();
    setTextInput("");
    processVoiceCommand(cmd);
  };

  const handleOrbClick = () => {
    if (status === "listening") {
      stopListening();
    } else {
      startListening();
    }
  };

  // Get latest assistant reply for quick transcript view
  const lastAssistantMsg = messages.filter((m) => m.sender === "assistant").slice(-1)[0];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-500 selection:bg-cyan-500/30 overflow-x-hidden relative ${
        deviceState.theme === "light"
          ? "bg-slate-900 text-slate-100"
          : "bg-[#050810] text-slate-100"
      }`}
    >
      {/* Dynamic Flashlight simulation backdrop if active */}
      {deviceState.flashlight && (
        <div className="fixed inset-0 pointer-events-none z-0 bg-amber-400/10 mix-blend-screen transition-opacity duration-300" />
      )}

      {/* Frosted Glass Ambient Lighting Spheres */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-150px] left-[-100px] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-100px] right-[-50px] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px]" />
      </div>

      {/* Frosted Glass Top Navigation Bar */}
      <header className="relative z-20 w-full backdrop-blur-md bg-white/5 border-b border-white/10 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </div>
          <div>
            <h1 className="font-semibold text-base sm:text-lg tracking-tight text-white/90 flex items-center gap-2">
              <span>Siri</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                Gemini Live
              </span>
            </h1>
            <p className="text-[11px] text-white/50">Frosted Glass Voice Assistant</p>
          </div>
        </div>

        {/* Status Indicator & Header Controls */}
        <div className="flex items-center gap-3">
          {/* Active Timers Badge */}
          {timers.filter((t) => t.isRunning).length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono backdrop-blur-md">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>
                {timers.filter((t) => t.isRunning).length} Active
              </span>
            </div>
          )}

          {/* System Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]" />
            <span className="text-xs text-emerald-100 font-medium">System Ready</span>
          </div>

          {/* Capabilities Button */}
          <button
            id="btn-capabilities"
            onClick={() => setIsCapabilitiesOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-all backdrop-blur-md"
            title="What can I ask?"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Commands</span>
          </button>

          {/* History Button */}
          <button
            id="btn-history"
            onClick={() => setIsHistoryOpen(true)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all backdrop-blur-md relative"
            title="Conversation History"
            aria-label="Conversation History"
          >
            <History className="w-4 h-4 text-purple-300" />
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full ring-2 ring-[#050810]" />
            )}
          </button>

          {/* Settings Button */}
          <button
            id="btn-settings"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all backdrop-blur-md"
            title="Settings"
            aria-label="Settings"
          >
            <Sliders className="w-4 h-4 text-blue-300" />
          </button>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-6 max-w-4xl mx-auto w-full">
        {/* Dynamic Siri Status & Transcriptions */}
        <div className="w-full text-center mb-6 min-h-[5.5rem] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {status === "listening" && (
              <motion.div
                key="listening-state"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-medium uppercase tracking-wider mb-2 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Listening for commands...
                </div>
                <p className="text-xl sm:text-3xl font-light text-white max-w-xl mx-auto tracking-tight">
                  {interimTranscript || transcript || (
                    <span className="text-white/40 italic">"Say a command, e.g. What's the weather in Tokyo?"</span>
                  )}
                </p>
              </motion.div>
            )}

            {status === "processing" && (
              <motion.div
                key="processing-state"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-xs font-medium uppercase tracking-wider mb-2 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  Gemini reasoning...
                </div>
                <p className="text-base sm:text-lg text-white/70 font-light">Synthesizing real-time response...</p>
              </motion.div>
            )}

            {status === "speaking" && lastAssistantMsg && (
              <motion.div
                key="speaking-state"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center max-w-xl mx-auto"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-medium uppercase tracking-wider mb-2 backdrop-blur-md">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  Speaking response
                </div>
                <p className="text-lg sm:text-2xl font-light text-white tracking-tight leading-relaxed">
                  "{lastAssistantMsg.text}"
                </p>
              </motion.div>
            )}

            {status === "idle" && (
              <motion.div
                key="idle-state"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center"
              >
                {lastAssistantMsg ? (
                  <div className="space-y-2">
                    <p className="text-base sm:text-xl text-white/90 max-w-lg mx-auto font-light leading-relaxed">
                      "{lastAssistantMsg.text}"
                    </p>
                    <p className="text-xs text-white/40">Tap the orb to continue the conversation</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
                      How can I assist you today?
                    </h2>
                    <p className="text-sm sm:text-lg text-white/50 font-medium">
                      Listening for natural voice commands or quick actions
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Central Glowing Siri Plasma Orb */}
        <div className="my-4 sm:my-8 flex items-center justify-center">
          <SiriOrb
            status={status}
            volumeLevel={volumeLevel}
            glowTheme={settings.ambientGlowTheme}
            onClick={handleOrbClick}
          />
        </div>

        {/* Dynamic Context Cards Stack */}
        <div className="w-full flex flex-col items-center gap-4 my-4 max-w-md">
          {/* Render Active Timers */}
          {timers.map((t) => (
            <TimerCard
              key={t.id}
              timer={t}
              onToggle={toggleTimer}
              onReset={resetTimer}
              onAddMinute={addTimerMinute}
              onDelete={deleteTimer}
            />
          ))}

          {/* Render Active Cards generated from assistant response */}
          {activeCards.map((card, idx) => {
            switch (card.type) {
              case "weather":
                return <WeatherCard key={`w-${idx}`} data={card.data} />;
              case "reminder":
                return <ReminderCard key={`rem-${idx}`} reminders={reminders} onToggle={toggleReminder} />;
              case "alarm":
                return <AlarmCard key={`alarm-${idx}`} alarm={card.data} onToggle={toggleAlarm} />;
              case "note":
                return <NoteCard key={`note-${idx}`} note={card.data} />;
              case "calculator":
                return <CalculatorCard key={`calc-${idx}`} data={card.data} />;
              case "device":
                return <DeviceCard key={`dev-${idx}`} deviceState={deviceState} onChange={(updates) => setDeviceState({ ...deviceState, ...updates })} />;
              case "media":
                return (
                  <MediaCard
                    key={`med-${idx}`}
                    media={currentMedia || card.data}
                    onTogglePlay={() => {
                      if (currentMedia?.isPlaying) {
                        setCurrentMedia({ ...currentMedia, isPlaying: false });
                      } else if (currentMedia) {
                        setCurrentMedia({ ...currentMedia, isPlaying: true });
                      }
                    }}
                  />
                );
              case "calendar":
                return <CalendarCard key={`cal-${idx}`} event={card.data} />;
              case "search":
                return <SearchCard key={`search-${idx}`} data={card.data} />;
              case "systemd":
                return <SystemdCard key={`sysd-${idx}`} data={card.data} />;
              case "app_launcher":
                return <AppLauncherCard key={`app-${idx}`} data={card.data} />;
              case "linux_system":
                return <LinuxSystemCard key={`linux-${idx}`} data={card.data} />;
              case "terminal":
                return <TerminalCard key={`term-${idx}`} data={card.data} />;
              default:
                return null;
            }
          })}
        </div>

        {/* Quick Suggested Voice Prompts */}
        <div className="mt-2 mb-4 w-full flex justify-center">
          <QuickPromptPills
            onSelect={(prompt) => processVoiceCommand(prompt)}
            disabled={status === "processing" || status === "listening"}
          />
        </div>
      </main>

      {/* Frosted Glass Bottom Command Input Dock */}
      <footer className="relative z-20 w-full max-w-3xl mx-auto px-4 pb-8 pt-2">
        <form
          onSubmit={handleSubmitText}
          className="relative backdrop-blur-2xl bg-white/5 border border-white/20 rounded-[32px] sm:rounded-[40px] px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-2xl focus-within:border-cyan-400/50 transition-all gap-2"
        >
          {/* Animated audio equalizer visualizer accent */}
          <div className="hidden sm:flex gap-1 items-center pl-2 shrink-0">
            <motion.div
              animate={{ height: status === "listening" ? [12, 20, 8] : 12 }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="w-1 bg-blue-400/60 rounded-full"
            />
            <motion.div
              animate={{ height: status === "listening" ? [18, 10, 24] : 18 }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="w-1 bg-blue-400/80 rounded-full"
            />
            <motion.div
              animate={{ height: status === "listening" ? [28, 14, 30] : 26 }}
              transition={{ repeat: Infinity, duration: 0.7 }}
              className="w-1 bg-blue-400 rounded-full"
            />
            <motion.div
              animate={{ height: status === "listening" ? [14, 26, 12] : 16 }}
              transition={{ repeat: Infinity, duration: 0.55 }}
              className="w-1 bg-blue-400/80 rounded-full"
            />
            <motion.div
              animate={{ height: status === "listening" ? [10, 18, 6] : 10 }}
              transition={{ repeat: Infinity, duration: 0.65 }}
              className="w-1 bg-blue-400/60 rounded-full"
            />
          </div>

          {/* Microphone Quick Toggle Button */}
          <button
            type="button"
            id="btn-bottom-mic"
            onClick={handleOrbClick}
            className={`p-2.5 sm:p-3 rounded-2xl border transition-all shrink-0 ${
              status === "listening"
                ? "bg-rose-500/80 border-rose-400 text-white shadow-lg shadow-rose-500/30 animate-pulse"
                : "bg-white/10 hover:bg-white/20 border-white/20 text-cyan-300 hover:text-white"
            }`}
            title={status === "listening" ? "Stop listening" : "Start voice listening"}
            aria-label={status === "listening" ? "Stop listening" : "Start voice listening"}
          >
            {status === "listening" ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Text Input */}
          <input
            id="input-command-text"
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={
              status === "listening"
                ? "Listening to your voice..."
                : "Ask Gemini anything, e.g. set timer, weather, notes..."
            }
            className="flex-1 bg-transparent px-2 sm:px-4 py-2 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none"
          />

          {/* Send / Execute Button */}
          <button
            type="submit"
            id="btn-submit-command"
            disabled={!textInput.trim() || status === "processing"}
            className="p-2.5 sm:p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 shrink-0"
            aria-label="Send Command"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </footer>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        messages={messages}
        onClose={() => setIsHistoryOpen(false)}
        onReplay={(txt) => speakText(txt)}
        onClear={() => {}}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onUpdateSettings={setSettings}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Capabilities Cheat Sheet Modal */}
      <CapabilitiesModal
        isOpen={isCapabilitiesOpen}
        onSelectPrompt={(p) => processVoiceCommand(p)}
        onClose={() => setIsCapabilitiesOpen(false)}
      />
    </div>
  );
}
