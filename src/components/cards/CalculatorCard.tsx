import { Calculator as CalcIcon, Equal, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface CalculatorCardProps {
  key?: string;
  data: {
    expression: string;
    result: string;
    explanation?: string;
  };
}

export const CalculatorCard = ({ data }: CalculatorCardProps) => {
  return (
    <motion.div
      id="calc-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/[0.08] transition-all rounded-3xl p-6 text-white shadow-2xl"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center backdrop-blur-md">
            <CalcIcon className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm sm:text-base tracking-wide text-white/90">Calculation</span>
        </div>
        <span className="text-xs font-mono text-cyan-300/80 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">{data.expression}</span>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-baseline justify-between my-3 backdrop-blur-md">
        <span className="text-white/50 text-xs flex items-center gap-1">
          <Equal className="w-3.5 h-3.5" /> Result
        </span>
        <span className="text-4xl sm:text-5xl font-light font-mono text-cyan-300 tracking-tight">
          {data.result}
        </span>
      </div>

      {data.explanation && (
        <div className="flex items-start gap-2 mt-3 text-xs text-white/70">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
          <span>{data.explanation}</span>
        </div>
      )}
    </motion.div>
  );
};

