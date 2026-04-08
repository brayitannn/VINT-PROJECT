'use client'

import React, { useEffect, useRef } from 'react'
import { X, ShoppingBag, Trash2, Plus, Minus, CreditCard } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import Image from 'next/image'

export function CartDrawer() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    isDrawerOpen, 
    setIsDrawerOpen, 
    totalPrice,
    totalItems
  } = useCart()
  
  const drawerRef = useRef<HTMLDivElement>(null)

  // Format price helper
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CO')} COP`
  }

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [setIsDrawerOpen])

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isDrawerOpen])

  if (!isDrawerOpen) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div 
        onClick={() => setIsDrawerOpen(false)}
        style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.3s ease-out',
        }} 
      />

      {/* Drawer */}
      <div 
        ref={drawerRef}
        style={{
          position: 'relative', width: '100%', maxWidth: 450,
          height: '100%', backgroundColor: 'var(--bg-primary)',
          boxShadow: '-8px 0 32px var(--shadow)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideInRight 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShoppingBag size={22} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Tu Carrito <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>({totalItems} ítems)</span>
            </h2>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 4, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background-color 0.2s',
            }}
            className="hover:bg-[var(--bg-secondary)]"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {items.length === 0 ? (
            <div style={{
              height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
              textAlign: 'center', color: 'var(--text-muted)',
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, marginBottom: 8,
              }}>🛒</div>
              <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Tu carrito está vacío</h3>
              <p style={{ fontSize: 14, maxWidth: 280 }}>¡Agrega algunas prendas increíbles para empezar tu colección!</p>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                style={{
                  marginTop: 8, padding: '12px 24px', borderRadius: 999,
                  backgroundColor: 'var(--accent)', color: 'white',
                  border: 'none', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Explorar Tienda
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {items.map((item) => (
                <div key={item.id} style={{
                  display: 'flex', gap: 16, padding: 12,
                  borderRadius: 16, backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}>
                  {/* Image */}
                  <div style={{
                    width: 90, height: 110, position: 'relative',
                    borderRadius: 12, overflow: 'hidden', flexShrink: 0,
                  }}>
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fill 
                      style={{ objectFit: 'cover' }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <h4 style={{ 
                          fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)',
                          lineClamp: 1, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1,
                        }}>
                          {item.name}
                        </h4>
                        <button 
                          onClick={() => removeItem(item.id)}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: '#EF4444', padding: 4, display: 'flex',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 8px' }}>
                        Talla {item.size} • {item.condition}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 15 }}>
                        {formatPrice(item.price)}
                      </span>
                      
                      {/* Quantity Control */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        backgroundColor: 'var(--bg-secondary)', padding: '4px 8px',
                        borderRadius: 999, border: '1px solid var(--border)',
                      }}>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex' }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: 13, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: '24px', backgroundColor: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Subtotal</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                {formatPrice(totalPrice)}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              Gastos de envío e impuestos calculados al finalizar la compra.
            </p>
            <button style={{
              width: '100%', padding: '16px', borderRadius: 14,
              backgroundColor: 'var(--accent)', color: 'white',
              border: 'none', fontSize: 16, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 10,
              boxShadow: '0 4px 12px var(--accent-light)',
            }}>
              <CreditCard size={20} /> Finalizar Compra
            </button>
          </div>
        )}

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>
      </div>
    </div>
  )
}
