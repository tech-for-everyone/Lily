import { NoteItem } from "../../types";
import { StickyNote, Copy, Check } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

interface NoteCardProps {
  key?: string;
  note: NoteItem;
}

export const NoteCard = ({ note }: NoteCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      id={`note-card-${note.id}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/[0.08] transition-all rounded-3xl p-6 text-white shadow-2xl"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center backdrop-blur-md">
            <StickyNote className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm sm:text-base tracking-wide text-white/90">{note.title}</span>
        </div>
        <button
          id={`btn-copy-note-${note.id}`}
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-white/70 hover:text-white px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all backdrop-blur-md"
          title="Copy note content"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      <p className="text-xs sm:text-sm text-white/80 leading-relaxed my-2 whitespace-pre-wrap bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        {note.content}
      </p>

      <div className="flex items-center justify-between mt-3 text-[11px] text-white/50">
        <div className="flex items-center gap-1.5">
          {note.tags?.map((tag, i) => (
            <span key={i} className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/80 text-[10px]">
              #{tag}
            </span>
          ))}
        </div>
        <span>{note.updatedAt}</span>
      </div>
    </motion.div>
  );
};
