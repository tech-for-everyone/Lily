import { Sparkles } from "lucide-react";

interface QuickPromptPillsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export const QuickPromptPills = ({ onSelect, disabled }: QuickPromptPillsProps) => {
  const suggestions = [
    { label: "Pasta Timer", text: "Set a 5-minute timer for Pasta" },
    { label: "Tokyo Weather", text: "What's the weather in Tokyo right now?" },
    { label: "Remind Me", text: "Remind me to call Mom at 6 PM" },
    { label: "Calculate Tip", text: "Calculate 18% tip on an $85.40 bill" },
    { label: "Play Lo-Fi", text: "Play chill lofi beats" },
    { label: "Flashlight", text: "Turn on the flashlight" },
    { label: "Quick Memo", text: "Note: Finish presentation slides by Friday" },
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
