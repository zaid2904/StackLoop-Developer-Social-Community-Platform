export default function Avatar({ src, alt = "User", size = "md", fallback }) {
  const sizes = {
    xs: "h-7 w-7 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
    xl: "h-24 w-24 border-4 text-2xl",
  };

  const baseClass = "rounded-2xl border border-white/10 object-cover shadow-lg shadow-black/60";
  const sizeClass = sizes[size] || sizes.md;

  if (!src) {
    return (
      <div className={`${baseClass} ${sizeClass} flex items-center justify-center bg-zinc-900 font-semibold text-zinc-100`}>
        {fallback ? fallback.slice(0, 2).toUpperCase() : "??"}
      </div>
    );
  }

  return <img src={src} alt={alt} className={`${baseClass} ${sizeClass}`} loading="lazy" />;
}
