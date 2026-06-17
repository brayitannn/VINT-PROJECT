'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Tag, TrendingUp, DollarSign, ShoppingBag, Clock, ArrowUpRight, ArrowDownRight, Minus, Store } from 'lucide-react'
import { type MockUser } from '@/lib/supabase/mock-user'
import { useAuth } from '@/context/AuthContext'
import { useCompradorStats } from '@/hooks/useCompradorStats'
import { MisVentasModal } from './MisVentasModal'
import { EstadisticasDetalleModal, type DetalleTipo } from './EstadisticasDetalleModal'
import { fetchEstadisticasVendedor, type EstadisticasVendedor } from '@/services/estadisticas'
import { ProfileCoverHeader, type AccesoRapido } from './ProfileCoverHeader'

interface VendedorDashboardProps {
  user: MockUser
}

// ─── Mini Sparkline SVG ───────────────────────────────────────────────────────
function Sparkline({ data, color = '#10B981' }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data)
  const range = max - min || 1
  const W = 80, H = 32, pad = 2
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2)
    const y = H - pad - ((v - min) / range) * (H - pad * 2)
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      <polyline points={points} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="stat-card" style={{ gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--bg-secondary)', animation: 'pulse 1.5s ease infinite' }} />
      <div style={{ height: 14, width: '60%', borderRadius: 6, background: 'var(--bg-secondary)', animation: 'pulse 1.5s ease infinite' }} />
      <div style={{ height: 36, width: '75%', borderRadius: 6, background: 'var(--bg-secondary)', animation: 'pulse 1.5s ease infinite' }} />
      <div style={{ height: 12, width: '45%', borderRadius: 6, background: 'var(--bg-secondary)', animation: 'pulse 1.5s ease infinite' }} />
    </div>
  )
}

