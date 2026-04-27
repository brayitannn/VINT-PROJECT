"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X, Trash2, AlertCircle } from "lucide-react";

export type ToastType = "success" | "delete" | "error";

interface ProductToastProps {
  show: boolean;
  title: string;
  message: string;
  type?: ToastType;
  onClose: () => void;
}

export function ProductToast({ show, title, message, type = "success", onClose }: ProductToastProps) {
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
  }, [show, onClose]);

  if (!show && !visible) return null;

  const getIcon = () => {
    switch (type) {
      case "delete": return <Trash2 size={20} style={{ color: "#EF4444" }} />;
      case "error": return <AlertCircle size={20} style={{ color: "#EF4444" }} />;
      case "success":
      default: return <CheckCircle2 size={20} style={{ color: "#10B981" }} />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "delete":
      case "error": return "rgba(239, 68, 68, 0.1)";
      case "success":
      default: return "rgba(16, 185, 129, 0.1)";
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case "delete":
      case "error": return "#EF4444";
      case "success":
      default: return "#10B981";
    }
  };

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
      width: "100%",
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
          backgroundColor: getBgColor(),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          {getIcon()}
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
              backgroundColor: getProgressColor(),
              animation: visible ? "shrinkToast 5s linear forwards" : "none",
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
        @keyframes shrinkToast {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
