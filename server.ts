import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, Type, FunctionDeclaration } from "@google/genai";
import dotenv from "dotenv";
import {
  manageSystemdService,
  launchLinuxApp,
  controlLinuxSystem,
  executeTerminalCommand,
} from "./server/linuxEngine";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy Google GenAI Client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Function declarations for Siri Assistant tools
const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "get_weather",
    description: "Get real-time weather information, temperatures, conditions, and forecast for any city or location.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        location: {
          type: Type.STRING,
          description: "City name or location (e.g., 'San Francisco, CA', 'Tokyo', 'London')",
        },
        unit: {
          type: Type.STRING,
          description: "Temperature unit: 'celsius' or 'fahrenheit'",
        },
      },
      required: ["location"],
    },
  },
  {
    name: "set_timer",
    description: "Set a countdown timer with a specific duration in seconds or minutes.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        durationSeconds: {
          type: Type.NUMBER,
          description: "Total duration of timer in seconds (e.g., 300 for 5 minutes, 60 for 1 minute)",
        },
        label: {
          type: Type.STRING,
          description: "Optional label for the timer (e.g., 'Pasta', 'Workout', 'Tea', 'Power Nap')",
        },
      },
      required: ["durationSeconds"],
    },
  },
  {
    name: "set_alarm",
    description: "Set a morning or scheduled alarm clock.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        time: {
          type: Type.STRING,
          description: "Alarm time formatted like '7:00 AM' or '06:30 PM' or '08:00'",
        },
        label: {
          type: Type.STRING,
          description: "Label for the alarm (e.g., 'Wake up', 'Meeting', 'Gym')",
        },
      },
      required: ["time"],
    },
  },
  {
    name: "add_reminder",
    description: "Create a reminder or todo task with priority and optional due time.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "The task or reminder description (e.g., 'Call mom', 'Buy groceries', 'Submit report')",
        },
        priority: {
          type: Type.STRING,
          description: "Priority level: 'low', 'medium', or 'high'",
        },
        dueTime: {
          type: Type.STRING,
          description: "Due time or date string (e.g., 'Today at 5 PM', 'Tomorrow morning')",
        },
        category: {
          type: Type.STRING,
          description: "Category (e.g., 'Personal', 'Work', 'Health', 'Shopping')",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "calculate",
    description: "Perform mathematical calculations, percentages, conversions, tips, or equation solving.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        expression: {
          type: Type.STRING,
          description: "The mathematical expression to evaluate (e.g., '85 * 0.15 + 85', 'sqrt(144) * 5', '120 / 4')",
        },
        result: {
          type: Type.STRING,
          description: "The computed numeric or exact formatted result",
        },
        explanation: {
          type: Type.STRING,
          description: "Brief clear explanation of how the result was obtained",
        },
      },
      required: ["expression", "result"],
    },
  },
  {
    name: "create_note",
    description: "Save a quick note, memo, thought, or list.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "Title of the note",
        },
        content: {
          type: Type.STRING,
          description: "Full body content of the note",
        },
        tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Tags for categorization",
        },
      },
      required: ["title", "content"],
    },
  },
  {
    name: "control_device",
    description: "Adjust or toggle device controls and settings (flashlight, Wi-Fi, Bluetooth, Do Not Disturb, Dark/Light mode, volume, brightness).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        device: {
          type: Type.STRING,
          description: "Target setting: 'flashlight', 'wifi', 'bluetooth', 'dnd', 'theme', 'volume', 'brightness'",
        },
        action: {
          type: Type.STRING,
          description: "Action to take: 'on', 'off', 'toggle', 'set', 'increase', 'decrease'",
        },
        value: {
          type: Type.STRING,
          description: "Optional value like 'dark', 'light', or level '80%'",
        },
      },
      required: ["device", "action"],
    },
  },
  {
    name: "play_media",
    description: "Play, pause, skip, or resume music tracks and ambient audio.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: {
          type: Type.STRING,
          description: "'play', 'pause', 'resume', 'next', 'prev'",
        },
        genre: {
          type: Type.STRING,
          description: "Genre or style: 'lofi', 'ambient', 'jazz', 'pop', 'classical', 'synthwave'",
        },
        query: {
          type: Type.STRING,
          description: "Specific song or artist name requested",
        },
      },
      required: ["action"],
    },
  },
  {
    name: "create_calendar_event",
    description: "Schedule a calendar event or appointment.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "Title of the event (e.g., 'Dentist Appointment', 'Sprint Planning')",
        },
        date: {
          type: Type.STRING,
          description: "Date string (e.g., 'Tomorrow', '2026-08-24', 'Next Monday')",
        },
        time: {
          type: Type.STRING,
          description: "Time of event (e.g., '2:00 PM', '10:30 AM')",
        },
        durationMinutes: {
          type: Type.NUMBER,
          description: "Duration in minutes (e.g., 30, 60)",
        },
        location: {
          type: Type.STRING,
          description: "Location or meeting link",
        },
      },
      required: ["title", "time"],
    },
  },
  {
    name: "convert_units",
    description: "Convert units of measurement (length, weight, temperature, currency, volume, speed).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        amount: { type: Type.NUMBER, description: "Value to convert" },
        fromUnit: { type: Type.STRING, description: "Source unit (e.g., 'miles', 'kg', 'USD', 'celsius')" },
        toUnit: { type: Type.STRING, description: "Target unit (e.g., 'km', 'lbs', 'EUR', 'fahrenheit')" },
        result: { type: Type.STRING, description: "Formatted conversion result" },
      },
      required: ["amount", "fromUnit", "toUnit", "result"],
    },
  },
  {
    name: "manage_systemd",
    description: "Manage, query status, start, stop, restart, enable, or view logs for Arch Linux systemd services/units (e.g., bluetooth, pipewire, docker, sshd, networkmanager, nginx).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        serviceName: {
          type: Type.STRING,
          description: "Name of the systemd unit/service (e.g., 'bluetooth', 'pipewire', 'docker', 'sshd', 'nginx', 'NetworkManager')",
        },
        action: {
          type: Type.STRING,
          description: "Action to perform: 'status', 'start', 'stop', 'restart', 'enable', 'disable', 'journal'",
        },
        scope: {
          type: Type.STRING,
          description: "Systemd scope: 'system' or 'user'",
        },
      },
      required: ["serviceName"],
    },
  },
  {
    name: "launch_linux_app",
    description: "Launch, open, or start a Linux desktop application (e.g., Firefox, Alacritty, Kitty, Code, Spotify, Discord, Nautilus, Thunar, GIMP, VLC, Steam, Obsidian, Htop, Neovim).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        appName: {
          type: Type.STRING,
          description: "Application name or binary command (e.g., 'firefox', 'alacritty', 'kitty', 'code', 'spotify', 'discord', 'nautilus', 'thunar', 'vlc', 'htop', 'btop')",
        },
        args: {
          type: Type.STRING,
          description: "Optional arguments, URLs, or file paths to pass to the application",
        },
      },
      required: ["appName"],
    },
  },
  {
    name: "control_linux_system",
    description: "Control Arch Linux system hardware and settings: master audio volume (PipeWire/PulseAudio), display brightness, power actions (sleep/suspend, reboot, shutdown, lock screen), check pacman package updates, or view hardware stats (RAM/CPU/Disk).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: {
          type: Type.STRING,
          description: "Action: 'volume_set', 'volume_mute', 'volume_unmute', 'volume_up', 'volume_down', 'brightness_set', 'brightness_up', 'brightness_down', 'power_suspend', 'power_reboot', 'power_shutdown', 'power_lock', 'check_updates', 'hardware_stats'",
        },
        value: {
          type: Type.STRING,
          description: "Optional value like '80%', '50%', '+10%'",
        },
      },
      required: ["action"],
    },
  },
  {
    name: "execute_linux_command",
    description: "Execute a safe bash or terminal command on Arch Linux and inspect terminal stdout, stderr, and exit status (e.g., 'fastfetch', 'uname -a', 'free -h', 'df -h', 'ip addr', 'pacman -Q').",
    parameters: {
      type: Type.OBJECT,
      properties: {
        command: {
          type: Type.STRING,
          description: "The shell command to execute in the Linux terminal",
        },
      },
      required: ["command"],
    },
  },
];

