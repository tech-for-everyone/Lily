import { Sparkles } from "lucide-react";

interface QuickPromptPillsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export const QuickPromptPills = ({ onSelect, disabled }: QuickPromptPillsProps) => {
  const suggestions = [
    { label: "Check Bluetooth", text: "Check status of bluetooth service" },
    { label: "Open Firefox", text: "Launch Firefox" },
    { label: "Terminal Fastfetch", text: "Run command fastfetch" },
    { label: "Volume 80%", text: "Set volume to 80%" },
    { label: "Restart Pipewire", text: "Restart pipewire service" },
    { label: "System Specs", text: "Show system stats" },
    { label: "5-min Timer", text: "Set a 5-minute timer for Coffee" },
    { label: "Tokyo Weather", text: "What's the weather in Tokyo right now?" },
  ];

  return (
    <div className="w-full max-w-2xl px-2">
      <div className="flex items-center gap-1.5 justify-center mb-2.5 text-[11px] font-medium text-white/50">
        <Sparkles className="w-3 h-3 text-cyan-400" />
        <span>Suggested voice commands</span>
      </div>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {suggestions.map((s, i) => (
          <button
            key={i}
            id={`prompt-pill-${i}`}
            disabled={disabled}
            onClick={() => onSelect(s.text)}
            className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-xs text-white/70 hover:text-white backdrop-blur-md transition-all disabled:opacity-40 whitespace-nowrap shadow-sm hover:border-white/20"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};
