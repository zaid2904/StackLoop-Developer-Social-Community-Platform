export default function Button({ children, variant = "primary", className = "", ...props }) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-[transform,background-color,border-color,color,box-shadow] duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100";

  const variants = {
    primary: "bg-brand-500 text-white hover:bg-brand-400 focus:ring-brand-300 shadow-glow",
    secondary: "border border-white/10 bg-zinc-900 text-zinc-100 hover:border-white/20 hover:bg-zinc-800 focus:ring-white/20",
    danger: "border border-red-500/25 bg-red-500/10 text-red-200 hover:bg-red-500/20 focus:ring-red-400",
    ghost: "text-zinc-300 hover:bg-zinc-900 hover:text-white focus:ring-white/20",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
