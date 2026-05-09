import React, { useState, useRef, useEffect } from 'react';

export default function Select({ value, onChange, options, className, name }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between text-left transition-colors ${className}`}
      >
        <span className="truncate">{value || "Select..."}</span>
        <svg 
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`ml-2 shrink-0 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full z-50 mt-2 w-full min-w-[120px] overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl">
          <ul className="max-h-60 overflow-auto p-1.5 custom-scrollbar">
            {options.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => {
                    if (onChange) {
                      onChange({ target: { name, value: option } });
                    }
                    setIsOpen(false);
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    value === option 
                      ? "bg-brand-300/15 text-brand-200" 
                      : "text-zinc-300 hover:bg-white/10 hover:text-zinc-100"
                  }`}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
