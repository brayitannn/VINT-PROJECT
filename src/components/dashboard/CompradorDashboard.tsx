'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Heart, ShoppingBag, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { type MockUser } from '@/lib/supabase/mock-user'

interface ProductoRecomendado {
  id_prenda: number
  titulo: string
  precio: number
  talla: string
  condicion: string
  vendedor: string
  imagen_principal: string
  categoria: string
  razon?: string
}

interface CompradorDashboardProps {
  user: MockUser
}

const ACCESOS_RAPIDOS = [
  { icon: Search, label: 'Explorar', href: '/explorar', color: '#6366F1' },
  { icon: Heart, label: 'Favoritos', href: '/favoritos', color: '#EC4899' },
  { icon: ShoppingBag, label: 'Mis Compras', href: '/compras', color: '#F59E0B' },
]

export function CompradorDashboard({ user }: CompradorDashboardProps) {
  const [recomendaciones, setRecomendaciones] = useState<ProductoRecomendado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargarRecomendaciones() {
      try {
        setLoading(true)
        const res = await fetch('/api/recomendaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user }),
        })
        if (!res.ok) throw new Error('Error al obtener recomendaciones')
        const data = await res.json()
        setRecomendaciones(data.recomendaciones ?? [])
      } catch (e) {
        setError('No se pudieron cargar las recomendaciones')
      } finally {
        setLoading(false)
      }
    }
    cargarRecomendaciones()
  }, [user])

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
          Tienes <strong style={{ color: 'var(--text-primary)' }}>{user.stats.favoritos}</strong> prendas en favoritos y <strong style={{ color: 'var(--text-primary)' }}>{user.stats.compras}</strong> compras realizadas.
        </p>
      </div>

      {/* ACCESOS RÁPIDOS */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Accesos rápidos</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {ACCESOS_RAPIDOS.map(({ icon: Icon, label, href, color }) => (
            <Link key={label} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 20px', borderRadius: 14,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              textDecoration: 'none', color: 'var(--text-primary)',
              fontSize: 14, fontWeight: 600,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              className="hover:-translate-y-0.5 hover:shadow-md"
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                backgroundColor: color + '20',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} style={{ color }} />
              </div>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* RECOMENDACIONES IA */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              backgroundColor: 'var(--accent-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Recomendado para ti
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Basado en tus preferencias · Generado con IA
              </p>
            </div>
          </div>
          <Link href="/explorar" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none',
          }}>
            Ver más <ArrowRight size={14} />
          </Link>
        </div>

        {loading && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '60px 0', gap: 12, color: 'var(--text-muted)',
          }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 14 }}>Analizando tus preferencias...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && (
          <div style={{
            padding: '20px', borderRadius: 14,
            backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
            color: '#991B1B', fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 20,
          }}>
            {recomendaciones.map((prenda) => (
              <div key={prenda.id_prenda} style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 16, overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                className="hover:-translate-y-1 hover:shadow-lg"
              >
                <div style={{ height: 180, overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', position: 'relative' }}>
                  {prenda.imagen_principal ? (
                    <img
                      src={prenda.imagen_principal}
                      alt={prenda.titulo}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                      Sin imagen
                    </div>
                  )}
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    backgroundColor: 'var(--accent)',
                    borderRadius: 999, padding: '2px 8px',
                    fontSize: 10, fontWeight: 700, color: 'white',
                  }}>
                    IA ✦
                  </div>
                </div>
                <div style={{ padding: '14px' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.3 }}
                    className="line-clamp-2"
                  >
                    {prenda.titulo}
                  </p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', margin: '0 0 6px' }}>
                    ${Number(prenda.precio).toLocaleString('es-CO')} COP
                  </p>
                  {prenda.razon && (
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.4, fontStyle: 'italic' }}>
                      {prenda.razon}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}