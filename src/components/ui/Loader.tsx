import React, { useEffect, useState } from "react";

interface LoaderProps {
  show: boolean;
}

export default function Loader({ show }: LoaderProps) {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!shouldRender) return null;

  return (
    <div 
      id="loader-overlay"
      style={!show ? { animation: "fadeOut 0.5s ease forwards" } : undefined}
    >
      <svg className="tag-wrap" width="110" height="110" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="85" cy="20" r="10" stroke="white" strokeWidth="5" fill="none"/>
        <path d="M85 30 Q95 38 90 48" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <rect x="10" y="28" width="72" height="75" rx="10" ry="10"
              fill="#7B3A1E"
              transform="rotate(-20 46 65)"/>
        <g className="v-letter" transform="rotate(-20 46 65)">
          <path d="M28 52 L46 82 L64 52" stroke="white" strokeWidth="9"
                strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </g>
      </svg>

      <div className="bar-track">
        <div className="bar-fill"></div>
      </div>

      <span className="loader-text">Cargando</span>
    </div>
  );
}
