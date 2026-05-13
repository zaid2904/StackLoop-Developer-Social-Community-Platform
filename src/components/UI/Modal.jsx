
export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 shadow-panel">
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <h2 className="text-2xl font-display font-semibold text-zinc-100">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
            aria-label="Close modal"
          >
            x
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
