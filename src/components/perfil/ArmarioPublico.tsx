'use client'

import React, { useEffect, useState } from 'react'
import { ArrowLeft, MapPin, Calendar, Heart, Share2, Award, Info } from 'lucide-react'
import Link from 'next/link'

interface ArmarioPublicoProps {
  buyerSlug: string;
}

export function ArmarioPublico({ buyerSlug }: ArmarioPublicoProps) {
  const [loading, setLoading] = useState(true)

  // Datos simulados (pueden venir de BD en un futuro)
  const nombreLimpio = buyerSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  const username = buyerSlug.replace(/-/g, '')
  const location = 'Medellín, Colombia'
  const joinYear = 2024
  const initials = nombreLimpio.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [buyerSlug])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Cargando armario...</p>
      </div>
    )
  }

  // Colecciones de ejemplo
  const colecciones = [
    { title: 'Tesoros Vintage', count: 12, cover: 'https://images.unsplash.com/photo-1550614000-4b917203bba3?w=400&h=400&fit=crop' },
    { title: 'Verano 2026', count: 8, cover: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=400&h=400&fit=crop' },
    { title: 'Estilo Y2K', count: 24, cover: 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=400&h=400&fit=crop' },
    { title: 'Básicos Elegantes', count: 5, cover: 'https://images.unsplash.com/photo-1434389678052-a5dc8ab8e925?w=400&h=400&fit=crop' }
  ]

  return (
    <>
      <style>{`
        .armario-banner {
          height: 320px;
          width: 100%;
          background: linear-gradient(135deg, rgba(44,31,20,0.6) 0%, rgba(139,94,60,0.8) 100%), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop');
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .armario-avatar {
          width: 150px;
          height: 150px;
          border-radius: 40px; /* Un poco más cuadrado para diferenciarse del vendedor */
          border: 8px solid var(--bg-primary);
          background-color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          font-weight: 900;
          color: white;
          position: absolute;
          bottom: -75px;
          left: 5vw;
          box-shadow: 0 12px 32px rgba(0,0,0,0.15);
          overflow: hidden;
          transform: rotate(-3deg);
        }

        .armario-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .armario-info {
          padding: 90px 5vw 48px;
          background: var(--bg-primary);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 32px;
        }

        .armario-bio {
          font-size: 16px;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 500px;
          margin-top: 16px;
        }

        .collection-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .collection-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border-color: var(--accent);
        }

        .collection-img {
          height: 200px;
          width: 100%;
          object-fit: cover;
          background: var(--bg-secondary);
        }

        @media (max-width: 768px) {
          .armario-info { flex-direction: column; padding: 90px 24px 32px; }
          .armario-avatar { left: 50%; transform: translateX(-50%) rotate(0deg); bottom: -60px; width: 120px; height: 120px; }
          .eco-badge-container { width: 100%; flex-wrap: wrap; justify-content: center; }
        }
      `}</style>

      <main style={{ minHeight: '100vh', background: 'var(--bg-secondary)', paddingBottom: 80 }}>
        
        <div style={{ background: 'var(--bg-primary)' }}>
          <div className="armario-banner">
            
            <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}>
              <Link 
                href="/explorar" 
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: '999px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)', color: 'white',
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontSize: 14, fontWeight: 700, textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s',
                }}
                className="hover:scale-105"
              >
                <ArrowLeft size={18} /> Volver a Explorar
              </Link>
            </div>

            <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
              <button 
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', color: 'var(--text-primary)',
                  border: 'none',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s',
                }}
                className="hover:scale-105"
              >
                <Share2 size={16} /> Compartir Perfil
              </button>
            </div>
            
            <div className="armario-avatar">
              {initials}
            </div>
          </div>
          
          <div className="armario-info">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 900, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
                  {nombreLimpio}
                </h1>
                <div style={{ background: '#10B981', color: 'white', padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Award size={14} /> ECO-BUYER
                </div>
              </div>
              <p style={{ fontSize: 18, color: 'var(--text-secondary)', margin: '0 0 16px', fontWeight: 600 }}>
                @{username}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--text-muted)', fontSize: 15 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={16} /> {location}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={16} /> Miembro desde {joinYear}
                </span>
              </div>

              <p className="armario-bio">
                Amante de la moda sostenible y de encontrar piezas únicas que cuenten una historia. Explorando tesoros vintage desde {joinYear}.
              </p>
            </div>
          </div>
        </div>

        {/* Colecciones / Wishlists */}
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '60px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899' }}>
              <Heart size={24} fill="currentColor" />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Colecciones de {nombreLimpio.split(' ')[0]}
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: '4px 0 0' }}>Sus prendas guardadas e inspiración de estilo.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {colecciones.map((col, idx) => (
              <div key={idx} className="collection-card">
                <img src={col.cover} alt={col.title} className="collection-img" />
                <div style={{ padding: '20px 24px' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>{col.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>{col.count} prendas guardadas</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 60, padding: '40px', background: 'var(--bg-primary)', borderRadius: 24, border: '1px dashed var(--border)', display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-muted)' }}>
              <Info size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>¿Qué es esto?</h4>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Este es un <strong>Armario Público simulado</strong>. En una versión futura, los compradores podrán decidir qué prendas o "Wishlists" quieren mostrar al mundo para inspirar a otros o recibir recomendaciones de vendedores.
              </p>
            </div>
          </div>
        </div>

      </main>
    </>
  )
}
