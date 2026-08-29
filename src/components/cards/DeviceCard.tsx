import { DeviceState } from "../../types";
import { Flashlight, Wifi, Bluetooth, Moon, Sun, Volume2, Sliders, Check } from "lucide-react";
import { motion } from "motion/react";

interface DeviceCardProps {
  key?: string;
  deviceState: DeviceState;
  onChange: (updates: Partial<DeviceState>) => void;
}

export const DeviceCard = ({ deviceState, onChange }: DeviceCardProps) => {
  return (
    <motion.div
      id="device-control-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/[0.08] transition-all rounded-3xl p-6 text-white shadow-2xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center backdrop-blur-md">
            <Sliders className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm sm:text-base tracking-wide text-white/90">Control Center</span>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 backdrop-blur-md">
          <Check className="w-3 h-3" /> Live
        </span>
      </div>

      {/* Grid of quick toggles */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        {/* Flashlight */}
        <button
          id="toggle-flashlight"
          onClick={() => onChange({ flashlight: !deviceState.flashlight })}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all backdrop-blur-md ${
            deviceState.flashlight
              ? "bg-amber-500/30 border-amber-400/50 text-amber-200 shadow-lg shadow-amber-500/20"
              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
          }`}
          title="Flashlight"
        >
          <Flashlight className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Torch</span>
        </button>

        {/* Wi-Fi */}
        <button
          id="toggle-wifi"
          onClick={() => onChange({ wifi: !deviceState.wifi })}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all backdrop-blur-md ${
            deviceState.wifi
              ? "bg-blue-500/30 border-blue-400/50 text-blue-200 shadow-lg shadow-blue-500/20"
              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
          }`}
          title="Wi-Fi"
        >
          <Wifi className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Wi-Fi</span>
        </button>

        {/* Bluetooth */}
        <button
          id="toggle-bluetooth"
          onClick={() => onChange({ bluetooth: !deviceState.bluetooth })}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all backdrop-blur-md ${
            deviceState.bluetooth
              ? "bg-indigo-500/30 border-indigo-400/50 text-indigo-200 shadow-lg shadow-indigo-500/20"
              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
          }`}
          title="Bluetooth"
        >
          <Bluetooth className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Bluetooth</span>
        </button>

        {/* Do Not Disturb */}
        <button
          id="toggle-dnd"
          onClick={() => onChange({ dnd: !deviceState.dnd })}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all backdrop-blur-md ${
            deviceState.dnd
              ? "bg-purple-500/30 border-purple-400/50 text-purple-200 shadow-lg shadow-purple-500/20"
              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
          }`}
          title="Do Not Disturb"
        >
          <Moon className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">DND</span>
        </button>
      </div>

      {/* Sliders for Brightness & Volume */}
      <div className="space-y-3 pt-3 border-t border-white/10">
        <div>
          <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Brightness
            </span>
            <span className="font-mono text-white/90">{deviceState.brightness}%</span>
          </div>
          <input
            id="slider-brightness"
            type="range"
            min="10"
            max="100"
            value={deviceState.brightness}
            onChange={(e) => onChange({ brightness: Number(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> Volume
            </span>
            <span className="font-mono text-white/90">{deviceState.volume}%</span>
          </div>
          <input
            id="slider-volume"
            type="range"
            min="0"
            max="100"
            value={deviceState.volume}
            onChange={(e) => onChange({ volume: Number(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>
    </motion.div>
  );
};
