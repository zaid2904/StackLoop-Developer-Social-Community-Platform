
export default function Skeleton({ type = "text", className = "" }) {
  const baseClass = "animate-pulse bg-white/10";

  const styles = {
    text: "h-4 rounded w-3/4",
    title: "h-8 rounded w-1/2",
    avatar: "h-10 w-10 rounded-full",
    image: "h-48 w-full rounded-xl",
    card: "h-64 w-full rounded-2xl"
  };

  return <div className={`${baseClass} ${styles[type]} ${className}`}></div>;
}
