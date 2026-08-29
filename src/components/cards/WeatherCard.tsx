import { WeatherData } from "../../types";
import { Sun, Cloud, CloudRain, Wind, Droplets, MapPin } from "lucide-react";
import { motion } from "motion/react";

interface WeatherCardProps {
  key?: string;
  data: WeatherData;
}

export const WeatherCard = ({ data }: WeatherCardProps) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "sun":
        return <Sun className="w-8 h-8 text-amber-400" />;
      case "cloud-rain":
        return <CloudRain className="w-8 h-8 text-sky-400" />;
      case "cloud":
      case "sun-cloud":
      default:
        return <Cloud className="w-8 h-8 text-sky-300" />;
    }
  };

  return (
    <motion.div
      id="weather-card"
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/[0.08] transition-all rounded-3xl p-6 text-white shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <MapPin className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm sm:text-base tracking-wide text-white/90">{data.location}</h3>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/80 font-medium backdrop-blur-md">
          {data.condition}
        </span>
      </div>

      {/* Main Temperature Hero */}
      <div className="flex items-center justify-between my-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl sm:text-6xl font-light tracking-tight">{data.temperature}°</span>
          <span className="text-xs sm:text-sm font-medium text-white/50">
            H: {data.high}° L: {data.low}°
          </span>
        </div>
        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
          {getIcon(data.icon)}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-white/10 my-3 text-xs">
        <div className="flex items-center gap-2 text-white/70">
          <Droplets className="w-3.5 h-3.5 text-cyan-300" />
          <span>Humidity: {data.humidity}%</span>
        </div>
        <div className="flex items-center gap-2 text-white/70">
          <Wind className="w-3.5 h-3.5 text-blue-300" />
          <span>Wind: {data.windSpeed}</span>
        </div>
      </div>

      {/* Hourly forecast row */}
      {data.hourly && data.hourly.length > 0 && (
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {data.hourly.map((h, i) => (
            <div
              key={i}
              className="flex flex-col items-center bg-white/5 hover:bg-white/10 transition-colors border border-white/10 backdrop-blur-md rounded-2xl px-3 py-2 min-w-[56px]"
            >
              <span className="text-[11px] text-white/60">{h.time}</span>
              <div className="my-1 scale-75">{getIcon(h.icon)}</div>
              <span className="text-xs font-semibold text-white/90">{h.temp}°</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
