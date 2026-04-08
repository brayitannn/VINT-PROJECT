'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, CreditCard, ChevronLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import Link from 'next/link'

export function CheckoutClient() {
  const router = useRouter()
  const { items, totalPrice, totalItems, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const shippingCost = 15000
  const finalTotal = totalPrice + shippingCost

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CO')} COP`
  }

  const handlePayment = () => {
    setIsProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setShowSuccess(true)
      clearCart()
    }, 2000)
  }

  if (showSuccess) {
    return (
      <div style={{
        minHeight: '80vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '20px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          backgroundColor: '#10B981', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24, animation: 'scaleIn 0.5s ease-out',
        }}>
          <CheckCircle2 size={48} />
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }} className="font-display">
          ¡Pedido Realizado!
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 400, fontSize: 16, marginBottom: 32 }}>
          Gracias por tu compra. Recibirás un correo con los detalles de tu pedido y el seguimiento del envío.
        </p>
        <Link 
          href="/explorar"
          style={{
            backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)',
            padding: '16px 32px', borderRadius: 14, textDecoration: 'none',
            fontWeight: 700, transition: 'transform 0.2s',
          }}
          className="hover:scale-105"
        >
          Volver a la Tienda
        </Link>
        <style>{`
          @keyframes scaleIn {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: 800, margin: '40px auto', padding: '0 20px',
      animation: 'fadeInUp 0.6s ease-out',
    }}>
      {/* Header */}
      <h1 style={{ 
        fontSize: 32, fontWeight: 800, marginBottom: 32, 
        color: 'var(--text-primary)' 
      }} className="font-display">
        Pago
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Card: Método de Pago */}
        <section style={{
          backgroundColor: 'var(--bg-card)', borderRadius: 24,
          border: '1px solid var(--border)', padding: '32px',
          boxShadow: '0 4px 20px var(--shadow)',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Método de Pago</h2>
          
          <div style={{
            border: '2px solid #E5E7EB', borderRadius: 16,
            padding: '40px 20px', textAlign: 'center',
            backgroundColor: 'white', cursor: 'pointer',
            transition: 'border-color 0.2s',
          }} className="hover:border-[#FF7A00]">
            <div style={{
              width: 64, height: 64, margin: '0 auto 16px',
              backgroundColor: '#FFF7ED', color: '#FF7A00',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 12,
            }}>
              <CreditCard size={32} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#374151', margin: '0 0 4px' }}>
              Pasarela de Pago Externa
            </h3>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
              Serás redirigido a nuestro procesador de pagos seguro
            </p>
          </div>
        </section>

        {/* Card: Resumen del Pedido */}
        <section style={{
          backgroundColor: 'var(--bg-card)', borderRadius: 24,
          border: '1px solid var(--border)', padding: '32px',
          boxShadow: '0 4px 20px var(--shadow)',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Resumen del Pedido</h2>
          
          {/* Item List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ 
                  width: 56, height: 56, position: 'relative', 
                  borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                  border: '1px solid var(--border)'
                }}>
                  <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {item.name} {item.quantity > 1 && <span style={{ color: 'var(--text-muted)' }}> (x{item.quantity})</span>}
                  </h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {formatPrice(item.price)}
                  </p>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                No hay productos en el resumen.
              </p>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 20px' }} />

          {/* Pricing Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280', fontSize: 15 }}>Subtotal</span>
              <span style={{ fontWeight: 600, color: '#374151' }}>{formatPrice(totalPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280', fontSize: 15 }}>Envío</span>
              <span style={{ fontWeight: 600, color: '#374151' }}>{formatPrice(shippingCost)}</span>
            </div>
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', 
              marginTop: 12, paddingTop: 12, 
              borderTop: '2px solid #E5E7EB' 
            }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Total</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#FF7A00' }}>{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <button
            onClick={() => router.back()}
            style={{
              flex: 1, padding: '16px', borderRadius: 14,
              backgroundColor: 'white', color: 'var(--text-primary)',
              border: '1px solid #D1D5DB', fontWeight: 700, fontSize: 15,
              cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            className="hover:bg-gray-50"
          >
            Volver al Carrito
          </button>
          <button
            onClick={handlePayment}
            disabled={items.length === 0 || isProcessing}
            style={{
              flex: 1, padding: '16px', borderRadius: 14,
              backgroundColor: isProcessing ? '#FED7AA' : '#FF7A00', 
              color: 'white', border: 'none', fontWeight: 700, fontSize: 15,
              cursor: items.length === 0 || isProcessing ? 'not-allowed' : 'pointer', 
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 4px 12px rgba(255, 122, 0, 0.25)',
            }}
            className={!isProcessing && items.length > 0 ? "hover:scale-[1.02] active:scale-[0.98]" : ""}
          >
            {isProcessing ? (
              'Procesando...'
            ) : (
              <>
                Proceder al Pago <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
