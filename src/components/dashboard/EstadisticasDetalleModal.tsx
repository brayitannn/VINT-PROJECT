import React from 'react'
import { X, DollarSign, ShoppingBag, Clock, Package, ArrowUpRight, CheckCircle2, Truck, Tag } from 'lucide-react'
import type { EstadisticasVendedor } from '@/services/estadisticas'

export type DetalleTipo = 'ingresos' | 'prendas' | 'pedidos'

interface EstadisticasDetalleModalProps {
  isOpen: boolean
  onClose: () => void
  tipo: DetalleTipo | null
  stats: EstadisticasVendedor | null
}

export function EstadisticasDetalleModal({ isOpen, onClose, tipo, stats }: EstadisticasDetalleModalProps) {
  if (!isOpen || !tipo) return null

  const getHeaderInfo = () => {
    switch (tipo) {
      case 'ingresos':
        return {
          titulo: 'Ingresos Totales',
          icono: <DollarSign size={24} className="text-[var(--accent)]" />,
          valor: stats ? `$${stats.ingresosTotal.toLocaleString('es-CO')} COP` : '$0 COP',
          subtitulo: 'Historial de tus ventas y ganancias reales'
        }
      case 'prendas':
        return {
          titulo: 'Prendas Vendidas',
          icono: <ShoppingBag size={24} className="text-[var(--accent)]" />,
          valor: stats ? stats.prendasVendidas.toString() : '0',
          subtitulo: 'Tus prendas comercializadas exitosamente'
        }
      case 'pedidos':
        return {
          titulo: 'Pedidos en Curso',
          icono: <Clock size={24} className="text-[var(--accent)]" />,
          valor: stats ? stats.pedidosEnCurso.toString() : '0',
          subtitulo: 'Artículos pendientes por procesar y enviar'
        }
    }
  }

  const headerInfo = getHeaderInfo()

  // Datos para la gráfica de ingresos de los últimos 6 días
  const trendData = stats?.trendIngresos ?? [0, 0, 0, 0, 0, 0]
  const trendLabels = stats?.trendLabels ?? ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Hoy']
  const maxTrend = Math.max(...trendData, 10000)

  // Generar coordenadas para la gráfica SVG dinámica
  const svgW = 800
  const svgH = 220
  const padX = 40
  const padTop = 30
  const padBottom = 30
  const chartHeight = svgH - padTop - padBottom

  const chartPoints = trendData.map((val, idx) => {
    const x = padX + (idx / Math.max(trendData.length - 1, 1)) * (svgW - padX * 2)
    const y = padTop + chartHeight - (val / maxTrend) * chartHeight
    return { x, y, val, label: trendLabels[idx] }
  })

  const pathD = chartPoints.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x},${pt.y}`
    const prev = chartPoints[i - 1]
    const cx = (prev.x + pt.x) / 2
    return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`
  }, '')

  const areaD = chartPoints.length > 0
    ? `${pathD} L ${chartPoints[chartPoints.length - 1].x},${svgH} L ${chartPoints[0].x},${svgH} Z`
    : ''

  const ventasList = stats?.ventasRecientes ?? []
  const pedidosList = stats?.pedidosActivos ?? []

  return (
    <>
      <style>{`
        .est-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          animation: overlayFadeIn 0.3s ease;
          padding: 24px;
        }

        .est-modal-content {
          background: var(--bg-primary);
          width: 90%; max-width: 1400px;
          height: 90vh;
          border-radius: 32px;
          border: 1px solid var(--border);
          box-shadow: 0 30px 60px rgba(0,0,0,0.15);
          overflow: hidden;
          animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex; flex-direction: column;
        }

        .est-modal-header {
          padding: 32px 32px 24px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(180deg, var(--bg-card) 0%, var(--bg-primary) 100%);
          display: flex; justify-content: space-between; align-items: flex-start;
          position: relative;
        }

        .est-modal-body {
          padding: 24px 32px;
          overflow-y: auto;
          flex: 1;
        }

        .est-list-item {
          padding: 16px 20px;
          border-radius: 20px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          margin-bottom: 12px;
          transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: space-between;
        }

        .est-list-item:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
        }

        @keyframes overlayFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .chart-point-dot:hover {
          r: 8px;
          filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.6));
        }

        @media (max-width: 640px) {
          .est-modal-overlay { padding: 16px; align-items: flex-end; }
          .est-modal-content { border-radius: 24px 24px 0 0; max-height: 90vh; }
          .est-modal-header { padding: 24px 20px 20px; }
          .est-modal-body { padding: 20px; }
        }
      `}</style>

      <div className="est-modal-overlay" onClick={onClose}>
        <div className="est-modal-content" onClick={e => e.stopPropagation()}>
          
          {/* HEADER */}
          <div className="est-modal-header">
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(139, 94, 60, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {headerInfo.icono}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  {headerInfo.titulo}
                </p>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, margin: '0 0 6px' }}>
                  {headerInfo.valor}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                  {headerInfo.subtitulo}
                </p>
              </div>
            </div>

            <button onClick={onClose} style={{ background: 'var(--bg-secondary)', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <X size={18} />
            </button>
          </div>

          <div className="est-modal-body">
            
            {/* ─── DETALLE DE INGRESOS TOTALES ─── */}
            {tipo === 'ingresos' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 32 }}>
                
                {/* GRÁFICA REAL CON DATOS DINÁMICOS */}
                <div style={{ 
                  flex: 1, minHeight: 340, background: 'var(--bg-secondary)', 
                  borderRadius: 24, padding: 32, position: 'relative', overflow: 'hidden',
                  display: 'flex', flexDirection: 'column'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, zIndex: 10 }}>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>Evolución de Ingresos Recientes</h3>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Registro de ingresos por ventas en los últimos días</p>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '6px 14px', borderRadius: 12, border: '1px solid var(--border)', fontSize: 13, fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ArrowUpRight size={16} /> Total: ${stats?.ingresosTotal.toLocaleString('es-CO')} COP
                    </div>
                  </div>
                  
                  {/* SVG Dinámico con datos reales */}
                  <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: 180 }}>
                    <svg viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="chartGradientReal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Área rellena */}
                      {areaD && <path d={areaD} fill="url(#chartGradientReal)" />}
                      
                      {/* Línea de tendencia */}
                      {pathD && (
                        <path 
                          d={pathD} 
                          fill="none" 
                          stroke="#10B981" 
                          strokeWidth="4" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                        />
                      )}

                      {/* Puntos y valores */}
                      {chartPoints.map((pt, i) => (
                        <g key={i}>
                          <circle 
                            cx={pt.x} 
                            cy={pt.y} 
                            r="5" 
                            fill="white" 
                            stroke="#10B981" 
                            strokeWidth="3" 
                            className="chart-point-dot"
                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                          />
                          {pt.val > 0 && (
                            <text 
                              x={pt.x} 
                              y={Math.max(pt.y - 12, 16)} 
                              textAnchor="middle" 
                              fill="var(--text-primary)" 
                              fontSize="11" 
                              fontWeight="800"
                            >
                              ${pt.val.toLocaleString('es-CO')}
                            </text>
                          )}
                        </g>
                      ))}
                    </svg>
                  </div>

                  {/* Etiquetas de fechas eje X */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px 0', borderTop: '1px solid var(--border)' }}>
                    {chartPoints.map((pt, i) => (
                      <span key={i} style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                        {pt.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* HISTORIAL REAL DE TRANSACCIONES */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Historial de Ventas Completadas</h3>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
                      {ventasList.length} {ventasList.length === 1 ? 'venta' : 'ventas'} registradas
                    </span>
                  </div>
                  
                  {ventasList.length > 0 ? (
                    <div style={{ 
                      background: 'var(--bg-card)', border: '1px solid var(--border)', 
                      borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                    }}>
                      {ventasList.map((tx, idx) => (
                        <div key={tx.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '18px 24px',
                          borderBottom: idx === ventasList.length - 1 ? 'none' : '1px solid var(--border)',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            {tx.imagen ? (
                              <img 
                                src={tx.imagen} 
                                alt={tx.prenda} 
                                style={{ width: 48, height: 48, borderRadius: 14, objectFit: 'cover', border: '1px solid var(--border)' }}
                              />
                            ) : (
                              <div style={{ 
                                width: 48, height: 48, borderRadius: 14, background: 'rgba(16, 185, 129, 0.1)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981',
                                flexShrink: 0
                              }}>
                                <ArrowUpRight size={22} strokeWidth={2.5} />
                              </div>
                            )}

                            <div>
                              <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                                {tx.prenda}
                              </p>
                              <div style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span>{tx.fecha}</span>
                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }}></span>
                                <span>Comprador: <strong style={{ color: 'var(--text-primary)' }}>{tx.comprador}</strong></span>
                                {tx.talla && (
                                  <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 6, color: 'var(--text-secondary)' }}>
                                    Talla {tx.talla}
                                  </span>
                                )}
                                {tx.condicion && (
                                  <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 6, color: 'var(--text-secondary)' }}>
                                    {tx.condicion}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: 900, fontSize: 17, color: '#10B981', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                              +${tx.monto.toLocaleString('es-CO')} COP
                            </p>
                            <span style={{ 
                              fontSize: 11, fontWeight: 700, color: '#10B981', 
                              background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: 8,
                              border: '1px solid rgba(16, 185, 129, 0.2)'
                            }}>
                              Completado
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-secondary)', borderRadius: 24, border: '1px dashed var(--border)' }}>
                      <DollarSign size={40} className="mx-auto text-[var(--text-muted)] mb-3" />
                      <p style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', margin: '0 0 6px' }}>No hay transacciones registradas aún</p>
                      <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0, maxWidth: 460, marginInline: 'auto' }}>
                        Cuando vendas tus prendas, aquí verás el desglose detallado de los ingresos reales recibidos.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ─── DETALLE DE PRENDAS VENDIDAS ─── */}
            {tipo === 'prendas' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>Prendas Comercializadas Exitosamente</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Historial de artículos que han sido comprados y completados</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
                    Total: {ventasList.length} prendas
                  </span>
                </div>

                {ventasList.length > 0 ? (
                  ventasList.map((prenda) => (
                    <div key={prenda.id} className="est-list-item">
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        {prenda.imagen ? (
                          <img 
                            src={prenda.imagen} 
                            alt={prenda.prenda} 
                            style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', border: '1px solid var(--border)' }}
                          />
                        ) : (
                          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                            <Package size={24} />
                          </div>
                        )}
                        <div>
                          <p style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                            {prenda.prenda}
                          </p>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            {prenda.talla && (
                              <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 6, color: 'var(--text-secondary)' }}>
                                Talla {prenda.talla}
                              </span>
                            )}
                            {prenda.condicion && (
                              <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 6, color: 'var(--text-secondary)' }}>
                                {prenda.condicion}
                              </span>
                            )}
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                              Vendido a: <strong style={{ color: 'var(--text-primary)' }}>{prenda.comprador}</strong>
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              • {prenda.fecha}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 900, fontSize: 17, color: 'var(--accent)', margin: '0 0 4px' }}>
                          ${prenda.monto.toLocaleString('es-CO')} COP
                        </p>
                        <span style={{ 
                          fontSize: 11, fontWeight: 700, color: '#10B981', 
                          background: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: 6 
                        }}>
                          Vendido
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-secondary)', borderRadius: 24, border: '1px dashed var(--border)' }}>
                    <ShoppingBag size={40} className="mx-auto text-[var(--text-muted)] mb-3" />
                    <p style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', margin: '0 0 6px' }}>No has vendido prendas todavía</p>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0, maxWidth: 460, marginInline: 'auto' }}>
                      Las prendas que vendas aparecerán aquí con su fotografía, talla, comprador y valor de compra.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ─── DETALLE DE PEDIDOS EN CURSO ─── */}
            {tipo === 'pedidos' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>Pedidos Pendientes por Procesar</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Artículos que requieren envío o confirmación de entrega</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
                    {pedidosList.length} pedidos activos
                  </span>
                </div>

                {pedidosList.length > 0 ? (
                  pedidosList.map((pedido) => (
                    <div key={pedido.id} className="est-list-item">
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        {pedido.imagen ? (
                          <img 
                            src={pedido.imagen} 
                            alt={pedido.prenda} 
                            style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border)' }}
                          />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: 12, background: pedido.estado.includes('tránsito') ? '#FEF3C7' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: pedido.estado.includes('tránsito') ? '#D97706' : 'var(--text-secondary)' }}>
                            {pedido.estado.includes('tránsito') ? <Truck size={20} /> : <Clock size={20} />}
                          </div>
                        )}
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', margin: '0 0 2px' }}>{pedido.prenda}</p>
                          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Para: <strong style={{ color: 'var(--text-primary)' }}>{pedido.comprador}</strong></p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', margin: '0 0 2px' }}>
                          {pedido.estado}
                        </p>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', margin: 0 }}>
                          ${pedido.monto.toLocaleString('es-CO')} COP
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ marginTop: 12, padding: 32, borderRadius: 24, border: '1px dashed var(--border)', textAlign: 'center', background: 'var(--bg-secondary)' }}>
                    <CheckCircle2 size={32} className="text-[#10B981] mx-auto mb-2" />
                    <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>Todo al día</p>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>No tienes pedidos pendientes de envío ni procesamientos atrasados.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
