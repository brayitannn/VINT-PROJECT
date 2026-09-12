import React, { useEffect, useState, useCallback } from 'react'
import { X, Package, Clock, Plus, AlertCircle, Loader2, CheckCircle2, UserCheck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getMisVentas, type Pedido } from '@/services/pedidos'

interface MisVentasModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MisVentasModal({ isOpen, onClose }: MisVentasModalProps) {
  const [ventas, setVentas] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterQuery, setFilterQuery] = useState('')

  const fetchVentas = useCallback(() => {
    setLoading(true)
    setError(null)

    getMisVentas()
      .then(data => {
        // Excluir ventas canceladas del historial del vendedor
        const ventasActivas = (data || []).filter(v => v.estado !== 'cancelado')
        setVentas(ventasActivas)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error cargando ventas:', err)
        setError(err.message || 'No se pudieron cargar tus ventas')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!isOpen) return

    fetchVentas()

    const handleSync = () => {
      fetchVentas()
    }

    window.addEventListener('vint:pedido-cancelado', handleSync)
    window.addEventListener('vint:producto-actualizado', handleSync)

    return () => {
      window.removeEventListener('vint:pedido-cancelado', handleSync)
      window.removeEventListener('vint:producto-actualizado', handleSync)
    }
  }, [isOpen, fetchVentas])

  if (!isOpen) return null

  const formatPrice = (p: number) => `$${Number(p).toLocaleString('es-CO')} COP`
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const filteredVentas = ventas.filter(item =>
    item.titulo_prenda?.toLowerCase().includes(filterQuery.toLowerCase())
  )

  const totalRecaudado = ventas
    .filter(v => v.estado !== 'cancelado')
    .reduce((acc, curr) => acc + Number(curr.precio || 0), 0)

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: overlayFadeIn 0.3s ease;
          padding: 24px;
        }

        .modal-content {
          background: var(--bg-primary);
          width: 90%;
          max-width: 960px;
          max-height: 88vh;
          height: auto;
          border-radius: 32px;
          border: 1px solid var(--border);
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          overflow: hidden;
          animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 24px 32px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-card);
        }

        .transaction-list {
          padding: 24px 32px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 18px 22px;
          border-radius: 20px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          transition: all 0.2s ease;
        }

        .transaction-item:hover {
          transform: translateY(-2px);
          border-color: var(--accent);
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
        }

        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 768px) {
          .modal-overlay { padding: 0; align-items: flex-end; }
          .modal-content { width: 100%; max-height: 92vh; border-radius: 24px 24px 0 0; }
          .modal-header { padding: 20px 20px; }
          .transaction-list { padding: 16px 20px; }
          .transaction-item { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Playfair Display', serif", margin: '0 0 4px', color: 'var(--text-primary)' }}>
                Mis Ventas
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                Historial de tus prendas vendidas en Vint
              </p>
            </div>
            <button 
              onClick={onClose}
              style={{
                background: 'var(--bg-secondary)',
                border: 'none',
                width: 40, height: 40,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Controls & Summary */}
          <div style={{ padding: '20px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 240, maxWidth: 360 }}>
              <input
                type="text"
                placeholder="Buscar por nombre de prenda..."
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
            </div>

            {ventas.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Total Vendido: <strong style={{ color: 'var(--accent)', fontSize: 14 }}>{formatPrice(totalRecaudado)}</strong>
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                  ({ventas.length} {ventas.length === 1 ? 'venta' : 'ventas'})
                </span>
              </div>
            )}
          </div>

          {/* List Content */}
          <div className="transaction-list">
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 12 }}>
                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Cargando tus ventas...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{error}</p>
                <button
                  onClick={fetchVentas}
                  style={{ marginTop: 12, fontSize: 13, color: 'var(--accent)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Reintentar
                </button>
              </div>
            ) : filteredVentas.length === 0 ? (
              /* Estado Vacío */
              <div style={{ textAlign: 'center', padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-secondary)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                  color: 'var(--accent)', position: 'relative'
                }}>
                  <Package size={32} />
                  <div style={{
                    position: 'absolute', bottom: 0, right: 0, width: 24, height: 24,
                    background: 'var(--bg-primary)', borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border)'
                  }}>
                    <Clock size={12} color="var(--text-muted)" />
                  </div>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  {filterQuery ? 'No se encontraron resultados' : 'No hay ventas recientes'}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 300, margin: '0 auto 20px', lineHeight: 1.5 }}>
                  {filterQuery
                    ? 'Prueba buscando con otro término.'
                    : 'Aún no has vendido ninguna prenda. ¡Publica artículos y empieza a generar ingresos!'}
                </p>
                
                <Link href="/products?new=true" className="vint-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: 99, fontSize: 14, fontWeight: 700, textDecoration: 'none' }} onClick={onClose}>
                  <Plus size={18} /> Publicar Prenda
                </Link>
              </div>
            ) : (
              /* Lista con ventas */
              filteredVentas.map(venta => (
                <div key={venta.id} className="transaction-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* Imagen de la prenda */}
                    <div style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden', position: 'relative', background: 'var(--bg-secondary)', flexShrink: 0 }}>
                      {venta.imagen_prenda ? (
                        <Image
                          src={venta.imagen_prenda}
                          alt={venta.titulo_prenda}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          <Package size={24} />
                        </div>
                      )}
                    </div>

                    {/* Información */}
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                        {venta.titulo_prenda}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                        <span>{formatDate(venta.created_at)}</span>
                        <span>•</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#10b981', fontWeight: 600 }}>
                          <CheckCircle2 size={13} />
                          Vendida
                        </span>
                        {venta.nombre_comprador && (
                          <>
                            <span>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <UserCheck size={12} /> Comprador: {venta.nombre_comprador}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Precios */}
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>
                      {formatPrice(venta.precio)}
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-muted)'
                    }}>
                      {venta.metodo_pago === 'simulado' ? 'Pago Simulado' : venta.metodo_pago}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
