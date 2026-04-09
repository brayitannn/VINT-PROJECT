'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingBag, CreditCard, ArrowLeft, Lock, ChevronRight } from 'lucide-react'
import { useCart, SHIPPING_COST } from '@/components/layout/CartContext'

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-CO')} COP`
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, totalWithShipping, clearCart } = useCart()

  // Si el carrito está vacío, redirigir
  useEffect(() => {
    if (items.length === 0) {
      router.replace('/explorar')
    }
  }, [items.length, router])

  const handleProceed = () => {
    // Guardar snapshot del pedido antes de limpiar el carrito
    const snapshot = {
      orderNumber: `ROPA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
      date: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }),
      total: totalWithShipping,
      items: items.map(i => ({ id: i.id, name: i.name, image: i.image, price: i.price, quantity: i.quantity })),
    }
    try { sessionStorage.setItem('vint_last_order', JSON.stringify(snapshot)) } catch { /* ignorar */ }
    clearCart()
    router.push('/checkout/exito')
  }

  if (items.length === 0) return null

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      padding: '40px 1rem',
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .checkout-card {
          animation: fadeInUp 0.4s ease forwards;
        }
        .method-option { transition: all 0.2s ease; cursor: pointer; }
        .method-option:hover {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px rgba(139,90,43,0.1);
        }
        .btn-back:hover {
          background-color: var(--bg-secondary) !important;
          border-color: var(--accent) !important;
        }
        .btn-proceed:hover {
          opacity: 0.88;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important;
        }
        .item-row { transition: background 0.15s; border-radius: 10px; }
        .item-row:hover { background-color: var(--bg-secondary); }
      `}</style>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32, animationDelay: '0s' }} className="checkout-card">
          <button
            onClick={() => router.back()}
            className="btn-back"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: 10, padding: '8px 16px', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
              marginBottom: 20, transition: 'all 0.2s',
            }}
          >
            <ArrowLeft size={15} /> Volver al Carrito
          </button>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 800, fontSize: 'clamp(24px, 3vw, 32px)',
            color: 'var(--text-primary)', margin: 0,
          }}>
            Pago
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* 1 — Método de Pago */}
          <section
            className="checkout-card"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              overflow: 'hidden',
              animationDelay: '0.05s', opacity: 0,
              boxShadow: '0 2px 12px var(--shadow)',
            }}
          >
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--bg-secondary)',
            }}>
              <h2 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', margin: 0 }}>
                Método de Pago
              </h2>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Pasarela externa — única opción */}
              <div
                className="method-option"
                style={{
                  border: '2px solid var(--accent)',
                  borderRadius: 14,
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: 'var(--bg-secondary)',
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  backgroundColor: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CreditCard size={26} color="white" />
                </div>
                <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', margin: 0 }}>
                  Pasarela de Pago Externa
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>
                  Serás redirigido a nuestro procesador de pagos seguro
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  marginTop: 4, color: 'var(--text-muted)', fontSize: 12,
                }}>
                  <Lock size={12} />
                  <span>Conexión cifrada SSL · 100% seguro</span>
                </div>
              </div>
            </div>
          </section>

          {/* 2 — Resumen del Pedido */}
          <section
            className="checkout-card"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              overflow: 'hidden',
              animationDelay: '0.1s', opacity: 0,
              boxShadow: '0 2px 12px var(--shadow)',
            }}
          >
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--bg-secondary)',
            }}>
              <h2 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', margin: 0 }}>
                Resumen del Pedido
              </h2>
            </div>

            <div style={{ padding: '16px 24px' }}>
              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 20 }}>
                {items.map(item => (
                  <div
                    key={item.id}
                    className="item-row"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '10px 8px',
                    }}
                  >
                    <div style={{
                      width: 52, height: 62, borderRadius: 8, overflow: 'hidden',
                      flexShrink: 0, backgroundColor: 'var(--bg-secondary)',
                    }}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={52} height={62}
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

              {/* Price rows */}
              <div style={{
                borderTop: '1px solid var(--border)',
                paddingTop: 16,
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)' }}>
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)' }}>
                  <span>Envío</span>
                  <span>{formatPrice(SHIPPING_COST)}</span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 18, fontWeight: 800,
                  color: 'var(--text-primary)',
                  borderTop: '1px solid var(--border)',
                  paddingTop: 12, marginTop: 2,
                }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--accent)' }}>{formatPrice(totalWithShipping)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* 3 — Botones */}
          <div
            className="checkout-card"
            style={{
              display: 'flex', gap: 12, flexWrap: 'wrap',
              animationDelay: '0.15s', opacity: 0,
            }}
          >
            <button
              onClick={() => router.back()}
              className="btn-back"
              style={{
                flex: 1, minWidth: 140,
                padding: '15px 24px', borderRadius: 14,
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontWeight: 700, fontSize: 15, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
            >
              <ArrowLeft size={16} />
              Volver al Carrito
            </button>

            <button
              onClick={handleProceed}
              className="btn-proceed"
              style={{
                flex: 2, minWidth: 200,
                padding: '15px 24px', borderRadius: 14,
                border: 'none',
                backgroundColor: 'var(--accent)',
                color: 'white',
                fontWeight: 800, fontSize: 15, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
            >
              <ShoppingBag size={18} />
              Proceder al Pago
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Trust badges */}
          <p style={{
            textAlign: 'center', fontSize: 12, color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Lock size={12} /> Pago 100% seguro · Devoluciones gratuitas · Vendedores verificados
          </p>

        </div>
      </div>
    </main>
  )
}