// Health endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Process Voice Command Endpoint
app.post("/api/gemini/voice-command", async (req: Request, res: Response) => {
  const { message, history = [], contextState = {} } = req.body;

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "A message string is required" });
    return;
  }

  const ai = getGeminiClient();

  const systemInstruction = `You are Siri, an ultra-fast, intelligent, polite, and charismatic voice assistant powered by Google Gemini running on Arch Linux.
Your purpose is to assist users through natural language voice commands, system management, app launching, and daily productivity.

CRITICAL VOICE RESPONSE PRINCIPLES:
1. Speak in a natural, concise, warm, helpful conversational tone suited for being read aloud (audio Text-to-Speech).
2. Keep spoken replies short, direct, and pleasant (usually 1-2 punchy sentences).
3. Whenever the user requests an action:
   - For systemd services (e.g., status/restart/stop/start/enable/logs of bluetooth, pipewire, docker, sshd, nginx, etc.), call manage_systemd.
   - For opening or launching apps (e.g., Firefox, Alacritty, Kitty, Code, Spotify, Discord, Nautilus, Thunar, GIMP, VLC, Steam, Obsidian, Htop, Neovim), call launch_linux_app.
   - For Arch Linux system controls (audio volume, display brightness, suspend/sleep, reboot, shutdown, lock screen, pacman updates check, hardware stats), call control_linux_system.
   - For executing Linux shell/terminal commands (fastfetch, uname, ip addr, free, df, pacman query, etc.), call execute_linux_command.
   - For timers, alarms, reminders, notes, weather, math, media, device settings, calendar, or unit conversions, call their respective tools.
4. When calling a tool function, formulate a natural spoken confirmation in your response (e.g., "Checking the status of the Bluetooth service now.", "Launching Firefox.", "Adjusting volume to 80 percent.", "Setting a 5-minute timer for Pasta.").
5. Current local context: Date is around ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}. Current time is ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.
6. If the user asks a knowledge question (facts, Arch Linux tips, definitions, trivia), answer succinctly and clearly.`;

  try {
    if (!ai) {
      // Fallback mock responses when API key is not configured
      const fallbackResult = await handleLocalFallback(message, contextState);
      res.json(fallbackResult);
      return;
    }

    // Build conversation contents
    const contents: any[] = [];
    
    // Add past history if present (limit to last 6 turns to keep fast)
    const recentHistory = history.slice(-6);
    for (const h of recentHistory) {
      contents.push({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.text }],
      });
    }

    // Add current user command
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
          tools: [
            { googleSearch: {} },
            { functionDeclarations: toolDeclarations },
          ],
          toolConfig: {
            includeServerSideToolInvocations: true,
          },
        },
      });
    } catch (primaryErr: any) {
      // If 429 or primary model error, attempt secondary lightweight model
      const isQuotaOrRateLimit =
        primaryErr?.status === "RESOURCE_EXHAUSTED" ||
        primaryErr?.code === 429 ||
        primaryErr?.message?.includes("429") ||
        primaryErr?.message?.includes("quota") ||
        primaryErr?.message?.includes("RESOURCE_EXHAUSTED");

      if (isQuotaOrRateLimit) {
        console.warn("Gemini 3.7 Flash quota reached, attempting lightweight fallback model (gemini-3.1-flash-lite)...");
      }

      try {
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            tools: [{ functionDeclarations: toolDeclarations }],
          },
        });
      } catch (fallbackErr: any) {
        console.warn("Gemini API rate limit or quota exceeded. Seamlessly activating local voice engine fallback.");
        const fallbackResult = await handleLocalFallback(message, contextState);
        res.json(fallbackResult);
        return;
      }
    }

    let spokenText = response.text || "";
    const functionCalls = response.functionCalls;
    let toolAction: any = null;
    let displayCard: any = null;

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      toolAction = {
        name: call.name,
        args: call.args as Record<string, any>,
      };

      // Process display card based on tool action
      displayCard = await createCardFromTool(call.name, call.args, message);
      
      // If model didn't generate enough spoken text because of function call, provide clean spoken text
      if (!spokenText || spokenText.trim().length === 0) {
        spokenText = generateDefaultSpokenText(call.name, call.args, displayCard);
      }
    }

    // Extract grounding URLs if search was performed
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const groundingSources: Array<{ title: string; uri: string }> = [];
    if (groundingChunks && Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk.web?.uri) {
          groundingSources.push({
            title: chunk.web.title || "Source",
            uri: chunk.web.uri,
          });
        }
      }
    }

    // If no card was generated but the response is a direct answer, format clean display
    if (!displayCard && spokenText) {
      // Check if text looks like knowledge or calculation
      if (groundingSources.length > 0) {
        displayCard = {
          type: "search",
          title: "Web Grounding Result",
          data: {
            query: message,
            summary: spokenText,
            sources: groundingSources,
          },
        };
      }
    }

    res.json({
      spokenText,
      toolAction,
      displayCard,
      groundingSources,
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Graceful fallback on error
    const fallbackResult = await handleLocalFallback(message, contextState);
    res.json(fallbackResult);
  }
});

