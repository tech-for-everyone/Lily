import React, { useState } from "react";
import { LinuxSystemData } from "../../types";
import {
  Cpu,
  HardDrive,
  Volume2,
  VolumeX,
  Sun,
  Power,
  RotateCcw,
  Moon,
  Lock,
  Package,
  Terminal,
  Activity,
  CheckCircle,
} from "lucide-react";
import { motion } from "motion/react";

interface LinuxSystemCardProps {
  data: LinuxSystemData;
}

export const LinuxSystemCard: React.FC<LinuxSystemCardProps> = ({ data }) => {
  const [sysData, setSysData] = useState<LinuxSystemData>(data);
  const [volume, setVolume] = useState<number>(data.volume ?? 75);
  const [brightness, setBrightness] = useState<number>(data.brightness ?? 80);
  const [isMuted, setIsMuted] = useState<boolean>(data.isMuted ?? false);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const handleControl = async (action: string, value?: string) => {
    setIsBusy(true);
    try {
      const res = await fetch("/api/system/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, value }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSysData(updated);
        if (updated.volume !== undefined) setVolume(updated.volume);
        if (updated.brightness !== undefined) setBrightness(updated.brightness);
        if (updated.isMuted !== undefined) setIsMuted(updated.isMuted);
      }
    } catch (err) {
      console.error("Control error:", err);
    } finally {
      setIsBusy(false);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    handleControl("volume_set", `${newVol}%`);
  };

  const handleBrightnessChange = (newB: number) => {
    setBrightness(newB);
    handleControl("brightness_set", `${newB}%`);
  };

  const osInfo = sysData.osInfo || {
    distro: "Arch Linux",
    kernel: "Linux 6.x-arch1-1",
    uptime: "4.2 hours",
    host: "archlinux",
  };

  const hardware = sysData.hardware || {
    cpuModel: "x86_64 Processor",
    cpuUsagePercent: 24,
    ramTotal: "16.0 GB",
    ramUsed: "5.8 GB",
    ramPercent: 36,
    diskUsed: "42 GB",
    diskTotal: "512 GB",
    diskPercent: 32,
  };

  return (
    <motion.div
      id="linux-system-control-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/[0.08] transition-all rounded-3xl p-5 text-white shadow-2xl relative overflow-hidden"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center backdrop-blur-md">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-wide text-white">
                Arch Linux Hub
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-mono font-bold">
                systemd
              </span>
            </div>
            <p className="text-[11px] text-white/50 font-mono">
              {osInfo.kernel} • {osInfo.uptime}
            </p>
          </div>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 backdrop-blur-md">
          <CheckCircle className="w-3 h-3" /> Online
        </span>
      </div>

      {/* Hardware Telemetry Row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {/* RAM */}
        <div className="bg-black/25 rounded-2xl p-2.5 border border-white/5">
          <div className="flex items-center justify-between text-[10px] text-white/50 mb-1">
            <span>RAM</span>
            <span className="text-cyan-300 font-mono">{hardware.ramPercent}%</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-1">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${hardware.ramPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-white/70 block truncate">
            {hardware.ramUsed}
          </span>
        </div>

        {/* CPU */}
        <div className="bg-black/25 rounded-2xl p-2.5 border border-white/5">
          <div className="flex items-center justify-between text-[10px] text-white/50 mb-1">
            <span>CPU</span>
            <span className="text-purple-300 font-mono">{hardware.cpuUsagePercent}%</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-1">
            <div
              className="bg-gradient-to-r from-purple-400 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${hardware.cpuUsagePercent}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-white/70 block truncate">
            {hardware.cpuModel.split(" ")[0]}
          </span>
        </div>

        {/* Disk */}
        <div className="bg-black/25 rounded-2xl p-2.5 border border-white/5">
          <div className="flex items-center justify-between text-[10px] text-white/50 mb-1">
            <span>DISK</span>
            <span className="text-amber-300 font-mono">{hardware.diskPercent}%</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-1">
            <div
              className="bg-gradient-to-r from-amber-400 to-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${hardware.diskPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-white/70 block truncate">
            {hardware.diskUsed}
          </span>
        </div>
      </div>

      {/* Sliders for Volume & Brightness */}
      <div className="space-y-3 pt-2 border-t border-white/10 mb-4">
        {/* PipeWire Audio Volume */}
        <div>
          <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
            <span className="flex items-center gap-1.5">
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>PipeWire Volume</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                id="toggle-mute-btn"
                onClick={() => handleControl(isMuted ? "volume_unmute" : "volume_mute")}
                className="text-[10px] text-cyan-300 hover:underline font-mono"
              >
                {isMuted ? "Unmute" : "Mute"}
              </button>
              <span className="font-mono text-white/90 text-xs">{isMuted ? "0%" : `${volume}%`}</span>
            </div>
          </div>
          <input
            id="linux-volume-slider"
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
        </div>

        {/* Display Brightness */}
        <div>
          <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Display Brightness
            </span>
            <span className="font-mono text-white/90 text-xs">{brightness}%</span>
          </div>
          <input
            id="linux-brightness-slider"
            type="range"
            min="5"
            max="100"
            value={brightness}
            onChange={(e) => handleBrightnessChange(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Quick Power Controls */}
      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/10">
        <button
          id="power-btn-lock"
          disabled={isBusy}
          onClick={() => handleControl("lock")}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all text-xs active:scale-95"
          title="Lock Session"
        >
          <Lock className="w-4 h-4 mb-1 text-cyan-300" />
          <span className="text-[10px]">Lock</span>
        </button>

        <button
          id="power-btn-suspend"
          disabled={isBusy}
          onClick={() => handleControl("suspend")}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all text-xs active:scale-95"
          title="Sleep (Suspend)"
        >
          <Moon className="w-4 h-4 mb-1 text-purple-300" />
          <span className="text-[10px]">Suspend</span>
        </button>

        <button
          id="power-btn-reboot"
          disabled={isBusy}
          onClick={() => handleControl("reboot")}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all text-xs active:scale-95"
          title="Reboot System"
        >
          <RotateCcw className="w-4 h-4 mb-1 text-amber-300" />
          <span className="text-[10px]">Reboot</span>
        </button>

        <button
          id="power-btn-shutdown"
          disabled={isBusy}
          onClick={() => handleControl("shutdown")}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 text-rose-300 transition-all text-xs active:scale-95"
          title="Power Off"
        >
          <Power className="w-4 h-4 mb-1 text-rose-400" />
          <span className="text-[10px]">Shutdown</span>
        </button>
      </div>
    </motion.div>
  );
};
