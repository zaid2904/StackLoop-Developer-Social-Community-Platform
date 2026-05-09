export default function Card({ children, className = "", hoverable = false }) {
  const hoverStyles = hoverable
    ? "cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-brand-300/35 hover:bg-zinc-900"
    : "";

  return (
    <div className={`rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-soft backdrop-blur-sm ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}