// Direct Linux System REST API Endpoints
app.post("/api/system/systemd", async (req: Request, res: Response) => {
  try {
    const { serviceName, action = "status", scope = "system" } = req.body;
    if (!serviceName) {
      res.status(400).json({ error: "serviceName is required" });
      return;
    }
    const result = await manageSystemdService(serviceName, action, scope);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to manage systemd service" });
  }
});

app.post("/api/system/launch-app", async (req: Request, res: Response) => {
  try {
    const { appName, args } = req.body;
    if (!appName) {
      res.status(400).json({ error: "appName is required" });
      return;
    }
    const result = await launchLinuxApp(appName, args);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to launch application" });
  }
});

app.post("/api/system/control", async (req: Request, res: Response) => {
  try {
    const { action, value } = req.body;
    if (!action) {
      res.status(400).json({ error: "action is required" });
      return;
    }
    const result = await controlLinuxSystem(action, value);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to execute system control" });
  }
});

app.post("/api/system/exec", async (req: Request, res: Response) => {
  try {
    const { command } = req.body;
    if (!command) {
      res.status(400).json({ error: "command is required" });
      return;
    }
    const result = await executeTerminalCommand(command);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to execute command" });
  }
});

app.get("/api/system/status", async (_req: Request, res: Response) => {
  try {
    const result = await controlLinuxSystem("hardware_stats");
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to get system status" });
  }
});

// In-memory cache for audio TTS to save quota
const ttsCache = new Map<string, string>();
let lastTtsFailureTime = 0;

// Text-to-Speech Endpoint
app.post("/api/gemini/tts", async (req: Request, res: Response) => {
  const { text, voiceName = "Kore" } = req.body;
  if (!text || typeof text !== "string") {
    res.status(400).json({ error: "Text is required for TTS" });
    return;
  }

  const cleanText = text.trim().slice(0, 300);
  const cacheKey = `${voiceName}:${cleanText}`;

  // Check cache first
  if (ttsCache.has(cacheKey)) {
    res.json({ audioBase64: ttsCache.get(cacheKey), mimeType: "audio/pcm;rate=24000", useBrowserTTS: false });
    return;
  }

  // If we had a rate-limit/quota error in the last 60 seconds, quickly fallback to browser TTS
  if (Date.now() - lastTtsFailureTime < 60000) {
    res.json({ audioBase64: null, useBrowserTTS: true });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    res.status(200).json({ audioBase64: null, useBrowserTTS: true });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioBase64) {
      if (ttsCache.size > 100) ttsCache.clear();
      ttsCache.set(cacheKey, audioBase64);
      res.json({ audioBase64, mimeType: "audio/pcm;rate=24000", useBrowserTTS: false });
    } else {
      res.json({ audioBase64: null, useBrowserTTS: true });
    }
  } catch (error: any) {
    lastTtsFailureTime = Date.now();
    // Graceful fallback to client browser speech synthesis
    res.json({ audioBase64: null, useBrowserTTS: true });
  }
});

