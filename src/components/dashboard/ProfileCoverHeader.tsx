'use client'

import Link from 'next/link'
import { Edit2, Share2, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import React from 'react'

export interface AccesoRapido {
  id: string
  icon: React.ElementType
  label: string
  href?: string
  onClick?: () => void
  accent: string
}

interface ProfileCoverHeaderProps {
  name: string
  email?: string
  stats?: { value: string | number; label: string }[]
  avatarUrl?: string | null
  tagline?: string
  accesos?: AccesoRapido[]
}

export function ProfileCoverHeader({
  name,
  email,
  stats = [],
  avatarUrl,
  tagline = 'Tu estilo, sostenible y único',
  accesos = [],
}: ProfileCoverHeaderProps) {
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('')

  return (
    <>
      <style>{`
        /* ── Card ─────────────────────────────────────────── */
        .pch-card {
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--bg-card);
          margin-bottom: 36px;
          animation: pch-slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }

        @keyframes pch-slide-in {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Cover ─────────────────────────────────────────── */
        .pch-banner {
          height: 88px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(125deg, #1A0D06 0%, #2C1A0E 45%, #3D2210 100%);
        }

        /* Gradiente luminoso en el centro-derecha */
        .pch-banner::before {
          content: '';
          position: absolute;
          right: 10%; top: -40px;
          width: 260px; height: 200px;
          background: radial-gradient(ellipse, rgba(139,94,60,0.45) 0%, transparent 65%);
          pointer-events: none;
        }

        /* Segundo foco de luz esquina izquierda */
        .pch-banner::after {
          content: '';
          position: absolute;
          left: -30px; bottom: -30px;
          width: 140px; height: 140px;
          background: radial-gradient(circle, rgba(90,53,32,0.4) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Línea de brillo sutil en el borde inferior del banner */
        .pch-banner-shine {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(139,94,60,0.6) 40%, rgba(197,139,89,0.8) 55%, rgba(139,94,60,0.6) 70%, transparent 100%);
        }

        /* ── Fila del avatar ──────────────────────────────── */
        .pch-top-row {
          margin-top: -36px;
          margin-bottom: 12px;
        }

        /* ── Fila de botones ───────────────────────────── */
        .pch-actions-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
          margin-bottom: 14px;
        }

        /* ── Cuerpo del perfil ───────────────────────────── */
        .pch-body {
          padding: 0 28px 20px;
        }

        /* ── Avatar ─────────────────────────────────────────── */
        .pch-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #EDE3D6;
          color: #5A3520;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 800;
          font-family: 'DM Sans', sans-serif;
          border: 3.5px solid var(--bg-primary);
          box-shadow: 0 4px 20px rgba(44,26,14,0.18), 0 0 0 1px rgba(139,94,60,0.1);
          overflow: hidden;
          flex-shrink: 0;
          transition: box-shadow 0.3s, transform 0.3s;
          cursor: default;
          position: relative;
          z-index: 1;
        }
        .pch-avatar:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 10px 28px rgba(44,26,14,0.26), 0 0 0 1px rgba(139,94,60,0.2);
        }

        /* ── Botones header ─────────────────────────────── */
        .pch-actions { display: flex; gap: 8px; }

        .pch-btn-outline {
          padding: 8px 18px;
          border-radius: 10px;
          border: 1.5px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; gap: 6px;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
          letter-spacing: 0.01em;
        }
        .pch-btn-outline:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(139,94,60,0.05);
          transform: translateY(-1px);
        }

        .pch-btn-solid {
          padding: 8px 20px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #9B6A43 0%, #8B5E3C 60%, #7A5235 100%);
          color: white;
          font-size: 13px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; gap: 6px;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.01em;
          box-shadow: 0 3px 12px -2px rgba(139,94,60,0.45);
        }
        .pch-btn-solid:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px -2px rgba(139,94,60,0.55);
        }

        /* ── Info de texto ───────────────────────────────────── */
        .pch-name {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 3px;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }
        .pch-handle {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0 0 3px;
          font-weight: 400;
        }
        .pch-tagline {
          font-size: 13.5px;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.4;
        }

        /* ── Stats compactos (inline) ────────────────────── */
        .pch-stats {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          flex-wrap: wrap;
        }
        .pch-stat {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .pch-stat-sep {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--text-muted);
          opacity: 0.45;
          flex-shrink: 0;
          align-self: center;
        }
        .pch-stat-num {
          font-size: 14px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .pch-stat-label {
          font-size: 13px;
          font-weight: 400;
          color: var(--text-secondary);
        }

        /* ── Divisor ─────────────────────────────────────────── */
        .pch-divider {
          height: 1px;
          margin: 4px 20px 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--border) 20%,
            var(--border) 80%,
            transparent 100%
          );
        }

        /* ── Navegación ──────────────────────────────────────── */
        .pch-nav {
          display: grid;
          padding: 8px 12px 12px;
          gap: 6px;
        }

        .pch-nav-item {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          text-align: left;
          gap: 10px;
          padding: 12px 18px;
          border-radius: 16px;
          text-decoration: none;
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03); /* Fondo casi transparente */
          border: 1px solid var(--border);
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
          cursor: pointer;
          font-family: inherit;
          font-weight: 500;
          font-size: 13.5px;
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          position: relative;
          overflow: hidden;
          letter-spacing: 0.01em;
        }

        .pch-nav-item:hover {
          transform: translateY(-2px);
          background: var(--bg-primary);
          border-color: rgba(139, 94, 60, 0.25);
          box-shadow: 0 8px 24px rgba(139, 94, 60, 0.08), 0 2px 8px rgba(139, 94, 60, 0.04);
        }

        .pch-nav-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
        }

        .pch-nav-text {
          font-weight: 700;
          font-size: 14.5px;
          transition: color 0.2s;
          flex: 1;
        }

        .pch-nav-arrow {
          transition: all 0.25s ease;
          flex-shrink: 0;
        }

        /* ── Responsive ──────────────────────────────────────── */
        @media (max-width: 640px) {
          .pch-body { padding: 0 16px 18px; }
          .pch-nav { grid-template-columns: 1fr; gap: 4px; padding: 8px 10px 12px; }
          .pch-btn-outline span, .pch-btn-solid span { display: none; }
          .pch-btn-outline, .pch-btn-solid { padding: 9px 12px; }
          .pch-stats { width: 100%; justify-content: center; }
          .pch-stat { flex: 1; }
        }
      `}</style>

      <div className="pch-card">

        {/* ── 1. Cover banner ─────────────────────────────── */}
        <div className="pch-banner">
          <div className="pch-banner-shine" />
        </div>

        {/* ── 2. Cuerpo del perfil ────────────────────────── */}
        <div className="pch-body">

          {/* Avatar — fila propia con margin negativo */}
          <div className="pch-top-row">
            <div className="pch-avatar">
              {avatarUrl
                ? <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
              }
            </div>
          </div>

          {/* Nombre, @usuario, tagline */}
          <p className="pch-name">{name}</p>
          {email && <p className="pch-handle">@{email.split('@')[0]}</p>}
          <p className="pch-tagline">{tagline}</p>

          {/* Stats compactos — entre info y botones */}
          {stats.length > 0 && (
            <div className="pch-stats">
              {stats.map((stat, i) => (
                <React.Fragment key={stat.label}>
                  <div className="pch-stat">
                    <span className="pch-stat-num">{stat.value}</span>
                    <span className="pch-stat-label">{stat.label}</span>
                  </div>
                  {i < stats.length - 1 && <div className="pch-stat-sep" />}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Botones */}
          <div className="pch-actions-row">
            <div className="pch-actions">
              <Link href="/perfil" className="pch-btn-outline">
                <Edit2 size={13} />
                <span>Editar</span>
              </Link>
              <button className="pch-btn-solid">
                <Share2 size={13} />
                <span>Compartir</span>
              </button>
            </div>
          </div>

        </div>

        {/* ── 3. Divisor + Navegación ─────────────────────── */}
        {accesos.length > 0 && (
          <>
            <div className="pch-divider" />
            <div className="pch-nav" style={{ gridTemplateColumns: accesos.length % 2 === 0 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)' }}>
              {accesos.map((nav) => {
                const Icon = nav.icon
                const active = hoveredNav === nav.id

                const navStyle = {
                  backgroundColor: active ? `${nav.accent}12` : 'transparent',
                  borderColor:     active ? `${nav.accent}28` : 'transparent',
                }
                const iconStyle = {
                  background:  active ? nav.accent : 'var(--bg-secondary)',
                  color:       active ? 'white'    : nav.accent,
                  transform:   active ? 'scale(1.1) rotate(4deg)' : 'scale(1)',
                  boxShadow:   active ? `0 4px 14px ${nav.accent}45` : 'none',
                }

                const inner = (
                  <>
                    <div className="pch-nav-icon" style={iconStyle}>
                      <Icon size={19} />
                    </div>
                    <span className="pch-nav-text" style={{ color: active ? nav.accent : 'var(--text-primary)' }}>
                      {nav.label}
                    </span>
                    <ChevronRight
                      size={15}
                      className="pch-nav-arrow"
                      style={{
                        opacity:   active ? 1 : 0,
                        transform: active ? 'translateX(0)' : 'translateX(-8px)',
                        color: nav.accent,
                      }}
                    />
                  </>
                )

                if (nav.onClick) {
                  return (
                    <button
                      key={nav.id}
                      className="pch-nav-item"
                      style={navStyle}
                      onMouseEnter={() => setHoveredNav(nav.id)}
                      onMouseLeave={() => setHoveredNav(null)}
                      onClick={nav.onClick}
                    >
                      {inner}
                    </button>
                  )
                }
                return (
                  <Link
                    key={nav.id}
                    href={nav.href!}
                    className="pch-nav-item"
                    style={navStyle}
                    onMouseEnter={() => setHoveredNav(nav.id)}
                    onMouseLeave={() => setHoveredNav(null)}
                  >
                    {inner}
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </>
  )
}
