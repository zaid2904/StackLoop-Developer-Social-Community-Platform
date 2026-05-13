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
    success: "border-red-400/25 bg-red-500/10 text-red-100",
    error: "border-red-500/35 bg-red-600/18 text-red-100",
    info: "border-red-300/20 bg-red-500/10 text-red-100",
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-panel backdrop-blur-xl animate-in slide-in-from-bottom-5 fade-in duration-300 ${styles[type]}`}>
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="rounded-md px-1 text-sm opacity-70 transition-opacity hover:opacity-100"
        aria-label="Dismiss notification"
      >
        x
      </button>
    </div>
  );
}
