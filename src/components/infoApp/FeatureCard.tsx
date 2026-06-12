"use client";

import React, { useState, useEffect } from "react";

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

  // Efecto Contador para Moda Sostenible
  useEffect(() => {
    if (title === 'Moda Sostenible') {
      if (hovered) {
        let current = 0;
        const target = 2700;
        const interval = setInterval(() => {
          current += 100;
          if (current >= target) {
            current = target;
            clearInterval(interval);
          }
          setWaterCount(current);
        }, 20);
        return () => clearInterval(interval);
      } else {
        setWaterCount(0);
      }
    }
  }, [hovered, title]);

  return (
    <>
      <div
        className="feature-card-wrapper"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          overflow: "hidden",
          // Desenfoque y fondo semi-transparente estilo cristal (Glassmorphism)
          backgroundColor: hovered ? "var(--bg-card-hover)" : "var(--bg-card)",
          backdropFilter: "blur(16px)", // <- Este es el desenfoque
          zIndex: hovered ? 50 : 1, // <- ¡ESTO EVITA QUE SE ESCONDA DETRÁS DE LAS OTRAS!
          border: "1px solid var(--border)",
          borderRadius: 20,
          height: 320,
          cursor: "pointer",
          transition: "all 0.3s ease",
          // Aquí combinamos el levantamiento (translate) con el agrande (scale) 
          transform: hovered ? "translateY(-4px) scale(1.05)" : "translateY(0) scale(1)",
          boxShadow: hovered ? "0 25px 50px -12px var(--shadow-hover)" : "none"
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
            // Ajustamos el desplazamiento para dar espacio a la info interactiva
            transform: hovered ? "translateY(-28px)" : "translateY(0)",
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Contenedor del ícono dinámico */}
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

          {/* Dinamismo interactivo (Solo se muestra en Hover) */}
          {title === 'Moda Sostenible' && (
            <div style={{
              height: hovered ? 24 : 0,
              opacity: hovered ? 1 : 0,
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              color: '#059669', // Verde naturaleza
              fontWeight: 800,
              fontSize: 14,
              marginBottom: hovered ? 8 : 0
            }}>
              💧 {waterCount}L de agua ahorrados
            </div>
          )}

          {title === 'Mejores Precios' && (
            <div style={{
              height: hovered ? 28 : 0, // Un poco más alto para que la escala quepa perfecta
              opacity: hovered ? 1 : 0,
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              fontSize: 15,
              marginBottom: hovered ? 8 : 0,
              padding: "0 10px", // Margen interno de seguridad
            }}>
              <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>$160.000</span>
              <span style={{
                color: 'var(--accent)',
                fontWeight: 800,
                transform: hovered ? 'scale(1.01)' : 'scale(1)',
                transition: 'transform 0.5s 0.2s',
                display: 'inline-block', // Ayuda al navegador a redimensionar sin cortar
                padding: '0 4px' // Espacio extra para que no golpee el límite oculto
              }}>
                $45.000
              </span>
            </div>
          )}

          {/* El texto corto principal que se desvanece sutilmente si es necesario */}
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

        {/* Hover de flecha de acción */}
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
        >
        </div>
      </div>
    </>
  );
}