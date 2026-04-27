'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Tag, TrendingUp, DollarSign, ShoppingBag, Clock, ArrowUpRight, ArrowDownRight, Minus, Store } from 'lucide-react'
import { type MockUser } from '@/lib/supabase/mock-user'
import { DashboardNavbar, AccesoRapido } from './DashboardNavbar'
import { MisVentasModal } from './MisVentasModal'
import { EstadisticasDetalleModal, type DetalleTipo } from './EstadisticasDetalleModal'
import { fetchEstadisticasVendedor, type EstadisticasVendedor } from '@/services/estadisticas'

interface VendedorDashboardProps {
  user: MockUser
}

const ACCESOS_RAPIDOS: AccesoRapido[] = [
  {
    id: 'mi-tienda',
    icon: Store,
    label: 'Mi Tienda',
    href: '/dashboard/vendedor/mi-tienda',
    accent: '#8B5E3C'
  },
  {
    id: 'mis-productos',
    icon: Package,
    label: 'Mis Productos',
    href: '/products',
    accent: '#8B5E3C'
  }
]

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

// ─── Component ────────────────────────────────────────────────────────────────
export function VendedorDashboard({ user }: VendedorDashboardProps) {
  const [modalVentas, setModalVentas] = useState(false)
  const [detalleActivo, setDetalleActivo] = useState<DetalleTipo | null>(null)
  const [stats, setStats] = useState<EstadisticasVendedor | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'

  useEffect(() => {
    // =========================================================================
    // 🚀 TODO: REEMPLAZAR DATOS SIMULADOS POR DATOS REALES DE LA BASE DE DATOS
    // =========================================================================
    // Actualmente la DB puede no tener transacciones, así que forzamos estos datos simulados.
    // Para volver a usar los datos reales de Supabase, borra el bloque del setTimeout
    // y descomenta las siguientes 4 líneas de código:
    //
    // fetchEstadisticasVendedor(user.id)
    //   .then(setStats)
    //   .catch(() => setStats(null))
    //   .finally(() => setLoadingStats(false))
    
    setTimeout(() => {
      setStats({
        ingresosTotal: 237000,
        ingresosMesAnterior: 195000, // Para dar un ~21% de crecimiento
        trendIngresos: [20, 35, 25, 60, 50, 80, 100],
        prendasVendidas: 3,
        prendasVendidasSemana: 1,
        pedidosEnCurso: 2
      })
      setLoadingStats(false)
    }, 600)
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
          margin-bottom: 48px;
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
          background: rgba(139, 94, 60, 0.08);
          transform: translateY(-3px);
          border-color: var(--accent);
          color: var(--accent);
          box-shadow: 0 8px 20px rgba(139, 94, 60, 0.12);
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

        /* ── Responsive ─────────────────────────────────────── */
        @media (max-width: 1024px) {
          .dash-container { padding: 40px 1.5rem; }
          .crud-hub { padding: 36px 32px; }
          .hub-content { flex-direction: column; align-items: flex-start; gap: 28px; }
          .stats-grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
        }

        @media (max-width: 640px) {
          .dash-container { padding: 28px 1rem; }
          .crud-hub { padding: 28px 20px; border-radius: 20px; }
          .hub-actions { flex-direction: column; width: 100%; }
          .hub-btn { width: 100%; justify-content: center; padding: 14px 20px; }
          .stats-grid { grid-template-columns: 1fr; }
          .stat-card { padding: 24px 20px; }
          .stat-value { font-size: 30px; }
          .stats-section-title { font-size: 18px; }
          .dash-greeting { margin-bottom: 28px; padding: 24px 0; }
        }
      `}</style>

      <div className="dash-container">
        {/* GREETING */}
        <div className="dash-greeting" style={{ marginBottom: 40, marginTop: -20, position: 'relative', padding: '40px 0' }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '300px', height: '100px', background: 'var(--accent)', filter: 'blur(100px)', opacity: 0.05, zIndex: -1
          }} />

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
            fontWeight: 900, color: 'var(--text-primary)',
            margin: '12px 0', lineHeight: 1
          }}>
            Hola, <span style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, #A8724D 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>{user.name.split(' ')[0]}</span>{' '}
            <span style={{ fontSize: '0.8em', animation: 'bounce 2s infinite', display: 'inline-block' }}>✦</span>
          </h1>

          <p style={{
            fontSize: 22, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.6,
            margin: '0 auto', textAlign: 'center', fontStyle: 'italic', opacity: 0.9,
            fontFamily: "'Playfair Display', serif"
          }}>
            Tu negocio va por buen camino.
          </p>
        </div>

        {/* CENTRAL MANAGEMENT HUB */}
        <div className="crud-hub">
          <div className="hub-glow" />

          <div className="hub-content">
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                backgroundColor: 'rgba(139, 94, 60, 0.1)', color: 'var(--accent)',
                borderRadius: 999, fontSize: 13, fontWeight: 800,
                padding: '8px 20px', marginBottom: 24,
                backdropFilter: 'blur(10px)',
                letterSpacing: '0.05em', textTransform: 'uppercase'
              }}>
                ✦ Centro de Gestión
              </div>

              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 900, color: 'var(--text-primary)',
                margin: '0 0 16px', lineHeight: 1.1
              }}>
                Administra tu Catálogo Personal
              </h2>

              <p style={{
                fontSize: 18, color: 'var(--text-secondary)', margin: 0,
                maxWidth: 550, lineHeight: 1.6, opacity: 0.8
              }}>
                Crea nuevas publicaciones, edita detalles de tus prendas o gestiona tu inventario en tiempo real. Todo desde una interfaz diseñada para tu éxito.
              </p>
            </div>

            <div className="hub-actions">
              <Link href="/dashboard/vendedor/mi-tienda" className="hub-btn hub-btn-secondary" style={{ backgroundColor: 'var(--accent)', color: 'white', border: 'none' }}>
                <Store size={20} /> Mi Tienda
              </Link>
              <Link href="/products" className="hub-btn hub-btn-secondary">
                <Package size={20} /> Mis Prendas
              </Link>
              <button onClick={() => setModalVentas(true)} className="hub-btn hub-btn-secondary" style={{ border: '1px solid var(--border)', cursor: 'pointer' }}>
                <TrendingUp size={20} /> Mis Ventas
              </button>
              <Link href="/explorar" className="hub-btn hub-btn-secondary">
                <Tag size={20} /> Ver como Comprador
              </Link>
            </div>
          </div>
        </div>

        {/* STATS SECTION */}
        <p className="stats-section-title">Tu Resumen</p>
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