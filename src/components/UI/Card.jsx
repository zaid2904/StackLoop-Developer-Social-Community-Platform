export default function Card({ children, className = "", hoverable = false }) {
  const hoverStyles = hoverable
    ? "cursor-pointer transition-[transform,border-color,background-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-brand-300/35 hover:bg-zinc-900/90 hover:shadow-[0_16px_36px_rgba(0,0,0,0.35)]"
    : "";

  return (
    <div className={`rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-soft backdrop-blur-sm transition-colors duration-200 focus-within:border-brand-300/35 ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}
