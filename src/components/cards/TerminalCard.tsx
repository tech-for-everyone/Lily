import React, { useState } from "react";
import { TerminalCommandData } from "../../types";
import { Terminal, Copy, Check, Clock, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface TerminalCardProps {
  data: TerminalCommandData;
}

export const TerminalCard: React.FC<TerminalCardProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `${data.command}\n\n${data.stdout || data.stderr}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSuccess = data.exitCode === 0;

  return (
    <motion.div
      id="terminal-output-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-[#070b14]/90 border border-white/15 backdrop-blur-2xl rounded-3xl p-5 text-white shadow-2xl overflow-hidden font-mono"
    >
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-white/60 ml-1 text-[11px] font-sans font-medium flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-cyan-300" /> Arch Shell
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] ${
              isSuccess
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
            }`}
          >
            exit {data.exitCode}
          </span>
          <button
            id="copy-terminal-output-btn"
            onClick={handleCopy}
            className="p-1 rounded bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all"
            title="Copy command & output"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Command Line */}
      <div className="bg-black/50 rounded-xl p-2.5 border border-white/5 mb-3 flex items-center gap-2 text-xs">
        <span className="text-emerald-400 font-bold">$</span>
        <span className="text-cyan-200 font-semibold truncate select-all">{data.command}</span>
      </div>

      {/* Terminal Output */}
      <div className="bg-black/60 rounded-xl p-3 border border-white/5 max-h-48 overflow-y-auto text-[11px] leading-relaxed select-text space-y-1">
        {data.stdout && (
          <pre className="text-emerald-300/90 whitespace-pre-wrap break-all font-mono">
            {data.stdout}
          </pre>
        )}
        {data.stderr && (
          <pre className="text-rose-300/90 whitespace-pre-wrap break-all font-mono">
            {data.stderr}
          </pre>
        )}
        {!data.stdout && !data.stderr && (
          <span className="text-white/40 italic">(No output returned)</span>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-white/5 text-[10px] text-white/40">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {data.durationMs}ms
        </span>
        <span>{data.executedAt}</span>
      </div>
    </motion.div>
  );
};
