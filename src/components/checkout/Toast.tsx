"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface ToastProps {
  show: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "warning";
  onClose: () => void;
}

export function CheckoutToast({ show, title, message, type, onClose }: ToastProps) {
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

  const config = {
    success: {
      icon: CheckCircle2,
      iconColor: "#16a34a",
      bgColor: "rgba(34, 197, 94, 0.1)",
      progressColor: "#16a34a",
    },
    error: {
      icon: AlertCircle,
      iconColor: "#ef4444",
      bgColor: "rgba(239, 68, 68, 0.1)",
      progressColor: "#ef4444",
    },
    warning: {
      icon: AlertCircle,
      iconColor: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.1)",
      progressColor: "#f59e0b",
    }
  };

  const currentConfig = config[type] || config.error;
  const Icon = currentConfig.icon;

  return (
    <div style={{
      position: "fixed",
      top: 24,
      left: "50%",
      zIndex: 9999,
      transform: visible ? "translate(-50%, 0) scale(1)" : "translate(-50%, -20px) scale(0.95)",
      opacity: visible ? 1 : 0,
      transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
      maxWidth: 380,
      width: "90%",
    }}>
      <div style={{
        backgroundColor: "var(--bg-card)",
        border: "1.5px solid var(--border)",
        borderRadius: 16,
        padding: "18px 20px",
        boxShadow: "0 10px 35px rgba(0,0,0,0.15), 0 3px 10px rgba(0,0,0,0.08)",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}>
        {/* Ícono */}
        <div style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: currentConfig.bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon size={20} style={{ color: currentConfig.iconColor }} />
        </div>

        {/* Texto */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontWeight: 700,
            fontSize: 15,
            color: "var(--text-primary)",
            marginBottom: 4,
          }}>
            {title}
          </p>
          <p style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}>
            {message}
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
              backgroundColor: currentConfig.progressColor,
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
