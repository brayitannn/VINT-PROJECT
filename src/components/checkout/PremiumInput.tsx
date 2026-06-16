import React from "react";
import { AlertCircle } from "lucide-react";

export const PremiumInput = ({ icon: Icon, label, error, ...props }: any) => (
  <div className="flex flex-col gap-2 w-full">
    {label && (
      <label className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] ml-1.5">
        {label}
      </label>
    )}
    <div className="relative group w-full">
      {Icon && (
        <Icon 
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent)] z-20 pointer-events-none" 
        />
      )}
      <input
        {...props}
        style={{ 
          paddingLeft: Icon ? "48px" : "16px", 
          paddingRight: "16px",
          borderColor: error ? "rgb(239, 68, 68)" : "color-mix(in srgb, var(--border) 30%, transparent)"
        }}
        className="w-full h-[54px] text-[15px] transition-all duration-300 outline-none bg-[var(--bg-secondary)] border rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent focus:bg-[var(--bg-primary)]/20"
      />
    </div>
    {error && (
      <span className="text-red-500 text-xs ml-1 font-medium flex items-center gap-1 mt-0.5">
        <AlertCircle className="w-3.5 h-3.5" /> {error}
      </span>
    )}
  </div>
);
