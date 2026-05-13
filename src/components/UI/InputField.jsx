export default function InputField({ label, id, type = "text", className = "", ...props }) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}
      {type === "textarea" ? (
        <textarea
          id={id}
          className={`min-h-[120px] w-full resize-y rounded-2xl border border-white/10 bg-black px-4 py-3 text-zinc-100 placeholder:text-zinc-600 transition-[border-color,box-shadow] duration-200 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-300/20 ${className}`}
          {...props}
        />
      ) : (
        <input
          id={id}
          type={type}
          className={`w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-zinc-100 placeholder:text-zinc-600 transition-[border-color,box-shadow] duration-200 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-300/20 ${className}`}
          {...props}
        />
      )}
    </div>
  );
}
