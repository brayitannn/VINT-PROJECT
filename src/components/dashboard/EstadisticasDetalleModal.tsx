import React from 'react'
import { X, DollarSign, ShoppingBag, Clock, Package, ArrowUpRight, CheckCircle2, Truck } from 'lucide-react'
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

  // =========================================================================
  // 🚀 TODO: REEMPLAZAR DATOS SIMULADOS POR DATOS REALES DE LA BASE DE DATOS
  // =========================================================================
  // Actualmente la API de estadísticas solo devuelve los valores totales.
  // Cuando se cree el endpoint para traer el detalle, reemplazar estas constantes.
  
  const MOCK_INGRESOS = [
    { id: 1, fecha: 'Hoy, 10:45 AM', comprador: 'María G.', monto: 45000, prenda: 'Chaqueta de Cuero Vintage' },
    { id: 2, fecha: 'Ayer, 16:30 PM', comprador: 'Carlos R.', monto: 32000, prenda: 'Camiseta Estampada' },
    { id: 3, fecha: 'Ayer, 09:15 AM', comprador: 'Lucía P.', monto: 85000, prenda: 'Vestido de Noche' },
    { id: 4, fecha: 'Hace 3 días', comprador: 'Andrés M.', monto: 25000, prenda: 'Pantalón Jean Clásico' },
    { id: 5, fecha: 'Hace 5 días', comprador: 'Valentina S.', monto: 50000, prenda: 'Zapatos Deportivos' },
  ]

  const MOCK_PRENDAS = [
    { id: 1, prenda: 'Chaqueta de Cuero Vintage', talla: 'M', condicion: 'Excelente', precio: 45000, comprador: 'María G.' },
    { id: 2, prenda: 'Camiseta Estampada', talla: 'L', condicion: 'Bueno', precio: 32000, comprador: 'Carlos R.' },
    { id: 3, prenda: 'Vestido de Noche', talla: 'S', condicion: 'Muy Bueno', precio: 85000, comprador: 'Lucía P.' },
  ]

  const MOCK_PEDIDOS = [
    { id: 1, prenda: 'Buzo con Capucha', comprador: 'Daniel T.', estado: 'Pendiente de envío', fecha: 'Vence mañana' },
    { id: 2, prenda: 'Gafas de Sol Retro', comprador: 'Sofía L.', estado: 'En tránsito', fecha: 'Llega el Jueves' },
  ]
  // =========================================================================

  const getHeaderInfo = () => {
    switch (tipo) {
      case 'ingresos':
        return {
          titulo: 'Ingresos Totales',
          icono: <DollarSign size={24} className="text-[var(--accent)]" />,
          valor: stats ? `$${stats.ingresosTotal.toLocaleString('es-CO')}` : '—',
          subtitulo: 'Historial de tus ganancias recientes'
        }
      case 'prendas':
        return {
          titulo: 'Prendas Vendidas',
          icono: <ShoppingBag size={24} className="text-[var(--accent)]" />,
          valor: stats ? stats.prendasVendidas.toString() : '—',
          subtitulo: 'Tus artículos comercializados exitosamente'
        }
      case 'pedidos':
        return {
          titulo: 'Pedidos en Curso',
          icono: <Clock size={24} className="text-[var(--accent)]" />,
          valor: stats ? stats.pedidosEnCurso.toString() : '—',
          subtitulo: 'Artículos pendientes por procesar y enviar'
        }
    }
  }

  const headerInfo = getHeaderInfo()

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
          padding: 16px;
          border-radius: 16px;
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

        .ingreso-block:hover { border-color: var(--accent) !important; box-shadow: 0 12px 30px rgba(139,94,60,0.15); transform: translateY(-4px); }
        .ingreso-block:hover .monto-texto { opacity: 0; transform: scale(0.9); }
        .ingreso-block:hover .ingreso-tooltip { opacity: 1 !important; transform: scale(1) !important; }

        @media (max-width: 640px) {
          .est-modal-overlay { padding: 16px; align-items: flex-end; }
          .est-modal-content { border-radius: 24px 24px 0 0; max-height: 90vh; }
          .est-modal-header { padding: 24px 20px 20px; }
          .est-modal-body { padding: 20px; }
        }
      `}</style>

      <div className="est-modal-overlay" onClick={onClose}>
        <div className="est-modal-content" onClick={e => e.stopPropagation()}>
          
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
            
            {tipo === 'ingresos' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 32 }}>
                
                {/* GRÁFICA GIGANTE (MÁS DE LA MITAD DEL MODAL) */}
                <div style={{ 
                  flex: 1, minHeight: 350, background: 'var(--bg-secondary)', 
                  borderRadius: 24, padding: 32, position: 'relative', overflow: 'hidden',
                  display: 'flex', flexDirection: 'column'
                }}>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', zIndex: 10 }}>Crecimiento de Ingresos</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 24px', zIndex: 10 }}>Proyección visual de tus ganancias este mes</p>
                  
                  {/* Gráfica simulada con SVG fluido */}
                  <div style={{ flex: 1, position: 'relative', width: '100%', marginTop: 20 }}>
                    <svg viewBox="0 0 800 300" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,300 L0,200 C100,180 200,250 300,180 C400,110 500,190 600,120 C700,50 800,40 800,20 L800,300 Z" fill="url(#chartGradient)" />
                      <path d="M0,200 C100,180 200,250 300,180 C400,110 500,190 600,120 C700,50 800,40 800,20" fill="none" stroke="#10B981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="800" cy="20" r="8" fill="white" stroke="#10B981" strokeWidth="4" />
                    </svg>
                  </div>
                </div>

                {/* HISTORIAL DE TRANSACCIONES */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Historial de Transacciones</h3>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer' }} className="hover:text-[var(--accent)] transition-colors">Ver reporte completo</span>
                  </div>
                  
                  <div style={{ 
                    background: 'var(--bg-card)', border: '1px solid var(--border)', 
                    borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}>
                    {MOCK_INGRESOS.map((tx, idx) => (
                      <div key={tx.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '18px 24px',
                        borderBottom: idx === MOCK_INGRESOS.length - 1 ? 'none' : '1px solid var(--border)',
                        transition: 'background 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                          <div style={{ 
                            width: 44, height: 44, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981',
                            flexShrink: 0
                          }}>
                            <ArrowUpRight size={20} strokeWidth={2.5} />
                          </div>
                          <div>
                            <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                              {tx.prenda}
                            </p>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span>{tx.fecha}</span>
                              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }}></span>
                              <span>De: <strong>{tx.comprador}</strong></span>
                            </p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 900, fontSize: 16, color: '#10B981', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                            +${tx.monto.toLocaleString('es-CO')}
                          </p>
                          <span style={{ 
                            fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', 
                            background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: 8,
                            border: '1px solid var(--border)'
                          }}>
                            Completado
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {tipo === 'prendas' && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>Prendas recientemente vendidas</h3>
                {MOCK_PRENDAS.map((prenda) => (
                  <div key={prenda.id} className="est-list-item">
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                        <Package size={20} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', margin: '0 0 4px' }}>{prenda.prenda}</p>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 4, color: 'var(--text-secondary)' }}>
                            Talla {prenda.talla}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 4, color: 'var(--text-secondary)' }}>
                            {prenda.condicion}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--accent)', margin: 0 }}>
                        ${prenda.precio.toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tipo === 'pedidos' && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>Estado de tus pedidos activos</h3>
                {MOCK_PEDIDOS.map((pedido) => (
                  <div key={pedido.id} className="est-list-item">
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: pedido.estado.includes('tránsito') ? '#FEF3C7' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: pedido.estado.includes('tránsito') ? '#D97706' : 'var(--text-secondary)' }}>
                        {pedido.estado.includes('tránsito') ? <Truck size={18} /> : <Clock size={18} />}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', margin: '0 0 2px' }}>{pedido.prenda}</p>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Para: {pedido.comprador}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', margin: '0 0 2px' }}>
                        {pedido.estado}
                      </p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', margin: 0 }}>
                        {pedido.fecha}
                      </p>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 24, padding: 16, borderRadius: 16, border: '1px dashed var(--border)', textAlign: 'center', background: 'var(--bg-secondary)' }}>
                  <CheckCircle2 size={24} className="text-[#10B981] mx-auto mb-2" />
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>Todo al día</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>No tienes más pedidos atrasados por procesar.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
