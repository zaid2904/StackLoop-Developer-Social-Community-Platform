import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const styles = {
    success: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
    error: "border-red-400/20 bg-red-500/10 text-red-100",
    info: "border-cyan-400/20 bg-cyan-500/10 text-cyan-100"
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-panel backdrop-blur-xl animate-in slide-in-from-bottom-5 fade-in duration-300 ${styles[type]}`}>
      <span className="font-medium text-sm">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">✕</button>
    </div>
  );
}
