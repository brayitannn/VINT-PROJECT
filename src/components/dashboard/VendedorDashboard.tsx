'use client'

import Link from 'next/link'
import { Plus, Package, Tag, ArrowRight } from 'lucide-react'
import { type MockUser } from '@/lib/supabase/mock-user'

interface VendedorDashboardProps {
  user: MockUser
}

const ACCESOS_RAPIDOS = [
  { icon: Plus, label: 'Publicar Prenda', href: '/dashboard/prendas/nueva', color: '#10B981', destacado: true },
  { icon: Package, label: 'Mis Prendas', href: '/dashboard/prendas', color: '#6366F1' },
  { icon: Tag, label: 'Ver Catálogo', href: '/explorar', color: '#F59E0B' },
]

export function VendedorDashboard({ user }: VendedorDashboardProps) {
  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 2rem' }}>

      {/* SALUDO */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 6 }}>{saludo} 👋</p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 900, color: 'var(--text-primary)',
          lineHeight: 1.2, margin: 0,
        }}>
          Hola, <span style={{ color: 'var(--accent)' }}>{user.name.split(' ')[0]}</span>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 8 }}>
          Tienes <strong style={{ color: 'var(--text-primary)' }}>{user.stats.publicaciones}</strong> prendas publicadas actualmente.
        </p>
      </div>

      {/* ACCESOS RÁPIDOS */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Accesos rápidos</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {ACCESOS_RAPIDOS.map(({ icon: Icon, label, href, color, destacado }) => (
            <Link key={label} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 20px', borderRadius: 14,
              backgroundColor: destacado ? 'var(--accent)' : 'var(--bg-card)',
              border: destacado ? 'none' : '1px solid var(--border)',
              textDecoration: 'none',
              color: destacado ? 'white' : 'var(--text-primary)',
              fontSize: 14, fontWeight: 600,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              className="hover:-translate-y-0.5 hover:shadow-md"
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                backgroundColor: destacado ? 'rgba(255,255,255,0.2)' : color + '20',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} style={{ color: destacado ? 'white' : color }} />
              </div>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* BANNER CRUD */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 20, padding: '32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 20, flexWrap: 'wrap',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)',
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            backgroundColor: 'var(--accent-light)', color: 'var(--accent)',
            border: '1px solid var(--accent)', borderRadius: 999,
            fontSize: 11, fontWeight: 700, padding: '4px 12px', marginBottom: 12,
          }}>
            ✦ Gestión de prendas
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            Administra tus publicaciones
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, maxWidth: 400 }}>
            Crea, edita y elimina tus prendas desde un solo lugar. El módulo CRUD estará disponible muy pronto.
          </p>
        </div>
        <Link href="/dashboard/prendas" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          backgroundColor: 'var(--accent)', color: 'white',
          padding: '12px 24px', borderRadius: 12,
          textDecoration: 'none', fontSize: 14, fontWeight: 700,
          whiteSpace: 'nowrap',
        }}>
          Ir a mis prendas <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}