import { Globe, ExternalLink, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface SearchCardProps {
  key?: string;
  data: {
    query: string;
    summary: string;
    sources?: Array<{ title: string; uri: string }>;
  };
}

export const SearchCard = ({ data }: SearchCardProps) => {
  return (
    <motion.div
      id="search-grounding-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/[0.08] transition-all rounded-3xl p-6 text-white shadow-2xl"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center backdrop-blur-md">
            <Globe className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm sm:text-base tracking-wide text-white/90">Web Grounded Answer</span>
        </div>
        <span className="flex items-center gap-1 text-[11px] px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/80 backdrop-blur-md">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Real-time
        </span>
      </div>

      <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-3 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        {data.summary}
      </p>

      {data.sources && data.sources.length > 0 && (
        <div>
          <span className="text-[11px] font-medium text-white/50 block mb-2">Verified Sources:</span>
          <div className="flex flex-wrap gap-2">
            {data.sources.slice(0, 3).map((s, i) => (
              <a
                key={i}
                href={s.uri}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-cyan-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-all backdrop-blur-md truncate max-w-xs"
              >
                <ExternalLink className="w-3 h-3 shrink-0" />
                <span className="truncate">{s.title || "Web Link"}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
