import { useState, useEffect, useRef, useCallback } from "react";
import { AssistantStatus, ChatMessage, DisplayCard, VoiceSettings, DeviceState, TimerItem, AlarmItem, ReminderItem, NoteItem, MediaTrack, CalendarEvent } from "../types";
import { playActivationChime, playSuccessChime, playTimerAlarmTone, playPcmAudio, musicSynth } from "../utils/audioEffects";
import confetti from "canvas-confetti";

export function useVoiceAssistant() {
  const [status, setStatus] = useState<AssistantStatus>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeCards, setActiveCards] = useState<DisplayCard[]>([]);

  // Application Subsystems State
  const [timers, setTimers] = useState<TimerItem[]>([]);
  const [alarms, setAlarms] = useState<AlarmItem[]>([
    { id: "alarm-1", label: "Morning Routine", time: "07:00 AM", enabled: true, days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  ]);
  const [reminders, setReminders] = useState<ReminderItem[]>([
    { id: "rem-1", title: "Review Gemini project notes", completed: false, priority: "high", dueTime: "Today at 5 PM", category: "Work" },
    { id: "rem-2", title: "Buy fresh coffee beans", completed: true, priority: "low", dueTime: "Done", category: "Shopping" },
  ]);
  const [notes, setNotes] = useState<NoteItem[]>([
    { id: "note-1", title: "Assistant Project Plan", content: "Designed full-stack Siri voice app with Gemini backend integration.", updatedAt: "10:30 AM", tags: ["Project", "AI"] },
  ]);
  const [deviceState, setDeviceState] = useState<DeviceState>({
    flashlight: false,
    wifi: true,
    bluetooth: true,
    dnd: false,
    theme: "dark",
    volume: 75,
    brightness: 85,
  });
  const [currentMedia, setCurrentMedia] = useState<MediaTrack | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    { id: "cal-1", title: "Product Strategy Sync", date: "Today", time: "3:00 PM", durationMinutes: 45, location: "Google Meet" },
  ]);

  // Voice & UI Settings
  const [settings, setSettings] = useState<VoiceSettings>({
    ttsProvider: "gemini",
    geminiVoice: "Kore",
    speechRate: 1.0,
    speechPitch: 1.0,
    sfxEnabled: true,
    continuousListening: false,
    wakeWordEnabled: true,
    ambientGlowTheme: "siri-classic",
    autoSpeakResponse: true,
  });

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isListeningRef = useRef<boolean>(false);

  // Timers countdown ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        let hasUpdated = false;
        const next = prevTimers.map((t) => {
          if (t.isRunning && t.remainingSeconds > 0) {
            hasUpdated = true;
            const rem = t.remainingSeconds - 1;
            if (rem === 0) {
              // Timer finished!
              if (settings.sfxEnabled) playTimerAlarmTone();
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
              return { ...t, remainingSeconds: 0, isRunning: false, isCompleted: true };
            }
            return { ...t, remainingSeconds: rem };
          }
          return t;
        });
        return hasUpdated ? next : prevTimers;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [settings.sfxEnabled]);

  // Setup Audio Analyser for mic volume
  const startAudioMeter = async () => {
    try {
      if (!micStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
      }
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(micStreamRef.current);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current || !isListeningRef.current) {
          setVolumeLevel(0);
          return;
        }
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(1, avg / 85);
        setVolumeLevel(normalized);
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (err) {
      console.warn("Could not start audio meter:", err);
    }
  };

  const stopAudioMeter = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    setVolumeLevel(0);
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        isListeningRef.current = true;
        setStatus("listening");
        setInterimTranscript("");
        startAudioMeter();
        if (settings.sfxEnabled) playActivationChime();
      };

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let finalTrans = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTrans += trans;
          } else {
            currentInterim += trans;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (finalTrans) {
          setTranscript(finalTrans);
          setInterimTranscript("");
          processVoiceCommand(finalTrans);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          setStatus("idle");
        }
        isListeningRef.current = false;
        stopAudioMeter();
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        stopAudioMeter();
        if (status === "listening") {
          setStatus("idle");
        }
      };

      recognitionRef.current = recognition;
    }
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      stopAudioMeter();
    };
  }, [settings.sfxEnabled]);

  // Start Voice Listening
  const startListening = useCallback(() => {
    if (status === "speaking") {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Recognition start error, restarting:", err);
        try {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current.start(), 150);
        } catch (_) {}
      }
    } else {
      // Browser doesn't support SpeechRecognition
      setStatus("listening");
    }
  }, [status]);

  // Stop Voice Listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    isListeningRef.current = false;
    stopAudioMeter();
    setStatus("idle");
  }, []);

  // Text-to-Speech playback
  const speakText = async (text: string) => {
    if (!text || !settings.autoSpeakResponse) return;
    setStatus("speaking");

    // Try Gemini TTS if configured
    if (settings.ttsProvider === "gemini") {
      try {
        const response = await fetch("/api/gemini/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            voiceName: settings.geminiVoice,
          }),
        });
        const data = await response.json();
        if (data.audioBase64 && !data.useBrowserTTS) {
          await playPcmAudio(data.audioBase64);
          setStatus("idle");
          return;
        }
      } catch (err) {
        console.warn("Gemini TTS fetch error, fallback to browser synthesis:", err);
      }
    }

    // Fallback: Browser Web Speech Synthesis
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.speechRate;
      utterance.pitch = settings.speechPitch;

      // Select natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.name.includes("Samantha") ||
          v.name.includes("Google") ||
          v.name.includes("Natural") ||
          v.name.includes("Siri") ||
          v.lang.startsWith("en")
      );
      if (preferred) utterance.voice = preferred;

      utterance.onend = () => {
        setStatus("idle");
      };
      utterance.onerror = () => {
        setStatus("idle");
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setStatus("idle");
    }
  };

  // Main command processing pipeline
  const processVoiceCommand = async (commandText: string) => {
    if (!commandText || !commandText.trim()) return;

    setStatus("processing");
    const userMsgId = `user-${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: commandText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newUserMsg]);

    try {
      const response = await fetch("/api/gemini/voice-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: commandText,
          history: messages.slice(-4).map((m) => ({ role: m.sender, text: m.text })),
          contextState: {
            deviceState,
            timersCount: timers.length,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const assistantText = data.spokenText || "I've processed your request.";
      const card = data.displayCard;
      const toolAction = data.toolAction;

      // Execute side-effects on state if tool action was invoked
      if (toolAction) {
        handleToolExecution(toolAction);
      }

      if (settings.sfxEnabled) {
        playSuccessChime();
      }

      // Add assistant message to history
      const assistantMsg: ChatMessage = {
        id: `assist-${Date.now()}`,
        sender: "assistant",
        text: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        card: card || undefined,
        groundingSources: data.groundingSources,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Push card to active cards stack
      if (card) {
        setActiveCards((prev) => [card, ...prev.filter((c) => c.type !== card.type).slice(0, 4)]);
      }

      // Speak response
      await speakText(assistantText);
    } catch (err: any) {
      console.error("Command processing failed:", err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: "I'm sorry, I ran into an issue processing that. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
    }
  };

  // Execute internal action side effects
  const handleToolExecution = (toolAction: { name: string; args: any }) => {
    const { name, args } = toolAction;
    switch (name) {
      case "set_timer": {
        const secs = Number(args.durationSeconds) || 300;
        const newTimer: TimerItem = {
          id: `timer-${Date.now()}`,
          label: args.label || "Timer",
          totalSeconds: secs,
          remainingSeconds: secs,
          isRunning: true,
          isCompleted: false,
        };
        setTimers((prev) => [newTimer, ...prev]);
        break;
      }

      case "set_alarm": {
        const newAlarm: AlarmItem = {
          id: `alarm-${Date.now()}`,
          label: args.label || "Alarm",
          time: args.time || "07:00 AM",
          enabled: true,
          days: ["Every day"],
        };
        setAlarms((prev) => [newAlarm, ...prev]);
        break;
      }

      case "add_reminder": {
        const newReminder: ReminderItem = {
          id: `rem-${Date.now()}`,
          title: args.title || "New reminder",
          completed: false,
          priority: args.priority || "medium",
          dueTime: args.dueTime || "Today",
          category: args.category || "General",
        };
        setReminders((prev) => [newReminder, ...prev]);
        break;
      }

      case "create_note": {
        const newNote: NoteItem = {
          id: `note-${Date.now()}`,
          title: args.title || "Voice Note",
          content: args.content || "",
          updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          tags: args.tags || ["Voice"],
        };
        setNotes((prev) => [newNote, ...prev]);
        break;
      }

      case "control_device": {
        const dev = args.device?.toLowerCase();
        const action = args.action?.toLowerCase();
        setDeviceState((prev) => {
          const next = { ...prev };
          if (dev === "flashlight") next.flashlight = action === "toggle" ? !prev.flashlight : action === "on";
          if (dev === "wifi") next.wifi = action === "toggle" ? !prev.wifi : action === "on";
          if (dev === "bluetooth") next.bluetooth = action === "toggle" ? !prev.bluetooth : action === "on";
          if (dev === "dnd") next.dnd = action === "toggle" ? !prev.dnd : action === "on";
          if (dev === "theme") next.theme = args.value === "light" || action === "light" ? "light" : "dark";
          if (dev === "volume") next.volume = action === "increase" ? Math.min(100, prev.volume + 20) : action === "decrease" ? Math.max(0, prev.volume - 20) : 80;
          if (dev === "brightness") next.brightness = action === "increase" ? Math.min(100, prev.brightness + 20) : action === "decrease" ? Math.max(10, prev.brightness - 20) : 75;
          return next;
        });
        break;
      }

      case "play_media": {
        const isPlay = args.action === "play" || args.action === "resume";
        if (isPlay) {
          musicSynth.start(args.genre || "lofi");
          setCurrentMedia({
            id: `media-${Date.now()}`,
            title: args.query ? `Track for "${args.query}"` : `${args.genre || "Lo-Fi"} Chill Vibes`,
            artist: "Gemini Beats",
            genre: args.genre || "Lo-Fi",
            duration: 180,
            isPlaying: true,
            coverGradient: "from-purple-600 via-indigo-600 to-cyan-500",
          });
        } else {
          musicSynth.stop();
          if (currentMedia) {
            setCurrentMedia({ ...currentMedia, isPlaying: false });
          }
        }
        break;
      }

      case "create_calendar_event": {
        const newEvent: CalendarEvent = {
          id: `cal-${Date.now()}`,
          title: args.title,
          date: args.date || "Tomorrow",
          time: args.time,
          durationMinutes: args.durationMinutes || 60,
          location: args.location || "Online",
        };
        setCalendarEvents((prev) => [newEvent, ...prev]);
        break;
      }

      default:
        break;
    }
  };

  // Timer controls
  const toggleTimer = (timerId: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === timerId ? { ...t, isRunning: !t.isRunning } : t))
    );
  };

  const resetTimer = (timerId: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === timerId ? { ...t, remainingSeconds: t.totalSeconds, isRunning: false, isCompleted: false } : t))
    );
  };

  const addTimerMinute = (timerId: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === timerId ? { ...t, remainingSeconds: t.remainingSeconds + 60, totalSeconds: t.totalSeconds + 60 } : t))
    );
  };

  const deleteTimer = (timerId: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== timerId));
  };

  // Toggle Reminder
  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  // Toggle Alarm
  const toggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  return {
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
  };
}
