"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

interface ToastProps {
  show: boolean;
  email: string;
  onClose: () => void;
}

export function Toast({ show, email, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 400);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show && !visible) return null;

  return (
    <div style={{
      position: "fixed",
      top: 24,
      right: 24,
      zIndex: 9999,
      transform: visible ? "translateY(0)" : "translateY(-120%)",
      opacity: visible ? 1 : 0,
      transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
      maxWidth: 380,
      width: "calc(100vw - 48px)",
    }}>
      <div style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "18px 20px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}>
        {/* Ícono */}
        <div style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <CheckCircle2 size={20} style={{ color: "#16a34a" }} />
        </div>

        {/* Texto */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontWeight: 700,
            fontSize: 15,
            color: "var(--text-primary)",
            marginBottom: 4,
          }}>
            ¡Enlace enviado!
          </p>
          <p style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}>
            Hemos enviado el enlace a{" "}
            <span style={{ fontWeight: 600, color: "var(--accent)" }}>
              {email}
            </span>
            . Revisa tu bandeja y la carpeta de spam.
          </p>

          {/* Barra de progreso */}
          <div style={{
            marginTop: 12,
            height: 3,
            borderRadius: 99,
            backgroundColor: "var(--border)",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              borderRadius: 99,
              backgroundColor: "#16a34a",
              animation: visible ? "shrink 5s linear forwards" : "none",
            }} />
          </div>
        </div>

        {/* Cerrar */}
        <button
          onClick={() => { setVisible(false); setTimeout(onClose, 400); }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 6,
            flexShrink: 0,
          }}
        >
          <X size={16} />
        </button>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
