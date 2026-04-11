"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"

interface VintSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}

export function VintSelect({ value, onChange, options, placeholder = "Selecciona..." }: VintSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[60px] flex items-center justify-between px-5 text-[16px] transition-all duration-300 outline-none bg-[var(--bg-secondary)]"
        style={{
          borderRadius: "18px",
          border: isOpen ? "2px solid var(--accent)" : "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
          color: selectedOption ? "var(--text-primary)" : "var(--text-muted)",
          cursor: "pointer",
        }}
      >
        <span style={{ opacity: selectedOption ? 1 : 0.7 }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className="w-5 h-5 transition-transform duration-300" 
          style={{ 
            color: "var(--text-muted)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0)"
          }} 
        />
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 right-0 mt-2 z-50 overflow-hidden animate-fade-in-up"
          style={{
            borderRadius: "18px",
            border: "1px solid var(--border)",
            backgroundColor: "color-mix(in srgb, var(--bg-card) 85%, transparent)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            padding: "8px",
            animationDuration: "0.2s"
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 hover:shadow-md hover:bg-[#E2D5C3]"
                style={{
                  color: isSelected ? "var(--accent)" : "var(--text-primary)",
                  backgroundColor: isSelected ? "#D4C5B0" : "transparent",
                  textAlign: "left",
                  boxShadow: "none"
                }}
              >
                {option.label}
                {isSelected && <Check className="w-4 h-4" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