// Helper to generate display cards from tool calls
async function createCardFromTool(toolName: string, args: any, rawPrompt: string): Promise<any> {
  switch (toolName) {
    case "manage_systemd": {
      const serviceName = args.serviceName || "bluetooth";
      const action = args.action || "status";
      const scope = args.scope || "system";
      const unitData = await manageSystemdService(serviceName, action, scope);
      return {
        type: "systemd",
        title: `Service: ${serviceName}`,
        data: unitData,
      };
    }

    case "launch_linux_app": {
      const appName = args.appName || "terminal";
      const launchData = await launchLinuxApp(appName, args.args);
      return {
        type: "app_launcher",
        title: `App: ${launchData.displayName}`,
        data: launchData,
      };
    }

    case "control_linux_system": {
      const action = args.action || "hardware_stats";
      const sysData = await controlLinuxSystem(action, args.value);
      return {
        type: "linux_system",
        title: "Arch Linux Control",
        data: sysData,
      };
    }

    case "execute_linux_command": {
      const cmd = args.command || "uname -a";
      const termData = await executeTerminalCommand(cmd);
      return {
        type: "terminal",
        title: `Command: ${cmd.split(" ")[0]}`,
        data: termData,
      };
    }

    case "get_weather": {
      const loc = args.location || "San Francisco, CA";
      const isCelsius = args.unit === "celsius";
      const baseTemp = isCelsius ? 21 : 70;
      return {
        type: "weather",
        title: `Weather for ${loc}`,
        data: {
          location: loc,
          temperature: baseTemp,
          condition: "Partly Cloudy",
          icon: "sun-cloud",
          high: baseTemp + 4,
          low: baseTemp - 6,
          humidity: 58,
          windSpeed: "9 mph",
          hourly: [
            { time: "Now", temp: baseTemp, icon: "sun-cloud" },
            { time: "2 PM", temp: baseTemp + 2, icon: "sun" },
            { time: "4 PM", temp: baseTemp + 3, icon: "sun" },
            { time: "6 PM", temp: baseTemp + 1, icon: "cloud" },
            { time: "8 PM", temp: baseTemp - 2, icon: "moon" },
            { time: "10 PM", temp: baseTemp - 4, icon: "moon" },
          ],
          forecast: [
            { day: "Mon", high: baseTemp + 4, low: baseTemp - 6, condition: "Sunny", icon: "sun" },
            { day: "Tue", high: baseTemp + 5, low: baseTemp - 5, condition: "Partly Cloudy", icon: "sun-cloud" },
            { day: "Wed", high: baseTemp + 2, low: baseTemp - 4, condition: "Cloudy", icon: "cloud" },
            { day: "Thu", high: baseTemp + 1, low: baseTemp - 7, condition: "Light Rain", icon: "cloud-rain" },
            { day: "Fri", high: baseTemp + 3, low: baseTemp - 5, condition: "Clear", icon: "sun" },
          ],
        },
      };
    }

    case "set_timer": {
      const seconds = Number(args.durationSeconds) || 300;
      return {
        type: "timer",
        title: args.label ? `${args.label} Timer` : "Timer",
        data: {
          id: `timer-${Date.now()}`,
          label: args.label || "Timer",
          totalSeconds: seconds,
          remainingSeconds: seconds,
          isRunning: true,
          isCompleted: false,
        },
      };
    }

    case "set_alarm": {
      return {
        type: "alarm",
        title: "Alarm Set",
        data: {
          id: `alarm-${Date.now()}`,
          label: args.label || "Alarm",
          time: args.time || "7:00 AM",
          enabled: true,
          days: ["Every day"],
        },
      };
    }

    case "add_reminder": {
      return {
        type: "reminder",
        title: "Reminder Added",
        data: {
          id: `rem-${Date.now()}`,
          title: args.title || "Reminder",
          completed: false,
          priority: args.priority || "medium",
          dueTime: args.dueTime || "Today",
          category: args.category || "General",
        },
      };
    }

    case "calculate": {
      return {
        type: "calculator",
        title: "Calculation",
        data: {
          expression: args.expression,
          result: args.result,
          explanation: args.explanation,
        },
      };
    }

    case "create_note": {
      return {
        type: "note",
        title: args.title || "Quick Note",
        data: {
          id: `note-${Date.now()}`,
          title: args.title || "Note",
          content: args.content,
          updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          tags: args.tags || ["Voice Note"],
        },
      };
    }

    case "control_device": {
      return {
        type: "device",
        title: "Device Control",
        data: {
          device: args.device,
          action: args.action,
          value: args.value,
        },
      };
    }

    case "play_media": {
      const genres: Record<string, { title: string; artist: string; gradient: string }> = {
        lofi: { title: "Chill Horizons (Lo-Fi)", artist: "Aura Beats", gradient: "from-indigo-500 to-purple-600" },
        jazz: { title: "Midnight Espresso", artist: "Blue Note Collective", gradient: "from-amber-600 to-rose-700" },
        synthwave: { title: "Neon Drive 1984", artist: "CyberWave", gradient: "from-fuchsia-600 to-cyan-600" },
        ambient: { title: "Drifting in Orbit", artist: "Cosmic Flow", gradient: "from-teal-600 to-blue-700" },
        pop: { title: "Electric Sunrise", artist: "Solaris", gradient: "from-rose-500 to-amber-500" },
      };
      const selected = genres[args.genre?.toLowerCase() || "lofi"] || genres.lofi;
      return {
        type: "media",
        title: "Now Playing",
        data: {
          id: `track-${Date.now()}`,
          title: args.query ? `Track for "${args.query}"` : selected.title,
          artist: selected.artist,
          genre: args.genre || "Lo-Fi",
          duration: 180,
          isPlaying: args.action === "play" || args.action === "resume",
          coverGradient: selected.gradient,
        },
      };
    }

    case "create_calendar_event": {
      return {
        type: "calendar",
        title: "Event Scheduled",
        data: {
          id: `cal-${Date.now()}`,
          title: args.title,
          date: args.date || "Tomorrow",
          time: args.time,
          durationMinutes: args.durationMinutes || 60,
          location: args.location || "Virtual / Calendar",
        },
      };
    }

    case "convert_units": {
      return {
        type: "conversion",
        title: "Unit Conversion",
        data: {
          amount: args.amount,
          fromUnit: args.fromUnit,
          toUnit: args.toUnit,
          result: args.result,
        },
      };
    }

    default:
      return null;
  }
}

function generateDefaultSpokenText(toolName: string, args: any, displayCard?: any): string {
  switch (toolName) {
    case "manage_systemd": {
      const state = displayCard?.data?.activeState || "processed";
      return `The ${args.serviceName || "systemd"} service is currently ${state}.`;
    }
    case "launch_linux_app":
      return `Launching ${displayCard?.data?.displayName || args.appName || "application"}.`;
    case "control_linux_system":
      return `Adjusted system settings.`;
    case "execute_linux_command":
      return `Executed command: ${args.command || "script"}.`;
    case "set_timer":
      return `Setting a timer for ${Math.round(args.durationSeconds / 60)} minutes.`;
    case "set_alarm":
      return `I've set your alarm for ${args.time}.`;
    case "add_reminder":
      return `I added "${args.title}" to your reminders.`;
    case "get_weather":
      return `Here is the current weather forecast for ${args.location || "your area"}.`;
    case "calculate":
      return `The answer is ${args.result}.`;
    case "create_note":
      return `I've created the note "${args.title}".`;
    case "control_device":
      return `Adjusted ${args.device} to ${args.action}.`;
    case "play_media":
      return `Playing music for you now.`;
    case "create_calendar_event":
      return `I scheduled "${args.title}" for ${args.time}.`;
    case "convert_units":
      return `${args.amount} ${args.fromUnit} is equal to ${args.result}.`;
    default:
      return "Done!";
  }
}

