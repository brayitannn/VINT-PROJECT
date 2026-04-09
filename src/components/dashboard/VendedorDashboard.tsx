'use client'

import React from 'react'
import Link from 'next/link'
import { Plus, Package, Tag, ArrowRight } from 'lucide-react'
import { type MockUser } from '@/lib/supabase/mock-user'
import { DashboardNavbar, AccesoRapido } from './DashboardNavbar'

interface VendedorDashboardProps {
  user: MockUser
}

// Accesos rápidos removidos de aquí para centralizarlos en el hub

export function VendedorDashboard({ user }: VendedorDashboardProps) {
  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <>
      <style>{`
        .dash-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 60px 2rem;
          font-family: 'DM Sans', sans-serif;
        }
        
        .dash-greeting {
          animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          margin-bottom: 60px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .dash-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: 999px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          font-size: 16px;
          color: var(--text-secondary);
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .crud-hub {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 32px;
          padding: 48px;
          display: flex;
          flex-direction: column;
          gap: 40px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
          box-shadow: 0 20px 50px rgba(0,0,0,0.05);
          animation: fadeIn 1s ease forwards 0.2s;
          opacity: 0;
        }

        .hub-glow {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 300px;
          height: 300px;
          background: var(--accent);
          filter: blur(120px);
          opacity: 0.1;
          z-index: 0;
        }

        .hub-content {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 40px;
          flex-wrap: wrap;
        }

        .hub-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .hub-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 15px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
        }

        .hub-btn-primary {
          background: var(--accent);
          color: white;
          box-shadow: 0 10px 25px rgba(139, 94, 60, 0.25);
        }

        .hub-btn-primary:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(139, 94, 60, 0.35);
        }

        .hub-btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border);
        }

        .hub-btn-secondary:hover {
          background: var(--bg-card);
          transform: translateY(-3px);
          border-color: var(--accent);
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-10%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
      `}</style>

      <div className="dash-container">
        {/* GREETING SECTION (ENHANCED) */}
        <div className="dash-greeting" style={{ 
          marginBottom: 40, 
          marginTop: -20,
          position: 'relative',
          padding: '40px 0'
        }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '300px', height: '100px', background: 'var(--accent)', filter: 'blur(100px)', opacity: 0.05,
            zIndex: -1
          }}></div>

          <div className="dash-badge" style={{ 
            fontSize: 14, background: 'rgba(139, 94, 60, 0.05)', 
            border: '1px solid rgba(139, 94, 60, 0.1)',
            padding: '6px 16px', color: 'var(--accent)', fontWeight: 700,
            letterSpacing: '0.05em', textTransform: 'uppercase'
          }}>
            {saludo}
          </div>
          
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(40px, 6vw, 64px)',
            fontWeight: 900,
            color: 'var(--text-primary)',
            margin: '12px 0',
            lineHeight: 1
          }}>
            Hola, <span style={{ 
              background: 'linear-gradient(135deg, var(--accent) 0%, #A8724D 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>{user.name.split(' ')[0]}</span> <span style={{ fontSize: '0.8em', animation: 'bounce 2s infinite', display: 'inline-block' }}>✦</span>
          </h1>
          
          <p style={{ 
            fontSize: 22, 
            color: 'var(--text-secondary)', 
            maxWidth: 600, 
            lineHeight: 1.6, 
            margin: '0 auto', 
            textAlign: 'center',
            fontStyle: 'italic',
            opacity: 0.9,
            fontFamily: "'Playfair Display', serif"
          }}>
            Tu negocio va por buen camino.
          </p>
        </div>

        {/* Stats cards removidos */}

        {/* CENTRAL MANAGEMENT HUB */}
        <div className="crud-hub">
          <div className="hub-glow"></div>
          
          <div className="hub-content">
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                backgroundColor: 'rgba(139, 94, 60, 0.1)', color: 'var(--accent)',
                borderRadius: 999, fontSize: 13, fontWeight: 800,
                padding: '8px 20px', marginBottom: 24,
                backdropFilter: 'blur(10px)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                ✦ Centro de Gestión
              </div>
              
              <h2 style={{ 
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 900,
                color: 'var(--text-primary)',
                margin: '0 0 16px',
                lineHeight: 1.1
              }}>
                Administra tu Catálogo Personal
              </h2>
              
              <p style={{ 
                fontSize: 18, 
                color: 'var(--text-secondary)', 
                margin: 0, 
                maxWidth: 550, 
                lineHeight: 1.6,
                opacity: 0.8
              }}>
                Crea nuevas publicaciones, edita detalles de tus prendas o gestiona tu inventario en tiempo real. Todo desde una interfaz diseñada para tu éxito.
              </p>
            </div>

            <div className="hub-actions">
              <Link href="/products?new=true" className="hub-btn hub-btn-primary">
                <Plus size={20} /> Publicar Nueva Prenda
              </Link>
              <Link href="/products" className="hub-btn hub-btn-secondary">
                <Package size={20} /> Mis Prendas
              </Link>
              <Link href="/explorar" className="hub-btn hub-btn-secondary" style={{ opacity: 0.7 }}>
                <Tag size={20} /> Ver como Comprador
              </Link>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}