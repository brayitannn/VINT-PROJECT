"use client";

import { useState } from "react";

interface FeatureCardProps {
  icon: React.ReactNode;  // 👈 JSX, no la función
  title: string;
  description: string;
  ctaLabel?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  ctaLabel = "Saber más",
}: FeatureCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        height: 280,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 32px",
          textAlign: "center",
          transform: hovered ? "translateY(-24px)" : "translateY(0)",
          transition: "transform 0.3s ease",
        }}
      >
        <div style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: "var(--accent-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          {icon}
        </div>

        <h3 style={{
          fontWeight: 700,
          fontSize: 18,
          color: "var(--text-primary)",
          marginBottom: 12,
          textAlign: "center",
        }}>
          {title}
        </h3>

        <p style={{
          fontSize: 14,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          textAlign: "center",
          margin: "0 auto",
          maxWidth: 260,
        }}>
          {description}
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 56,
          backgroundColor: "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: hovered ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.3s ease",
        }}
      >
        <span style={{
          color: "white",
          fontSize: 14,
          fontWeight: 600,
        }}>
          {ctaLabel} →
        </span>
      </div>
    </div>
  );
}