'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-CO')} COP`
}

function generateOrderNumber(): string {
  const num = Math.floor(Math.random() * 900) + 100
  return `ROPA-${new Date().getFullYear()}-${String(num).padStart(3, '0')}`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/* Guardamos los datos del pedido en sessionStorage para mostrarlos en
   esta página aunque el carrito ya se haya vaciado. */
interface OrderSnapshot {
  orderNumber: string
  date: string
  total: number
  items: Array<{ id: number; name: string; image: string; price: number; quantity: number }>
}

export default function CheckoutExitoPage() {
  const [order, setOrder] = useState<OrderSnapshot | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Animación de entrada
    const t = setTimeout(() => setShow(true), 80)

    // Leer snapshot guardado por la página anterior
    try {
      const raw = sessionStorage.getItem('vint_last_order')
      if (raw) {
        setOrder(JSON.parse(raw))
        sessionStorage.removeItem('vint_last_order')
        return () => clearTimeout(t)
      }
    } catch { /* ignorar */ }

    // Fallback: crear orden de demostración
    setOrder({
      orderNumber: generateOrderNumber(),
      date: formatDate(new Date()),
      total: 0,
      items: [],
    })

    return () => clearTimeout(t)
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      padding: '60px 1rem',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    }}>
      <style>{`
        @keyframes bounceIn {
          0%   { transform: scale(0.3); opacity: 0; }
          50%  { transform: scale(1.1); }
          70%  { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ringPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.35); }
          50%       { box-shadow: 0 0 0 18px rgba(16,185,129,0); }
        }
        .success-icon  { animation: bounceIn 0.6s cubic-bezier(0.36,0.07,0.19,0.97) forwards; }
        .success-ring  { animation: ringPulse 2s ease infinite 0.6s; }
        .fade-card     { opacity: 0; animation: fadeUp 0.5s ease forwards; }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important; }
        .btn-secondary:hover { background-color: var(--bg-secondary) !important; border-color: var(--accent) !important; }
        .order-item { padding: 10px 8px; border-radius: 10px; transition: background 0.15s; }
        .order-item:hover { background-color: var(--bg-secondary); }
      `}</style>

      <div style={{ maxWidth: 640, width: '100%' }}>

        {/* ────── Success icon ────── */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginBottom: 36, gap: 20,
          opacity: show ? 1 : 0, transition: 'opacity 0.3s',
        }}>
          <div
            className="success-ring"
            style={{
              width: 96, height: 96, borderRadius: '50%',
              backgroundColor: 'rgba(16,185,129,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div className="success-icon">
              <CheckCircle2 size={64} color="#10B981" strokeWidth={1.8} />
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 800, fontSize: 'clamp(26px, 4vw, 34px)',
              color: 'var(--text-primary)', margin: '0 0 8px',
            }}>
              ¡Compra Exitosa!
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>
              Tu pedido ha sido confirmado y está siendo procesado.
            </p>
          </div>
        </div>

        {/* ────── Order detail card ────── */}
        {order && (
          <section
            className="fade-card"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 4px 24px var(--shadow)',
              animationDelay: '0.35s',
            }}
          >
            {/* Card header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--bg-secondary)',
            }}>
              <h2 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', margin: 0 }}>
                Detalles del Pedido
              </h2>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Meta rows */}
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 10,
                marginBottom: 24,
              }}>
                {[
                  { label: 'Número de orden:', value: order.orderNumber, accent: true },
                  { label: 'Fecha:', value: order.date, accent: false },
                  ...(order.total > 0
                    ? [{ label: 'Total pagado:', value: formatPrice(order.total), accent: true }]
                    : []),
                ].map(row => (
                  <div
                    key={row.label}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{row.label}</span>
                    <span style={{
                      fontWeight: row.accent ? 700 : 500,
                      color: row.accent ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Items (si los hay) */}
              {order.items.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  {order.items.map(item => (
                    <div key={item.id} className="order-item" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 50, height: 60, borderRadius: 8, overflow: 'hidden',
                        flexShrink: 0, backgroundColor: 'var(--bg-secondary)',
                      }}>
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50} height={60}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontWeight: 600, fontSize: 14, color: 'var(--text-primary)',
                          margin: '0 0 2px',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name}
                        </p>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ────── Action buttons ────── */}
        <div
          className="fade-card"
          style={{
            display: 'flex', gap: 12, flexWrap: 'wrap',
            marginTop: 24, animationDelay: '0.5s',
          }}
        >
          <Link
            href="/dashboard"
            className="btn-primary"
            style={{
              flex: 1, minWidth: 160,
              padding: '14px 24px', borderRadius: 14,
              backgroundColor: 'var(--accent)', color: 'white',
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            }}
          >
            Ver Mis Pedidos
          </Link>

          <Link
            href="/explorar"
            className="btn-secondary"
            style={{
              flex: 1, minWidth: 160,
              padding: '14px 24px', borderRadius: 14,
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            Seguir Comprando
          </Link>
        </div>

      </div>
    </main>
  )
}