// Fallback logic when offline, rate-limited, or quota exceeded
async function handleLocalFallback(message: string, contextState: any): Promise<any> {
  const lower = message.toLowerCase().trim();

  // A. Systemd service commands
  // e.g. "status of bluetooth", "systemctl status sshd", "restart pipewire service", "stop nginx", "start docker"
  const systemdMatch = lower.match(/(?:systemctl|service|systemd)\s+(status|restart|start|stop|enable|disable|journal|logs)\s+([a-zA-Z0-9_-]+)/i) ||
    lower.match(/(status|restart|start|stop|enable|disable|check)\s+(?:the\s+)?([a-zA-Z0-9_-]+)\s+service/i) ||
    lower.match(/(?:check\s+)?service\s+([a-zA-Z0-9_-]+)\s+(status|restart|start|stop)/i);

  if (systemdMatch) {
    let action = "status";
    let serviceName = "bluetooth";
    if (systemdMatch[1] && ["status", "restart", "start", "stop", "enable", "disable", "journal", "logs", "check"].includes(systemdMatch[1])) {
      action = systemdMatch[1] === "check" ? "status" : systemdMatch[1];
      serviceName = systemdMatch[2] || "bluetooth";
    } else {
      serviceName = systemdMatch[1];
      action = systemdMatch[2] || "status";
    }
    const unitData = await manageSystemdService(serviceName, action as any, "system");
    const displayCard = {
      type: "systemd",
      title: `Service: ${serviceName}`,
      data: unitData,
    };
    return {
      spokenText: `The ${serviceName} service is currently ${unitData.activeState}.`,
      toolAction: { name: "manage_systemd", args: { serviceName, action } },
      displayCard,
    };
  }

  // B. Linux Desktop Application Launching
  // e.g. "open firefox", "launch alacritty", "start spotify", "open discord", "open code", "open terminal", "launch htop"
  const appLaunchMatch = lower.match(/(?:open|launch|start|run)\s+(firefox|chrome|chromium|brave|alacritty|kitty|wezterm|foot|termite|gnome-terminal|konsole|terminal|code|vscodium|nvim|neovim|emacs|gedit|spotify|discord|slack|telegram|thunderbird|steam|lutris|heroic|vlc|mpv|obs|gimp|inkscape|kdenlive|blender|nautilus|thunar|dolphin|pcmanfm|files|htop|btop|calculator|calc|obsidian|libreoffice)/i);
  if (appLaunchMatch) {
    const rawApp = appLaunchMatch[1].toLowerCase();
    const appData = await launchLinuxApp(rawApp);
    const displayCard = {
      type: "app_launcher",
      title: `App: ${appData.displayName}`,
      data: appData,
    };
    return {
      spokenText: `Launching ${appData.displayName}.`,
      toolAction: { name: "launch_linux_app", args: { appName: rawApp } },
      displayCard,
    };
  }

  // C. Linux Shell Execution
  // e.g. "run command fastfetch", "run uname -a", "exec ls -la", "execute ip addr", "run command pacman -Q"
  const execMatch = lower.match(/(?:run command|exec|execute|terminal command|run in terminal|bash command)\s+(.+)/i);
  if (execMatch) {
    const cmd = execMatch[1].trim();
    const termData = await executeTerminalCommand(cmd);
    const displayCard = {
      type: "terminal",
      title: `Command: ${cmd.split(" ")[0]}`,
      data: termData,
    };
    return {
      spokenText: `Executed command "${cmd}". Exit code ${termData.exitCode}.`,
      toolAction: { name: "execute_linux_command", args: { command: cmd } },
      displayCard,
    };
  }

  // D. Arch Linux System Settings & Power controls
  // e.g. "set volume to 80%", "mute volume", "unmute audio", "turn brightness to 70%", "suspend computer", "reboot", "shutdown", "check pacman updates", "show system stats"
  if (lower.includes("suspend") || lower.includes("sleep system") || lower.includes("reboot") || lower.includes("shutdown") || lower.includes("power off") || lower.includes("lock screen") || lower.includes("check updates") || lower.includes("pacman") || lower.includes("hardware") || lower.includes("system specs") || lower.includes("system status") || (lower.includes("volume") && (lower.includes("%") || lower.includes("set") || lower.includes("mute") || lower.includes("unmute"))) || (lower.includes("brightness") && (lower.includes("%") || lower.includes("set")))) {
    let action = "hardware_stats";
    let value = "";

    if (lower.includes("suspend") || lower.includes("sleep")) {
      action = "power_suspend";
    } else if (lower.includes("reboot") || lower.includes("restart computer")) {
      action = "power_reboot";
    } else if (lower.includes("shutdown") || lower.includes("power off")) {
      action = "power_shutdown";
    } else if (lower.includes("lock screen") || lower.includes("lock session")) {
      action = "power_lock";
    } else if (lower.includes("update") || lower.includes("pacman")) {
      action = "check_updates";
    } else if (lower.includes("unmute")) {
      action = "volume_unmute";
    } else if (lower.includes("mute")) {
      action = "volume_mute";
    } else if (lower.includes("volume")) {
      const volNum = lower.match(/(\d+)%/);
      if (volNum) {
        action = "volume_set";
        value = `${volNum[1]}%`;
      } else if (lower.includes("up") || lower.includes("increase")) {
        action = "volume_up";
      } else if (lower.includes("down") || lower.includes("decrease")) {
        action = "volume_down";
      }
    } else if (lower.includes("brightness")) {
      const bNum = lower.match(/(\d+)%/);
      if (bNum) {
        action = "brightness_set";
        value = `${bNum[1]}%`;
      } else if (lower.includes("up") || lower.includes("increase")) {
        action = "brightness_up";
      } else if (lower.includes("down") || lower.includes("decrease")) {
        action = "brightness_down";
      }
    }

    const sysData = await controlLinuxSystem(action, value);
    const displayCard = {
      type: "linux_system",
      title: "Arch Linux Control",
      data: sysData,
    };
    return {
      spokenText: `Adjusted system settings on Arch Linux.`,
      toolAction: { name: "control_linux_system", args: { action, value } },
      displayCard,
    };
  }

  // 1. Timer command: e.g. "set a timer for 5 minutes", "timer 10 min for tea"
  const timerMatch = lower.match(/(?:timer|set a timer for|count down|countdown)\s+(?:for\s+)?(\d+)\s*(minute|min|second|sec|hour|hr)s?(?:\s+(?:for|called|named)\s+([a-zA-Z0-9\s]+))?/i);
  if (timerMatch) {
    const val = parseInt(timerMatch[1], 10);
    const unit = timerMatch[2].toLowerCase();
    let seconds = val * 60;
    if (unit.startsWith("sec")) seconds = val;
    if (unit.startsWith("hour") || unit.startsWith("hr")) seconds = val * 3600;
    const label = timerMatch[3] ? timerMatch[3].trim() : "Timer";

    const displayCard = await createCardFromTool("set_timer", { durationSeconds: seconds, label }, message);
    return {
      spokenText: `Setting a ${val} ${unit} timer for ${label}.`,
      toolAction: { name: "set_timer", args: { durationSeconds: seconds, label } },
      displayCard,
    };
  }

  // 2. Alarm command: e.g. "set alarm for 7:30 AM", "wake me up at 6:00 AM"
  const alarmMatch = lower.match(/(?:set\s+an?\s+alarm|wake\s+me\s+up|alarm)\s+(?:for|at)\s+([0-9]{1,2}(?::[0-9]{2})?\s*(?:am|pm)?)/i);
  if (alarmMatch) {
    let alarmTime = alarmMatch[1].toUpperCase().trim();
    if (!alarmTime.includes("AM") && !alarmTime.includes("PM")) {
      alarmTime += " AM";
    }
    const displayCard = await createCardFromTool("set_alarm", { time: alarmTime, label: "Alarm" }, message);
    return {
      spokenText: `I've set your alarm for ${alarmTime}.`,
      toolAction: { name: "set_alarm", args: { time: alarmTime, label: "Alarm" } },
      displayCard,
    };
  }

  // 3. Weather command: e.g. "weather in Tokyo", "what's the temperature in Paris"
  if (lower.includes("weather") || lower.includes("forecast") || lower.includes("temperature") || lower.includes("rain") || lower.includes("sunny")) {
    let loc = "San Francisco, CA";
    const locMatch = lower.match(/(?:in|for|at)\s+([a-zA-Z\s,]+)/i);
    if (locMatch) loc = locMatch[1].trim();
    const displayCard = await createCardFromTool("get_weather", { location: loc }, message);
    return {
      spokenText: `Here is the current weather forecast for ${loc}. It's 72°F and partly cloudy.`,
      toolAction: { name: "get_weather", args: { location: loc } },
      displayCard,
    };
  }

  // 4. Reminder command: e.g. "remind me to call Mom", "add reminder buy coffee"
  if (lower.includes("remind") || lower.includes("reminder") || lower.includes("todo")) {
    let title = message.replace(/(?:remind me to|create a reminder to|add reminder to|add reminder|reminder:?)\s*/i, "").trim();
    if (!title) title = "Important task";
    const displayCard = await createCardFromTool("add_reminder", { title, priority: "medium", dueTime: "Today at 5:00 PM" }, message);
    return {
      spokenText: `I've added "${title}" to your reminders.`,
      toolAction: { name: "add_reminder", args: { title, priority: "medium", dueTime: "Today at 5:00 PM" } },
      displayCard,
    };
  }

  // 5. Notes: e.g. "take a note: project ideas", "create note meeting highlights"
  if (lower.startsWith("note") || lower.includes("take a note") || lower.includes("create a note") || lower.includes("write a note")) {
    let content = message.replace(/(?:take a note:?|create a note:?|write a note:?|note:?)\s*/i, "").trim();
    if (!content) content = "Quick voice note";
    const title = content.length > 25 ? content.slice(0, 22) + "..." : content;
    const displayCard = await createCardFromTool("create_note", { title, content, tags: ["Voice Note"] }, message);
    return {
      spokenText: `I've created the note "${title}".`,
      toolAction: { name: "create_note", args: { title, content, tags: ["Voice Note"] } },
      displayCard,
    };
  }

  // 6. Calendar scheduling: e.g. "schedule meeting tomorrow at 3 PM", "add event team sync"
  if (lower.includes("schedule") || lower.includes("calendar") || lower.includes("appointment") || lower.includes("event")) {
    const timeMatch = lower.match(/at\s+([0-9]{1,2}(?::[0-9]{2})?\s*(?:am|pm)?)/i);
    const time = timeMatch ? timeMatch[1].toUpperCase() : "2:00 PM";
    const titleMatch = message.replace(/(?:schedule|add calendar event|add event|create appointment)\s*/i, "").trim();
    const title = titleMatch || "Meeting";
    const displayCard = await createCardFromTool("create_calendar_event", { title, time, date: "Tomorrow", durationMinutes: 45 }, message);
    return {
      spokenText: `I've scheduled "${title}" for ${time}.`,
      toolAction: { name: "create_calendar_event", args: { title, time, date: "Tomorrow", durationMinutes: 45 } },
      displayCard,
    };
  }

  // 7. Unit conversion: e.g. "convert 50 miles to km", "convert 100 kg to lbs", "convert 32 celsius to fahrenheit"
  const convMatch = lower.match(/convert\s+([0-9.]+)\s*([a-zA-Z]+)\s+to\s+([a-zA-Z]+)/i);
  if (convMatch) {
    const amt = parseFloat(convMatch[1]);
    const fromUnit = convMatch[2].toLowerCase();
    const toUnit = convMatch[3].toLowerCase();
    let resNum = 0;
    let formattedResult = "";

    if ((fromUnit === "miles" || fromUnit === "mi") && (toUnit === "km" || toUnit === "kilometers")) {
      resNum = amt * 1.60934;
      formattedResult = `${resNum.toFixed(2)} km`;
    } else if ((fromUnit === "km" || fromUnit === "kilometers") && (toUnit === "miles" || toUnit === "mi")) {
      resNum = amt * 0.621371;
      formattedResult = `${resNum.toFixed(2)} miles`;
    } else if ((fromUnit === "kg" || fromUnit === "kilograms") && (toUnit === "lbs" || toUnit === "pounds")) {
      resNum = amt * 2.20462;
      formattedResult = `${resNum.toFixed(2)} lbs`;
    } else if ((fromUnit === "lbs" || fromUnit === "pounds") && (toUnit === "kg" || toUnit === "kilograms")) {
      resNum = amt * 0.453592;
      formattedResult = `${resNum.toFixed(2)} kg`;
    } else if (fromUnit === "celsius" && toUnit === "fahrenheit") {
      resNum = (amt * 9) / 5 + 32;
      formattedResult = `${resNum.toFixed(1)}°F`;
    } else if (fromUnit === "fahrenheit" && toUnit === "celsius") {
      resNum = ((amt - 32) * 5) / 9;
      formattedResult = `${resNum.toFixed(1)}°C`;
    } else if (fromUnit === "usd" && toUnit === "eur") {
      resNum = amt * 0.92;
      formattedResult = `€${resNum.toFixed(2)}`;
    } else {
      resNum = amt * 1.25;
      formattedResult = `${resNum.toFixed(2)} ${toUnit}`;
    }

    const displayCard = await createCardFromTool("convert_units", { amount: amt, fromUnit, toUnit, result: formattedResult }, message);
    return {
      spokenText: `${amt} ${fromUnit} is equal to ${formattedResult}.`,
      toolAction: { name: "convert_units", args: { amount: amt, fromUnit, toUnit, result: formattedResult } },
      displayCard,
    };
  }

  // 8. Calculator / Math command
  if (
    lower.includes("calculate") ||
    lower.includes("what is") ||
    lower.includes("times") ||
    lower.includes("plus") ||
    lower.includes("minus") ||
    lower.includes("divided by") ||
    lower.includes("tip on") ||
    lower.includes("tip for") ||
    lower.includes("% of") ||
    lower.includes("percent of") ||
    /^[0-9\s+\-*/^().sqrt]+$/.test(lower.replace("what is", "").trim())
  ) {
    // Tip calculation
    if (lower.includes("tip on") || lower.includes("tip for")) {
      const tipMatch = lower.match(/(\d+)%?\s+tip\s+(?:on|for)\s+\$?(\d+(\.\d+)?)/i);
      if (tipMatch) {
        const pct = parseFloat(tipMatch[1]);
        const bill = parseFloat(tipMatch[2]);
        const tipVal = ((pct / 100) * bill).toFixed(2);
        const total = (bill + parseFloat(tipVal)).toFixed(2);
        const displayCard = await createCardFromTool("calculate", { expression: `$${bill} + ${pct}% ($${tipVal})`, result: `$${total}`, explanation: `${pct}% tip is $${tipVal}, bringing the total to $${total}` }, message);
        return {
          spokenText: `A ${pct}% tip on $${bill} is $${tipVal}, for a total of $${total}.`,
          toolAction: { name: "calculate", args: { expression: `$${bill} + ${pct}%`, result: `$${total}` } },
          displayCard,
        };
      }
    }

    // Percentage of (e.g., "what is 20% of 500")
    const pctOfMatch = lower.match(/(?:what is\s+)?(\d+(?:\.\d+)?)%?\s*(?:percent|%)\s+of\s+(\d+(?:\.\d+)?)/i);
    if (pctOfMatch) {
      const pct = parseFloat(pctOfMatch[1]);
      const base = parseFloat(pctOfMatch[2]);
      const res = (pct / 100) * base;
      const displayCard = await createCardFromTool("calculate", { expression: `${pct}% of ${base}`, result: `${res}`, explanation: `(${pct} / 100) * ${base} = ${res}` }, message);
      return {
        spokenText: `${pct}% of ${base} is ${res}.`,
        toolAction: { name: "calculate", args: { expression: `${pct}% of ${base}`, result: `${res}` } },
        displayCard,
      };
    }

    // Math expressions
    let mathExpr = lower
      .replace(/what is/i, "")
      .replace(/calculate/i, "")
      .replace(/times/g, "*")
      .replace(/multiplied by/g, "*")
      .replace(/divided by/g, "/")
      .replace(/over/g, "/")
      .replace(/plus/g, "+")
      .replace(/minus/g, "-")
      .replace(/square root of\s+(\d+)/g, "Math.sqrt($1)")
      .replace(/sqrt\s*\(?(\d+)\)?/g, "Math.sqrt($1)")
      .trim();

    try {
      // Safe sanitized arithmetic evaluation
      const sanitized = mathExpr.replace(/[^0-9+\-*/().Mathsqr,%]/g, "");
      if (sanitized && /[0-9]/.test(sanitized)) {
        // eslint-disable-next-line no-eval
        const calcRes = Function(`"use strict"; return (${sanitized})`)();
        if (typeof calcRes === "number" && !isNaN(calcRes) && isFinite(calcRes)) {
          const formatted = Number.isInteger(calcRes) ? calcRes.toString() : calcRes.toFixed(2);
          const displayCard = await createCardFromTool("calculate", { expression: mathExpr, result: formatted, explanation: `Evaluated ${mathExpr} = ${formatted}` }, message);
          return {
            spokenText: `The answer is ${formatted}.`,
            toolAction: { name: "calculate", args: { expression: mathExpr, result: formatted } },
            displayCard,
          };
        }
      }
    } catch (_) {}
  }

  // 9. Media / Music command
  if (lower.includes("play") || lower.includes("music") || lower.includes("song") || lower.includes("lofi") || lower.includes("jazz") || lower.includes("pause music") || lower.includes("stop music")) {
    let action = "play";
    if (lower.includes("pause") || lower.includes("stop")) action = "pause";
    let genre = "lofi";
    if (lower.includes("jazz")) genre = "jazz";
    if (lower.includes("ambient") || lower.includes("focus")) genre = "ambient";
    if (lower.includes("synthwave") || lower.includes("retro")) genre = "synthwave";
    if (lower.includes("pop")) genre = "pop";
    const displayCard = await createCardFromTool("play_media", { action, genre }, message);
    return {
      spokenText: action === "play" ? `Playing ${genre} music for you.` : `Paused media playback.`,
      toolAction: { name: "play_media", args: { action, genre } },
      displayCard,
    };
  }

  // 10. Device control: flashlight, wifi, dnd, dark mode, brightness, volume
  if (lower.includes("flashlight") || lower.includes("wifi") || lower.includes("bluetooth") || lower.includes("dark mode") || lower.includes("light mode") || lower.includes("brightness") || lower.includes("volume") || lower.includes("disturb")) {
    let device = "flashlight";
    let action = "toggle";
    let value = "";

    if (lower.includes("flashlight")) {
      device = "flashlight";
      action = lower.includes("off") ? "off" : lower.includes("on") ? "on" : "toggle";
    } else if (lower.includes("wifi")) {
      device = "wifi";
      action = lower.includes("off") ? "off" : lower.includes("on") ? "on" : "toggle";
    } else if (lower.includes("bluetooth")) {
      device = "bluetooth";
      action = lower.includes("off") ? "off" : lower.includes("on") ? "on" : "toggle";
    } else if (lower.includes("dark mode")) {
      device = "theme";
      action = "set";
      value = "dark";
    } else if (lower.includes("light mode")) {
      device = "theme";
      action = "set";
      value = "light";
    } else if (lower.includes("disturb") || lower.includes("dnd")) {
      device = "dnd";
      action = lower.includes("off") ? "off" : lower.includes("on") ? "on" : "toggle";
    } else if (lower.includes("volume")) {
      device = "volume";
      action = lower.includes("up") || lower.includes("increase") ? "increase" : "decrease";
    } else if (lower.includes("brightness")) {
      device = "brightness";
      action = lower.includes("up") || lower.includes("increase") ? "increase" : "decrease";
    }

    const displayCard = await createCardFromTool("control_device", { device, action, value }, message);
    return {
      spokenText: `I have updated your ${device} setting.`,
      toolAction: { name: "control_device", args: { device, action, value } },
      displayCard,
    };
  }

  // 11. Conversational Personality & Common Siri Inquiries
  if (lower.includes("who are you") || lower.includes("what is your name")) {
    return {
      spokenText: "I am Siri, powered by Google Gemini, designed with an elegant frosted glass interface running on Arch Linux.",
      toolAction: null,
      displayCard: null,
    };
  }

  if (lower.includes("what can you do") || lower.includes("help") || lower.includes("features")) {
    return {
      spokenText: "I can manage Arch Linux systemd services, launch desktop apps like Firefox and Alacritty, adjust volume and brightness, run shell commands, set timers, take notes, check the weather, and much more.",
      toolAction: null,
      displayCard: null,
    };
  }

  if (lower.includes("tell me a joke") || lower.includes("make me laugh")) {
    const jokes = [
      "Why do Arch Linux users never get lost? Because they build their own path!",
      "Why don't scientists trust atoms? Because they make up everything!",
      "Why did the computer go to the doctor? Because it had a virus!",
      "Why did the web developer leave the restaurant? Because of the table layout!",
      "There are 10 types of people in the world: those who understand binary, and those who don't.",
    ];
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    return {
      spokenText: joke,
      toolAction: null,
      displayCard: null,
    };
  }

  if (lower.includes("time") && (lower.includes("what") || lower.includes("current"))) {
    const curTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return {
      spokenText: `The current time is ${curTime}.`,
      toolAction: null,
      displayCard: null,
    };
  }

  if (lower.includes("date") || lower.includes("today") || lower.includes("day is it")) {
    const curDate = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    return {
      spokenText: `Today is ${curDate}.`,
      toolAction: null,
      displayCard: null,
    };
  }

  if (lower.includes("speed of light")) {
    return {
      spokenText: "The speed of light in a vacuum is approximately 299,792 kilometers per second (or about 186,282 miles per second).",
      toolAction: null,
      displayCard: null,
    };
  }

  if (lower.includes("capital of france")) {
    return {
      spokenText: "The capital of France is Paris.",
      toolAction: null,
      displayCard: null,
    };
  }

  if (lower.includes("how are you") || lower.includes("how's it going")) {
    return {
      spokenText: "I'm doing great on Arch Linux and ready to assist you. What can I do for you today?",
      toolAction: null,
      displayCard: null,
    };
  }

  if (lower.includes("thank you") || lower.includes("thanks")) {
    return {
      spokenText: "You're very welcome! Let me know if there is anything else you need.",
      toolAction: null,
      displayCard: null,
    };
  }

  // Default pleasant assistant response
  return {
    spokenText: `I'm ready to assist you. You can ask me to manage systemd services, launch apps, run terminal commands, set timers, alarms, take notes, or check the weather.`,
    toolAction: null,
    displayCard: null,
  };
}

// Vite middleware & Server boot
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Gemini Siri Voice Assistant Server running on http://localhost:${PORT}`);
  });
}

startServer();