export function VendedorDashboard({ user }: VendedorDashboardProps) {
  const { user: authUser } = useAuth()
  const { stats: userStats } = useCompradorStats()
  const [modalVentas, setModalVentas] = useState(false)
  const [detalleActivo, setDetalleActivo] = useState<DetalleTipo | null>(null)
  const [stats, setStats] = useState<EstadisticasVendedor | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  const tagline = authUser?.user_metadata?.descripcion || 'Impulsando la moda circular'

  const ACCESOS_RAPIDOS: AccesoRapido[] = [
    { id: 'mi-tienda', icon: Store, label: 'Mi Tienda', href: '/dashboard/vendedor/mi-tienda', accent: '#8B5E3C' },
    { id: 'mis-productos', icon: Package, label: 'Mis Productos', href: '/products', accent: '#8B5E3C' },
    { id: 'mis-ventas', icon: TrendingUp, label: 'Mis Ventas', onClick: () => setModalVentas(true), accent: '#8B5E3C' },
    { id: 'ver-comprador', icon: Tag, label: 'Comprar', href: '/explorar', accent: '#8B5E3C' },
  ]

  useEffect(() => {
    // =========================================================================
    // 🚀 TODO: REEMPLAZAR DATOS SIMULADOS POR DATOS REALES DE LA BASE DE DATOS
    // =========================================================================
    // Actualmente la DB puede no tener transacciones, así que forzamos estos datos simulados.
    // Para volver a usar los datos reales de Supabase, borra el bloque del setTimeout
    // y descomenta las siguientes 4 líneas de código:
    //
    fetchEstadisticasVendedor(user.id)
      .then(setStats)
      .catch((e) => {
        console.error("Error fetching stats:", e)
        setStats(null)
      })
      .finally(() => setLoadingStats(false))
    // =========================================================================
  }, [user.id])

  // Porcentaje de variación vs mes anterior
  const varPct = stats
    ? stats.ingresosMesAnterior > 0
      ? Math.round(((stats.ingresosTotal - stats.ingresosMesAnterior) / stats.ingresosMesAnterior) * 100)
      : stats.ingresosTotal > 0 ? 100 : 0
    : null
  const varPositivo = (varPct ?? 0) >= 0
  const trendColor = varPositivo ? '#10B981' : '#EF4444'

  return (
    <>
      <style>{`
        .dash-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 60px 2rem;
          font-family: 'DM Sans', sans-serif;
        }
        /* STATS CARDS */
        .stats-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 24px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          animation: fadeUp 0.8s ease backwards 0.3s;
        }

        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          cursor: pointer;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.06);
          border-color: var(--accent);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(139, 94, 60, 0.1);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }

        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 38px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .stat-footer {
          font-size: 13px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }

        .stat-trend {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-weight: 700;
          font-size: 13px;
        }

        .stat-trend.positive { color: #10B981; }
        .stat-trend.negative { color: #EF4444; }
        .stat-trend.neutral  { color: var(--text-muted); }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-10%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @media (max-width: 1024px) {
          .dash-container { padding: 40px 1.5rem; }
          .stats-grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
        }

        @media (max-width: 640px) {
          .dash-container { padding: 28px 1rem; }
          .stats-grid { grid-template-columns: 1fr; }
          .stat-card { padding: 24px 20px; }
          .stat-value { font-size: 30px; }
          .stats-section-title { font-size: 18px; }
        }
      `}</style>

      <div className="dash-container">
        <ProfileCoverHeader
          name={user.name}
          email={user.email}
          avatarUrl={user.avatar || null}
          stats={[
            { value: stats?.prendasVendidas || 0, label: 'ventas' },
            { value: userStats.seguidos, label: 'seguidos' },
            { value: userStats.seguidores, label: 'seguidores' }
          ]}
          tagline={tagline}
          accesos={ACCESOS_RAPIDOS}
        />

        <div style={{ marginTop: 40 }}>
          <p className="stats-section-title">Tu Rendimiento Comercial</p>
        <div className="stats-grid">
          {loadingStats ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              {/* Ingresos Totales */}
              <div className="stat-card" onClick={() => setDetalleActivo('ingresos')}>
                <div className="stat-icon"><DollarSign size={22} /></div>
                <div className="stat-title">Ingresos Totales</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
                  <div className="stat-value">
                    {stats
                      ? `$${stats.ingresosTotal.toLocaleString('es-CO')}`
                      : '—'}
                  </div>
                  {stats && <Sparkline data={stats.trendIngresos} color={trendColor} />}
                </div>
                <div className="stat-footer">
                  {varPct !== null ? (
                    <>
                      <span className={`stat-trend ${varPositivo ? 'positive' : 'negative'}`}>
                        {varPositivo
                          ? <ArrowUpRight size={14} />
                          : <ArrowDownRight size={14} />}
                        {varPositivo ? '+' : ''}{varPct}%
                      </span>
                      vs mes anterior
                    </>
                  ) : (
                    <span className="stat-trend neutral"><Minus size={14} /> Sin datos aún</span>
                  )}
                </div>
              </div>

              {/* Prendas Vendidas */}
              <div className="stat-card" onClick={() => setDetalleActivo('prendas')}>
                <div className="stat-icon"><ShoppingBag size={22} /></div>
                <div className="stat-title">Prendas Vendidas</div>
                <div className="stat-value">
                  {stats ? stats.prendasVendidas : '—'}
                </div>
                <div className="stat-footer">
                  {stats && stats.prendasVendidasSemana > 0 ? (
                    <>
                      <span className="stat-trend positive">
                        <ArrowUpRight size={14} />
                        +{stats.prendasVendidasSemana}
                      </span>
                      esta semana
                    </>
                  ) : (
                    <span className="stat-trend neutral"><Minus size={14} /> Sin ventas esta semana</span>
                  )}
                </div>
              </div>

              {/* Pedidos en Curso */}
              <div className="stat-card" onClick={() => setDetalleActivo('pedidos')}>
                <div className="stat-icon"><Clock size={22} /></div>
                <div className="stat-title">Pedidos en Curso</div>
                <div className="stat-value">
                  {stats ? stats.pedidosEnCurso : '—'}
                </div>
                <div className="stat-footer">
                  Pendientes por enviar y confirmar
                </div>
              </div>
            </>
          )}
        </div>
        </div>

        {/* MODAL MIS VENTAS */}
        <MisVentasModal isOpen={modalVentas} onClose={() => setModalVentas(false)} />

        {/* MODAL DETALLES DE ESTADÍSTICAS */}
        <EstadisticasDetalleModal 
          isOpen={detalleActivo !== null} 
          onClose={() => setDetalleActivo(null)} 
          tipo={detalleActivo}
          stats={stats}
        />
      </div>
    </>
  )
}