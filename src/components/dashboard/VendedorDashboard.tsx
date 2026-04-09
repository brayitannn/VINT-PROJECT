'use client'

import React from 'react'
import Link from 'next/link'
import { Plus, Package, Tag, ArrowRight } from 'lucide-react'
import { type MockUser } from '@/lib/supabase/mock-user'
import { DashboardNavbar, AccesoRapido } from './DashboardNavbar'

interface VendedorDashboardProps {
  user: MockUser
}

const ACCESOS_RAPIDOS: AccesoRapido[] = [
  { id: 'publicar', icon: Plus, label: 'Publicar Prenda', href: '/dashboard/prendas/nueva', accent: '#8B5E3C' },
  { id: 'mis-prendas', icon: Package, label: 'Mis Prendas', href: '/dashboard/prendas', accent: '#8B5E3C' },
  { id: 'catalogo', icon: Tag, label: 'Ver Catálogo', href: '/explorar', accent: '#8B5E3C' },
]

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

        .crud-banner {
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          background: linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%);
          animation: fadeIn 0.8s ease forwards 0.4s;
          opacity: 0;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
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
        {/* SALUDO ANIMADO (Idéntico a comprador) */}
        <div className="dash-greeting">
          <div className="dash-badge" style={{ margin: '0 0 20px 0' }}>
            {saludo}, <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{user.name.split(' ')[0]}</span> <span style={{ animation: 'bounce 2s infinite' }}>👋</span>
          </div>
          <p style={{ fontSize: 20, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.6, margin: '0 auto', textAlign: 'center' }}>
            Tu negocio va por buen camino. Tienes <strong style={{ color: 'var(--text-primary)' }}>{user.stats.publicaciones}</strong> prendas publicadas actualmente.
          </p>
        </div>

        {/* NAVBAR INTERACTIVA (Accesos Rápidos idénticos al comprador) */}
        <DashboardNavbar accesos={ACCESOS_RAPIDOS} />

        {/* MÓDULO CRUD BANNER */}
        <div className="crud-banner">
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              backgroundColor: 'var(--accent-light)', color: 'var(--accent)',
              border: '1px solid var(--accent)', borderRadius: 999,
              fontSize: 12, fontWeight: 700, padding: '6px 14px', marginBottom: 16,
            }}>
              ✦ Gestión de prendas
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Administra tus publicaciones
            </h3>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: 0, maxWidth: 450, lineHeight: 1.6 }}>
              Crea, edita y elimina tus prendas desde un solo lugar. Todo conectado en tiempo real con tu catálogo público.
            </p>
          </div>
          <Link href="/products" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            backgroundColor: 'var(--accent)', color: 'white',
            padding: '14px 28px', borderRadius: 14,
            textDecoration: 'none', fontSize: 15, fontWeight: 700,
            whiteSpace: 'nowrap', transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(139, 94, 60, 0.3)'
          }} className="hover:scale-105">
            Ir a mis prendas <ArrowRight size={18} />
          </Link>
        </div>

      </div>
    </>
  )
}