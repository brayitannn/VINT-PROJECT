'use client'

import { useEffect, useState } from 'react'
import { Package, Calendar, Tag, ChevronDown, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

interface OrderItem {
  titulo: string
  precio: number
  cantidad: number
  imagen_url: string
  talla?: string
}

interface Order {
  id: string
  numero_orden: string
  total: number
  estado: string
  fecha_pedido: string
  items?: OrderItem[]
}

export function ComprasContent() {
  const { user } = useAuth()
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const fetchOrders = async () => {
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('pedidos')
          .select('*, items:detalles_pedidos(*)')
          .eq('user_id', user.id)
          .order('fecha_pedido', { ascending: false })

        if (ordersError) throw ordersError
        setOrders(ordersData || [])
      } catch (err) {
        console.error('Error fetching orders:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user, supabase])

  const formatPrice = (p: number) => `$${Number(p).toLocaleString('es-CO')} COP`
  const formatDate = (d: string) => new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2].map(i => (
          <div key={i} style={{ height: 100, backgroundColor: 'var(--bg-secondary)', borderRadius: 20, animation: 'pulse 2s infinite' }} />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '60px 20px', textAlign: 'center'
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', backgroundColor: 'var(--bg-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 16
        }}>🛍️</div>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>Aún no tienes compras</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 260, margin: '0 0 20px' }}>
          Tus pedidos aparecerán aquí una vez que realices tu primera compra.
        </p>
        <a href="/explorar" style={{
          padding: '10px 20px', borderRadius: 10, backgroundColor: 'var(--accent)',
          color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none'
        }}>Explorar catálogo</a>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {orders.map(order => {
        const isExpanded = expandedOrder === order.id
        return (
          <div key={order.id} style={{
            backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 18, overflow: 'hidden', transition: 'all 0.3s ease'
          }}>
            <div
              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
              style={{
                padding: '16px 20px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: isExpanded ? 'var(--bg-secondary)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, backgroundColor: 'var(--accent-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
                }}>
                  <Package size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{order.numero_orden}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
                      padding: '1px 6px', borderRadius: 999,
                      backgroundColor: order.estado === 'completado' ? '#D1FAE5' : '#FEF3C7',
                      color: order.estado === 'completado' ? '#065F46' : '#92400E'
                    }}>{order.estado}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 11 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Calendar size={10} /> {formatDate(order.fecha_pedido)}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
              <ChevronDown size={16} style={{
                color: 'var(--text-muted)', transition: 'transform 0.3s',
                transform: isExpanded ? 'rotate(180deg)' : 'none'
              }} />
            </div>

            {isExpanded && (
              <div style={{ padding: '0 20px 16px', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ width: 38, height: 46, borderRadius: 6, overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }}>
                           {item.imagen_url && <img src={item.imagen_url} alt={item.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }} className="line-clamp-1">{item.titulo}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Tag size={9} /> {item.talla || 'Única'}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>{formatPrice(item.precio)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
