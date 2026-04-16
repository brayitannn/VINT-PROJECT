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
  const [openUpward, setOpenUpward] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  // Detectar si hay espacio abajo, si no abrir hacia arriba
  React.useEffect(() => {
    if (!isOpen || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const estimatedHeight = options.length * 52 + 16
    setOpenUpward(spaceBelow < estimatedHeight && rect.top > estimatedHeight)
  }, [isOpen, options.length])

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
        className="w-full h-[56px] flex items-center justify-between px-5 text-[15px] transition-all duration-200 outline-none"
        style={{
          borderRadius: "16px",
          border: isOpen
            ? "2px solid var(--accent)"
            : "1.5px solid color-mix(in srgb, var(--border) 70%, transparent)",
          backgroundColor: isOpen
            ? "var(--bg-card)"
            : "var(--bg-secondary)",
          color: selectedOption ? "var(--text-primary)" : "var(--text-muted)",
          cursor: "pointer",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <span className="text-[15px]" style={{ opacity: selectedOption ? 1 : 0.65 }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
          style={{
            color: isOpen ? "var(--accent)" : "var(--text-muted)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 z-50 overflow-hidden"
          style={{
            borderRadius: "16px",
            border: "1.5px solid color-mix(in srgb, var(--border) 70%, transparent)",
            backgroundColor: "var(--bg-card)",
            boxShadow: "0 8px 24px -4px rgba(0,0,0,0.10)",
            padding: "6px",
            ...(openUpward
              ? { bottom: "calc(100% + 6px)" }
              : { top: "calc(100% + 6px)" }),
            // Animación via keyframes inline
            animation: "vintDropdown 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            transformOrigin: openUpward ? "bottom" : "top",
          }}
        >
          <style>{`
            @keyframes vintDropdown {
              from { opacity: 0; transform: scaleY(0.92); }
              to   { opacity: 1; transform: scaleY(1); }
            }
          `}</style>

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
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[15px] transition-colors duration-150"
                style={{
                  color: isSelected ? "var(--accent)" : "var(--text-primary)",
                  backgroundColor: isSelected
                    ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                    : "transparent",
                  fontWeight: isSelected ? 600 : 400,
                  textAlign: "left",
                }}
                onMouseEnter={e => {
                  if (!isSelected)
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      "color-mix(in srgb, var(--border) 30%, transparent)"
                }}
                onMouseLeave={e => {
                  if (!isSelected)
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"
                }}
              >
                <span>{option.label}</span>
                <Check
                  className="w-4 h-4 flex-shrink-0 transition-all duration-150"
                  style={{
                    color: "var(--accent)",
                    opacity: isSelected ? 1 : 0,
                    transform: isSelected ? "scale(1)" : "scale(0.5)",
                  }}
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}