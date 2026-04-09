'use client'

import Image from 'next/image'
import { X, Trash2, Plus, Minus, ShoppingBag, ShoppingCart } from 'lucide-react'
import { useCart, SHIPPING_COST } from './CartContext'
import { useRouter } from 'next/navigation'

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-CO')} COP`
}

export function CartDrawer() {
  const { isOpen, closeCart, items, totalItems, totalPrice, totalWithShipping, removeItem, updateQuantity, clearCart } = useCart()
  const router = useRouter()

  const handleCheckout = () => {
    closeCart()
    router.push('/checkout')
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        style={{
          position: 'fixed', inset: 0, zIndex: 998,
          backgroundColor: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 999,
          width: 420,
          maxWidth: '100vw',
          backgroundColor: 'var(--bg-card)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-16px 0 48px rgba(0,0,0,0.15)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column',
        }}
        role="dialog"
        aria-label="Carrito de compras"
        aria-modal="true"
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: 'var(--bg-secondary)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: 'var(--accent)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShoppingCart size={20} />
            </div>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>
                Mi Carrito
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                {totalItems === 0 ? 'Vacío' : `${totalItems} ${totalItems === 1 ? 'artículo' : 'artículos'}`}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '1px solid var(--border)', background: 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', transition: 'all 0.2s',
            }}
            className="cart-close-btn"
            aria-label="Cerrar carrito"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            /* Empty state */
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', gap: 16,
              padding: '60px 20px', textAlign: 'center',
            }}>
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShoppingBag size={36} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Tu carrito está vacío
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Explora nuestras prendas y agrega tus favoritas aquí
                </p>
              </div>
              <button
                onClick={closeCart}
                style={{
                  marginTop: 8, padding: '12px 28px', borderRadius: 12,
                  backgroundColor: 'var(--accent)', color: 'white',
                  border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                className="cart-cta-btn"
              >
                Explorar prendas
              </button>
            </div>
          ) : (
            /* Items list */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Clear all */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                <button
                  onClick={clearCart}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 12, color: 'var(--text-muted)', display: 'flex',
                    alignItems: 'center', gap: 4, padding: '4px 8px',
                    borderRadius: 6, transition: 'all 0.2s',
                  }}
                  className="clear-cart-btn"
                >
                  <Trash2 size={12} /> Vaciar carrito
                </button>
              </div>

              {items.map(item => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 16, padding: 16,
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                    transition: 'box-shadow 0.2s',
                  }}
                  className="cart-item-card"
                >
                  {/* Image */}
                  <div style={{
                    width: 75, height: 90, borderRadius: 10, overflow: 'hidden',
                    flexShrink: 0, backgroundColor: 'var(--bg-card)',
                  }}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={75}
                      height={90}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontWeight: 700, fontSize: 14, color: 'var(--text-primary)',
                      marginBottom: 4, lineHeight: 1.3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                      Talla {item.size} · {item.condition}
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent)', marginBottom: 12 }}>
                      {formatPrice(item.price * item.quantity)}
                    </p>

                    {/* Quantity control */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{
                            width: 28, height: 28, borderRadius: 8,
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}
                          className="qty-btn"
                          aria-label="Reducir cantidad"
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{
                          minWidth: 32, textAlign: 'center',
                          fontWeight: 700, fontSize: 14, color: 'var(--text-primary)',
                        }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{
                            width: 28, height: 28, borderRadius: 8,
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}
                          className="qty-btn"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{
                          width: 28, height: 28, borderRadius: 8,
                          border: 'none', background: 'transparent',
                          color: '#EF4444', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                        className="remove-btn"
                        aria-label="Eliminar del carrito"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — summary + checkout */}
        {items.length > 0 && (
          <div style={{
            borderTop: '1px solid var(--border)',
            padding: '20px 24px',
            backgroundColor: 'var(--bg-secondary)',
            flexShrink: 0,
          }}>
            {/* Price breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>Subtotal ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>Envío</span>
                <span style={{ fontWeight: 600 }}>{formatPrice(SHIPPING_COST)}</span>
              </div>
              <div style={{
                borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4,
                display: 'flex', justifyContent: 'space-between',
                fontWeight: 800, fontSize: 18, color: 'var(--text-primary)',
              }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent)' }}>{formatPrice(totalWithShipping)}</span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleCheckout}
              style={{
                width: '100%', padding: '15px 24px',
                backgroundColor: 'var(--accent)', color: 'white',
                border: 'none', borderRadius: 14,
                fontWeight: 800, fontSize: 15, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
              className="checkout-btn"
            >
              <ShoppingBag size={18} />
              Ir a pagar
            </button>

            <p style={{
              textAlign: 'center', fontSize: 11, color: 'var(--text-muted)',
              marginTop: 10, marginBottom: 0,
            }}>
              🔒 Pago seguro · Devoluciones gratuitas
            </p>
          </div>
        )}

        {/* Internal styles */}
        <style>{`
          .cart-close-btn:hover {
            background-color: var(--bg-secondary) !important;
            border-color: var(--accent) !important;
            color: var(--text-primary) !important;
          }
          .cart-cta-btn:hover { opacity: 0.88; }
          .cart-item-card:hover { box-shadow: 0 2px 12px var(--shadow); }
          .qty-btn:hover {
            background-color: var(--accent) !important;
            border-color: var(--accent) !important;
            color: white !important;
          }
          .remove-btn:hover {
            background-color: rgba(239,68,68,0.08) !important;
            border-radius: 8px;
          }
          .clear-cart-btn:hover {
            color: #EF4444 !important;
            background-color: rgba(239,68,68,0.06) !important;
          }
          .checkout-btn:hover {
            opacity: 0.9;
            transform: translateY(-1px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important;
          }
        `}</style>
      </div>
    </>
  )
}
