import React, { useState } from "react";
import { SystemdUnitData } from "../../types";
import { Cpu, RefreshCw, Play, Square, CheckCircle, AlertTriangle, Terminal, Layers } from "lucide-react";
import { motion } from "motion/react";

interface SystemdCardProps {
  data: SystemdUnitData;
}

export const SystemdCard: React.FC<SystemdCardProps> = ({ data }) => {
  const [unit, setUnit] = useState<SystemdUnitData>(data);
  const [isLoading, setIsLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const handleAction = async (action: "status" | "restart" | "start" | "stop") => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/system/systemd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName: unit.serviceName,
          action,
          scope: unit.scope,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setUnit(result);
      }
    } catch (err) {
      console.error("Systemd action error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = unit.activeState === "active";
  const isFailed = unit.activeState === "failed";

  return (
    <motion.div
      id={`systemd-card-${unit.serviceName.replace(/[^a-zA-Z0-9]/g, "-")}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/[0.08] transition-all rounded-3xl p-5 text-white shadow-2xl relative overflow-hidden"
    >
      {/* Background Accent Glow */}
      <div
        className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isActive ? "bg-emerald-400" : isFailed ? "bg-rose-500" : "bg-blue-400"
        }`}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center backdrop-blur-md">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold tracking-tight text-white">
                {unit.serviceName}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 uppercase font-mono">
                {unit.scope}
              </span>
            </div>
            <p className="text-[11px] text-white/50 truncate max-w-[200px]">
              {unit.description || "Systemd Service Unit"}
            </p>
          </div>
        </div>

        {/* State Badge */}
        <div
          className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full border backdrop-blur-md ${
            isActive
              ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-300"
              : isFailed
              ? "bg-rose-500/15 border-rose-400/30 text-rose-300"
              : "bg-white/10 border-white/20 text-white/70"
          }`}
        >
          {isActive ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          ) : isFailed ? (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-white/50" />
          )}
          <span>{unit.activeState}</span>
        </div>
      </div>

      {/* Unit Meta Info */}
      <div className="grid grid-cols-2 gap-2 bg-black/20 rounded-2xl p-3 border border-white/5 text-xs mb-4">
        <div>
          <span className="text-white/40 block text-[10px]">SUBSTATE</span>
          <span className="font-mono text-white/90">{unit.subState || "running"}</span>
        </div>
        <div>
          <span className="text-white/40 block text-[10px]">MAIN PID</span>
          <span className="font-mono text-cyan-300">{unit.mainPid ? unit.mainPid : "—"}</span>
        </div>
      </div>

      {/* Logs Preview (Collapsible) */}
      {showLogs && unit.logs && unit.logs.length > 0 && (
        <div className="mb-4 bg-black/40 rounded-2xl p-3 border border-white/10 font-mono text-[11px] text-white/80 overflow-x-auto max-h-32 space-y-1">
          <div className="text-white/40 text-[10px] uppercase flex items-center gap-1 mb-1">
            <Terminal className="w-3 h-3" /> Journal Logs
          </div>
          {unit.logs.map((log, i) => (
            <div key={i} className="leading-tight text-white/70 hover:text-white truncate">
              {log}
            </div>
          ))}
        </div>
      )}

      {/* Actions Toolbar */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 gap-2">
        <button
          id={`toggle-logs-${unit.serviceName.replace(/[^a-zA-Z0-9]/g, "-")}`}
          onClick={() => setShowLogs(!showLogs)}
          className="text-xs text-white/60 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition-all"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>{showLogs ? "Hide Logs" : "View Logs"}</span>
        </button>

        <div className="flex items-center gap-1.5">
          {isActive ? (
            <button
              id={`btn-stop-${unit.serviceName.replace(/[^a-zA-Z0-9]/g, "-")}`}
              disabled={isLoading}
              onClick={() => handleAction("stop")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-300 text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
              title="Stop unit"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              id={`btn-start-${unit.serviceName.replace(/[^a-zA-Z0-9]/g, "-")}`}
              disabled={isLoading}
              onClick={() => handleAction("start")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
              title="Start unit"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Start</span>
            </button>
          )}

          <button
            id={`btn-restart-${unit.serviceName.replace(/[^a-zA-Z0-9]/g, "-")}`}
            disabled={isLoading}
            onClick={() => handleAction("restart")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-300 text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
            title="Restart unit"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
            <span>Restart</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
