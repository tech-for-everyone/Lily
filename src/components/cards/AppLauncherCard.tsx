import React, { useState } from "react";
import { AppLauncherData } from "../../types";
import {
  ExternalLink,
  Terminal,
  Globe,
  Code,
  Music,
  Folder,
  Play,
  FileText,
  Gamepad2,
  Activity,
  Mail,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { motion } from "motion/react";

interface AppLauncherCardProps {
  data: AppLauncherData;
}

export const AppLauncherCard: React.FC<AppLauncherCardProps> = ({ data }) => {
  const [appData, setAppData] = useState<AppLauncherData>(data);
  const [isRelaunching, setIsRelaunching] = useState(false);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "terminal":
        return <Terminal className="w-5 h-5" />;
      case "globe":
        return <Globe className="w-5 h-5" />;
      case "code":
        return <Code className="w-5 h-5" />;
      case "music":
        return <Music className="w-5 h-5" />;
      case "folder":
        return <Folder className="w-5 h-5" />;
      case "play":
        return <Play className="w-5 h-5" />;
      case "file-text":
        return <FileText className="w-5 h-5" />;
      case "gamepad-2":
        return <Gamepad2 className="w-5 h-5" />;
      case "activity":
        return <Activity className="w-5 h-5" />;
      case "mail":
        return <Mail className="w-5 h-5" />;
      case "send":
        return <Send className="w-5 h-5" />;
      case "message-square":
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  const handleRelaunch = async () => {
    setIsRelaunching(true);
    try {
      const res = await fetch("/api/system/launch-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appName: appData.appName,
          args: appData.args,
        }),
      });
      if (res.ok) {
        const resData = await res.json();
        setAppData(resData);
      }
    } catch (err) {
      console.error("Relaunch failed:", err);
    } finally {
      setIsRelaunching(false);
    }
  };

  const isSuccess = appData.status === "launched" || appData.status === "already_running";

  return (
    <motion.div
      id={`app-launcher-card-${appData.appName}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/[0.08] transition-all rounded-3xl p-5 text-white shadow-2xl relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500/30 to-cyan-500/30 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shadow-lg backdrop-blur-md">
            {getIcon(appData.iconType)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base tracking-tight text-white">
                {appData.displayName}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                {appData.appCategory}
              </span>
            </div>
            <p className="text-xs text-white/50 font-mono mt-0.5">
              $ {appData.execCommand}
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border backdrop-blur-md ${
            isSuccess
              ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-300"
              : "bg-rose-500/15 border-rose-400/30 text-rose-300"
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Active</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
        <div className="text-white/60">
          Process ID: <span className="font-mono text-cyan-300 font-semibold">{appData.pid || "Background"}</span>
        </div>

        <button
          id={`relaunch-btn-${appData.appName}`}
          disabled={isRelaunching}
          onClick={handleRelaunch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white/90 hover:text-white transition-all active:scale-95 text-xs font-medium"
        >
          <RefreshCw className={`w-3 h-3 ${isRelaunching ? "animate-spin" : ""}`} />
          <span>Launch Again</span>
        </button>
      </div>
    </motion.div>
  );
};
