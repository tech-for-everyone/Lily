export type AssistantStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface ToolAction {
  name: string;
  args: Record<string, any>;
  result?: any;
}

export type CardType = 
  | 'weather' 
  | 'timer' 
  | 'alarm' 
  | 'reminder' 
  | 'note' 
  | 'calculator' 
  | 'device' 
  | 'media' 
  | 'calendar' 
  | 'message' 
  | 'conversion' 
  | 'search';

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  high: number;
  low: number;
  humidity: number;
  windSpeed: string;
  hourly: Array<{ time: string; temp: number; icon: string }>;
  forecast: Array<{ day: string; high: number; low: number; condition: string; icon: string }>;
}

export interface TimerItem {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isCompleted: boolean;
}

export interface AlarmItem {
  id: string;
  label: string;
  time: string; // "07:30 AM"
  enabled: boolean;
  days?: string[];
}

export interface ReminderItem {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueTime?: string;
  category?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  tags?: string[];
}

export interface DeviceState {
  flashlight: boolean;
  wifi: boolean;
  bluetooth: boolean;
  dnd: boolean;
  theme: 'dark' | 'light';
  volume: number; // 0 - 100
  brightness: number; // 0 - 100
}

export interface MediaTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number; // seconds
  isPlaying: boolean;
  coverGradient: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  durationMinutes: number;
  location?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface DisplayCard {
  type: CardType;
  title?: string;
  data: any;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  card?: DisplayCard;
  groundingSources?: GroundingSource[];
  audioBase64?: string;
  isError?: boolean;
}

export interface VoiceSettings {
  ttsProvider: 'gemini' | 'browser';
  geminiVoice: 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'Charon';
  browserVoiceURI?: string;
  speechRate: number; // 0.8 - 1.4
  speechPitch: number; // 0.8 - 1.3
  sfxEnabled: boolean;
  continuousListening: boolean;
  wakeWordEnabled: boolean;
  ambientGlowTheme: 'siri-classic' | 'neon-aurora' | 'cyber-purple' | 'cosmic-amber' | 'emerald-zen';
  autoSpeakResponse: boolean;
}
