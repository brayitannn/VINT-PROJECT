"use client";

import React, { useState, useEffect, useRef } from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaLabel?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  const [hovered, setHovered] = useState(false);
  const [waterCount, setWaterCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // ── Detecta cuando la tarjeta aparece en pantalla ──────────────────
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Contador de litros (Moda Sostenible) — se activa al verla en pantalla ──
  useEffect(() => {
    if (title !== 'Moda Sostenible') return;
    if (!visible) return;

    let current = 0;
    const target = 2700;
    const interval = setInterval(() => {
      current += 60;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setWaterCount(current);
    }, 16);
    return () => clearInterval(interval);
  }, [visible, title]);

  return (
    <>
      <div
        ref={cardRef}
        className="feature-card-wrapper"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          overflow: "hidden",
          backgroundColor: hovered ? "var(--bg-card-hover)" : "var(--bg-card)",
          backdropFilter: "blur(16px)",
          zIndex: hovered ? 50 : 1,
          border: "1px solid var(--border)",
          borderRadius: 20,
          height: 320,
          cursor: "pointer",
          transition: "all 0.3s ease",
          transform: hovered ? "translateY(-4px) scale(1.05)" : "translateY(0) scale(1)",
          boxShadow: hovered ? "0 25px 50px -12px var(--shadow-hover)" : "none",
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
            transform: hovered ? "translateY(-28px)" : "translateY(0)",
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Ícono */}
          <div style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: hovered ? 'var(--accent)' : 'var(--accent-light)',
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            transform: hovered ? 'scale(1.15)' : 'scale(1)',
            boxShadow: hovered ? '0 0 0 8px color-mix(in srgb, var(--accent) 20%, transparent)' : 'none',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            color: hovered ? 'white' : 'var(--accent)'
          }}>
            {hovered && React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement<{ style?: React.CSSProperties }>, { style: { color: 'white' } })
              : icon
            }
          </div>

          <h3 style={{
            fontWeight: 700,
            fontSize: 18,
            color: "var(--text-primary)",
            marginBottom: 8,
            textAlign: "center",
          }}>
            {title}
          </h3>

          {/* Contador de agua — aparece al ver la tarjeta */}
          {title === 'Moda Sostenible' && (
            <div style={{
              height: visible ? 24 : 0,
              opacity: visible ? 1 : 0,
              overflow: 'hidden',
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              color: '#059669',
              fontWeight: 800,
              fontSize: 14,
              marginBottom: visible ? 8 : 0
            }}>
              💧 {waterCount.toLocaleString('es-CO')}L de agua ahorrados
            </div>
          )}

          {title === 'Mejores Precios' && (
            <div style={{
              height: hovered ? 28 : 0,
              opacity: hovered ? 1 : 0,
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              fontSize: 15,
              marginBottom: hovered ? 8 : 0,
              padding: "0 10px",
            }}>
              <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>$160.000</span>
              <span style={{
                color: 'var(--accent)',
                fontWeight: 800,
                transform: hovered ? 'scale(1.01)' : 'scale(1)',
                transition: 'transform 0.5s 0.2s',
                display: 'inline-block',
                padding: '0 4px'
              }}>
                $45.000
              </span>
            </div>
          )}

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

        {/* Franja de color al hover */}
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
            transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
    </>
  );
}