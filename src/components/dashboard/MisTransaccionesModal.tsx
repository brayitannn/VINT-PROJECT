import React, { useEffect, useState } from 'react'
import { X, ShoppingBag, Clock, Filter, AlertCircle, Loader2, CheckCircle2, MapPin, XCircle, RotateCcw, Calendar } from 'lucide-react'
import Image from 'next/image'
import { getMisCompras, cancelarPedido, type Pedido } from '@/services/pedidos'

interface MisTransaccionesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MisTransaccionesModal({ isOpen, onClose }: MisTransaccionesModalProps) {
  const [compras, setCompras] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterQuery, setFilterQuery] = useState('')
  const [cancelingId, setCancelingId] = useState<string | null>(null)
  const [pedidoAConfirmar, setPedidoAConfirmar] = useState<Pedido | null>(null)
  const [selectedCompra, setSelectedCompra] = useState<Pedido | null>(null)

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    setLoading(true)
    setError(null)

    getMisCompras()
      .then(data => {
        if (isMounted) {
          // Excluir compras canceladas para que no aparezcan en el historial
          const comprasActivas = (data || []).filter(c => c.estado !== 'cancelado')
          setCompras(comprasActivas)
          setLoading(false)
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('Error cargando compras:', err)
          setError(err.message || 'No se pudieron cargar tus compras')
          setLoading(false)
        }
      })

    const handleSync = () => {
      getMisCompras().then(data => {
        if (isMounted) {
          setCompras((data || []).filter(c => c.estado !== 'cancelado'))
        }
      }).catch(console.error)
    }

    window.addEventListener('vint:pedido-cancelado', handleSync)

    return () => {
      isMounted = false
      window.removeEventListener('vint:pedido-cancelado', handleSync)
    }
  }, [isOpen])

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

  const formatFullDateTime = (dateStr: string) => {
    if (!dateStr) return 'Fecha no registrada'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return dateStr
    }
  }

  const filteredCompras = compras.filter(item =>
    item.titulo_prenda?.toLowerCase().includes(filterQuery.toLowerCase())
  )

  const handleConfirmCancel = async () => {
    if (!pedidoAConfirmar) return
    const pedidoId = pedidoAConfirmar.id
    try {
      setCancelingId(pedidoId)
      await cancelarPedido(pedidoId)

      // Remover inmediatamente el pedido del historial del comprador
      setCompras(prev => prev.filter(c => c.id !== pedidoId))

      // Cerrar el modal de detalle si corresponde a esta compra
      if (selectedCompra?.id === pedidoId) {
        setSelectedCompra(null)
      }

      // Cerrar modal de confirmación
      setPedidoAConfirmar(null)

      // Notificar a toda la aplicación para actualizar Mis Ventas, Mis Productos y Catálogo
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vint:pedido-cancelado', {
          detail: { pedidoId, idPrenda: pedidoAConfirmar.id_prenda }
        }))
        window.dispatchEvent(new CustomEvent('vint:producto-actualizado'))
      }
    } catch (err: any) {
      alert(err.message || 'Error al cancelar la compra')
    } finally {
      setCancelingId(null)
    }
  }

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

        .btn-cancel {
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #ef4444;
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .btn-cancel:hover {
          background: rgba(239, 68, 68, 0.08);
          border-color: #ef4444;
        }

        .btn-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .confirm-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(8px);
          z-index: 10005;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: overlayFadeIn 0.2s ease;
        }

        .confirm-modal-card {
          background: var(--bg-card);
          width: 100%;
          max-width: 440px;
          border-radius: 26px;
          border: 1px solid var(--border);
          box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.45);
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          animation: modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .confirm-icon-box {
          width: 58px;
          height: 58px;
          border-radius: 20px;
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }

        .confirm-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 10px;
        }

        .confirm-desc {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0 0 18px;
        }

        .confirm-badge {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: 14px;
          padding: 12px 16px;
          font-size: 12.5px;
          color: #d97706;
          line-height: 1.45;
          margin-bottom: 24px;
          text-align: left;
        }

        .confirm-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .btn-abort-confirm {
          flex: 1;
          padding: 12px 18px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-abort-confirm:hover {
          background: var(--bg-primary);
          border-color: var(--text-muted);
        }

        .btn-accept-confirm {
          flex: 1.25;
          padding: 12px 18px;
          border-radius: 999px;
          border: none;
          background: #ef4444;
          color: white;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
          transition: all 0.2s;
        }

        .btn-accept-confirm:hover {
          background: #dc2626;
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45);
        }

        .btn-accept-confirm:disabled, .btn-abort-confirm:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
          .detalle-compra-container { width: 100% !important; max-height: 92vh !important; border-radius: 24px 24px 0 0 !important; }
        }

        .detalle-compra-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(10px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: overlayFadeIn 0.25s ease;
        }

        .detalle-compra-container {
          background: var(--bg-card);
          width: 90%;
          max-width: 620px;
          max-height: 88vh;
          border-radius: 26px;
          border: 1px solid var(--border);
          box-shadow: 0 25px 60px -12px rgba(0,0,0,0.35);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Playfair Display', serif", margin: '0 0 4px', color: 'var(--text-primary)' }}>
                Mis Compras
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                Historial de tus pedidos confirmados en Vint
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

          {/* Controls */}
          <div style={{ padding: '20px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
              <input
                type="text"
                placeholder="Buscar en mis compras..."
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
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
              {compras.length} {compras.length === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>

          {/* List Content */}
          <div className="transaction-list">
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 12 }}>
                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Cargando tus compras...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{error}</p>
                <button
                  onClick={() => {
                    setLoading(true)
                    getMisCompras()
                      .then(setCompras)
                      .catch(e => setError(e.message))
                      .finally(() => setLoading(false))
                  }}
                  style={{ marginTop: 12, fontSize: 13, color: 'var(--accent)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Reintentar
                </button>
              </div>
            ) : filteredCompras.length === 0 ? (
              /* Estado Vacío */
              <div style={{ textAlign: 'center', padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-secondary)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                  color: 'var(--accent)', position: 'relative'
                }}>
                  <ShoppingBag size={32} />
                  <div style={{
                    position: 'absolute', bottom: 0, right: 0, width: 24, height: 24,
                    background: 'var(--bg-primary)', borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border)'
                  }}>
                    <Clock size={12} color="var(--text-muted)" />
                  </div>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  {filterQuery ? 'No se encontraron resultados' : 'No hay compras registradas'}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 300, margin: '0 auto 20px', lineHeight: 1.5 }}>
                  {filterQuery
                    ? 'Prueba buscando con otro término.'
                    : 'Aún no has realizado ninguna compra en Vint. ¡Explora el catálogo y encuentra tu próxima joya vintage!'}
                </p>
                
                <button className="vint-btn-primary" style={{ padding: '12px 28px', borderRadius: 99, fontSize: 14, fontWeight: 700 }} onClick={onClose}>
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              /* Lista con pedidos */
              filteredCompras.map(compra => (
                <div
                  key={compra.id}
                  className="transaction-item"
                  onClick={() => setSelectedCompra(compra)}
                  style={{ cursor: 'pointer' }}
                  title="Haz clic para ver el detalle completo de la compra"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* Imagen de la prenda */}
                    <div style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden', position: 'relative', background: 'var(--bg-secondary)', flexShrink: 0 }}>
                      {compra.imagen_prenda ? (
                        <Image
                          src={compra.imagen_prenda}
                          alt={compra.titulo_prenda}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          <ShoppingBag size={24} />
                        </div>
                      )}
                    </div>

                    {/* Información */}
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                        {compra.titulo_prenda}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} /> {formatDate(compra.created_at)}
                        </span>
                        <span>•</span>
                        {compra.estado === 'cancelado' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#ef4444', fontWeight: 600 }}>
                            <XCircle size={13} />
                            Cancelada
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#10b981', fontWeight: 600 }}>
                            <CheckCircle2 size={13} />
                            {compra.estado === 'completado' ? 'Comprado' : compra.estado}
                          </span>
                        )}
                        {compra.direccion_envio?.ciudad && (
                          <>
                            <span>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <MapPin size={12} /> {compra.direccion_envio.ciudad}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Precios y acciones */}
                  <div
                    style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: compra.estado === 'cancelado' ? 'var(--text-muted)' : 'var(--accent)',
                      textDecoration: compra.estado === 'cancelado' ? 'line-through' : 'none'
                    }}>
                      {formatPrice(compra.total || compra.precio)}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
                        {compra.metodo_pago === 'simulado' ? 'Pago Simulado' : compra.metodo_pago}
                      </span>
                    </div>

                    {/* Botón de Cancelar Compra */}
                    {compra.estado !== 'cancelado' && (
                      <div style={{ marginTop: 2 }}>
                        <button
                          onClick={() => setPedidoAConfirmar(compra)}
                          className="btn-cancel"
                          title="Cancelar compra y regresar prenda al catálogo"
                        >
                          <RotateCcw size={12} />
                          Cancelar compra
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE DETALLE COMPLETO DE LA COMPRA */}
      {selectedCompra && (
        <div className="detalle-compra-overlay" onClick={() => setSelectedCompra(null)}>
          <div className="detalle-compra-container" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              padding: '18px 26px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-primary)'
            }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)' }}>
                  Detalle de Compra
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '2px 0 0', color: 'var(--text-primary)' }}>
                  Pedido #{selectedCompra.id.slice(0, 8)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCompra(null)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: 'none',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto' }}>
              {/* Prenda Card */}
              <div style={{
                display: 'flex',
                gap: 18,
                padding: 16,
                borderRadius: 18,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                alignItems: 'center'
              }}>
                <div style={{
                  width: 90,
                  height: 90,
                  borderRadius: 14,
                  overflow: 'hidden',
                  position: 'relative',
                  background: 'var(--bg-primary)',
                  flexShrink: 0
                }}>
                  {selectedCompra.imagen_prenda ? (
                    <Image src={selectedCompra.imagen_prenda} alt={selectedCompra.titulo_prenda} fill className="object-cover" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <ShoppingBag size={28} />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 999,
                      background: selectedCompra.estado === 'cancelado' ? '#fee2e2' : '#dcfce7',
                      color: selectedCompra.estado === 'cancelado' ? '#b91c1c' : '#15803d'
                    }}>
                      {selectedCompra.estado === 'cancelado' ? 'Compra Cancelada' : 'Compra Exitosa'}
                    </span>
                  </div>
                  <h4 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                    {selectedCompra.titulo_prenda}
                  </h4>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>
                    {formatPrice(selectedCompra.total || selectedCompra.precio)}
                  </div>
                </div>
              </div>

              {/* Fecha y Hora Exacta de Compra (Almacenada en Base de Datos) */}
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(139, 94, 60, 0.1)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Calendar size={22} />
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                    Fecha y Hora de Compra
                  </span>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0 0' }}>
                    {formatFullDateTime(selectedCompra.created_at)}
                  </p>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Registrado en la tabla <code>public.pedidos</code> (con timestamp exacto)
                  </span>
                </div>
              </div>

              {/* Información de Envío */}
              {selectedCompra.direccion_envio && (
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '16px 20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <MapPin size={16} color="var(--accent)" />
                    <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
                      Datos de Envío
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 13 }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Destinatario</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{selectedCompra.direccion_envio.nombre || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Ciudad</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{selectedCompra.direccion_envio.ciudad || 'N/A'}</strong>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Dirección de Entrega</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{selectedCompra.direccion_envio.direccion || 'N/A'}</strong>
                    </div>
                    {selectedCompra.direccion_envio.telefono && (
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Teléfono</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{selectedCompra.direccion_envio.telefono}</strong>
                      </div>
                    )}
                    {selectedCompra.direccion_envio.info_adicional && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Notas de Entrega</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{selectedCompra.direccion_envio.info_adicional}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Resumen Económico */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '16px 20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>Prenda:</span>
                  <span style={{ fontWeight: 600 }}>{formatPrice(selectedCompra.precio)}</span>
                </div>
                {selectedCompra.total > selectedCompra.precio && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span>Costo de envío:</span>
                    <span style={{ fontWeight: 600 }}>{formatPrice(selectedCompra.total - selectedCompra.precio)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>Método de pago:</span>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{selectedCompra.metodo_pago === 'simulado' ? 'Pago Simulado' : selectedCompra.metodo_pago}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Total Pagado:</strong>
                  <strong style={{ color: 'var(--accent)', fontSize: 17 }}>{formatPrice(selectedCompra.total || selectedCompra.precio)}</strong>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 26px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-primary)'
            }}>
              {selectedCompra.estado !== 'cancelado' ? (
                <button
                  onClick={() => setPedidoAConfirmar(selectedCompra)}
                  disabled={cancelingId === selectedCompra.id}
                  className="btn-cancel"
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  <RotateCcw size={14} />
                  Cancelar Compra
                </button>
              ) : (
                <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <XCircle size={15} /> Compra anulada
                </span>
              )}

              <button
                onClick={() => setSelectedCompra(null)}
                className="vint-btn-primary"
                style={{ padding: '8px 24px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE CANCELACIÓN */}
      {pedidoAConfirmar && (
        <div className="confirm-modal-overlay" onClick={() => !cancelingId && setPedidoAConfirmar(null)}>
          <div className="confirm-modal-card" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon-box">
              <RotateCcw size={28} />
            </div>

            <h3 className="confirm-title">¿Cancelar esta compra?</h3>

            <p className="confirm-desc">
              ¿Estás seguro de que deseas anular tu pedido de{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{pedidoAConfirmar.titulo_prenda}</strong>?
            </p>

            <div className="confirm-badge">
              <strong>Importante:</strong> El pedido se anulará, se removerá de tu historial de compras y la prenda volverá a estar disponible de inmediato en el catálogo de VINT.
            </div>

            <div className="confirm-actions">
              <button
                onClick={() => setPedidoAConfirmar(null)}
                disabled={Boolean(cancelingId)}
                className="btn-abort-confirm"
              >
                No, mantener compra
              </button>

              <button
                onClick={handleConfirmCancel}
                disabled={Boolean(cancelingId)}
                className="btn-accept-confirm"
              >
                {cancelingId ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <RotateCcw size={15} />
                    Sí, confirmar cancelación
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

