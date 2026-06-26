'use client'

import Link from 'next/link'
import { Check, ShoppingBag, Copy, Calendar, Truck, Mail, ArrowRight, User, Clock, AlertCircle } from 'lucide-react'
import { useEffect, useState, Suspense } from 'react'
import { useCart } from '@/context/CartContext'
import { useSearchParams } from 'next/navigation'

// Mapa legible de métodos de pago que MP puede devolver
const PAYMENT_TYPE_LABELS: Record<string, string> = {
  credit_card: 'Tarjeta de Crédito',
  debit_card: 'Tarjeta de Débito',
  bank_transfer: 'Transferencia PSE',
  ticket: 'Efectivo',
  digital_wallet: 'Billetera Digital',
  atm: 'ATM',
  prepaid_card: 'Tarjeta Prepago',
}

function ExitoContent() {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState('')
  const [copied, setCopied] = useState(false)
  const [dateStr, setDateStr] = useState('')

  // Leer parámetros reales que envía Mercado Pago al redirigir
  const mpStatus = searchParams.get('status') || searchParams.get('collection_status') || 'approved'
  const mpPaymentId = searchParams.get('payment_id') || searchParams.get('collection_id') || ''
  const mpPaymentType = searchParams.get('payment_type') || ''
  const mpMerchantOrderId = searchParams.get('merchant_order_id') || ''

  const isApproved = mpStatus === 'approved'
  const isPending = mpStatus === 'pending' || mpStatus === 'in_process'

  useEffect(() => {
    // Solo limpiar el carrito si el pago fue aprobado
    if (isApproved) clearCart()

    // Usar el payment_id real de MP o generar uno de respaldo
    if (mpPaymentId) {
      setOrderNumber(`VN-${mpPaymentId}`)
    } else {
      setOrderNumber(`VN-${Math.floor(100000 + Math.random() * 900000).toString()}`)
    }

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
    setDateStr(new Date().toLocaleDateString('es-CO', options))
  }, [clearCart, isApproved, mpPaymentId])

  const handleCopy = () => {
    if (typeof window !== 'undefined' && orderNumber) {
      navigator.clipboard.writeText(orderNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div 
      style={{ padding: '24px 16px' }}
      className="min-h-[90vh] flex flex-col items-center justify-center text-center bg-[var(--bg-primary)]"
    >
      
      {/* Estilos locales para las animaciones del check y el ticket */}
      <style>{`
        @keyframes drawCheck {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes ringScale {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulseAccent {
          0% { box-shadow: 0 0 0 0 rgba(139, 94, 60, 0.4); }
          70% { box-shadow: 0 0 0 12px rgba(139, 94, 60, 0); }
          100% { box-shadow: 0 0 0 0 rgba(139, 94, 60, 0); }
        }
        .animate-draw-check {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
          animation: drawCheck 0.4s ease-out 0.3s forwards;
        }
        .animate-ring-scale {
          animation: ringScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-pulse-accent {
          animation: pulseAccent 2s infinite;
        }
      `}</style>

      {/* Tarjeta Principal Premium */}
      <div 
        style={{ 
          backgroundColor: 'var(--bg-card)', 
          borderColor: 'var(--border)',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px'
        }}
        className="border shadow-xl rounded-[32px] max-w-xl w-full relative overflow-hidden animate-fade-in-up"
      >
        {/* Adornos de Fondo Decorativo */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle,rgba(139,94,60,0.06)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[radial-gradient(circle,rgba(139,94,60,0.04)_0%,transparent_70%)] pointer-events-none" />

        {/* Banner de estado alternativo (Pendiente / Fallido) */}
        {!isApproved && (
          <div
            style={{
              backgroundColor: isPending ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
              borderColor: isPending ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)',
              padding: '14px 16px'
            }}
            className="w-full rounded-2xl border flex items-start gap-3 text-left"
          >
            {isPending
              ? <Clock size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              : <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            }
            <div>
              <p className="text-sm font-bold" style={{ color: isPending ? '#F59E0B' : '#EF4444' }}>
                {isPending ? 'Pago en proceso de verificación' : 'Pago no completado'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                {isPending
                  ? 'Tu pago está siendo verificado por MercadoPago. Te notificaremos cuando se confirme.'
                  : 'Hubo un problema con tu pago. Por favor intenta nuevamente o elige otro método.'
                }
              </p>
            </div>
          </div>
        )}

        {/* Hero Area: Icono y Textos */}
        <div 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}
        >
          {/* Ícono de Éxito / Pendiente Animado */}
          <div className="relative animate-ring-scale">
            <div 
              style={{ borderColor: isApproved ? 'color-mix(in srgb, var(--accent) 20%, transparent)' : 'rgba(245,158,11,0.3)' }}
              className="w-20 h-20 rounded-full border-4 flex items-center justify-center bg-white dark:bg-[var(--bg-secondary)] shadow-inner animate-pulse-accent"
            >
              {isApproved ? (
                <svg className="w-10 h-10 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" className="animate-draw-check" />
                </svg>
              ) : (
                <Clock className="w-10 h-10 text-amber-500" />
              )}
            </div>
            {/* Pequeño badge flotante */}
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full text-white flex items-center justify-center border-2 border-white dark:border-[var(--bg-card)] shadow z-10 ${isApproved ? 'bg-green-500' : 'bg-amber-400'}`}>
              <Check size={12} strokeWidth={3} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-[var(--text-primary)] tracking-tight">
              {isApproved ? '¡Pago Exitoso!' : isPending ? 'Pago Pendiente' : 'Pago No Completado'}
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
              {isApproved
                ? 'Tu compra ha sido procesada de forma segura. El vendedor ya está notificado y preparando todo.'
                : isPending
                ? 'Tu pago está en revisión. Una vez aprobado, el vendedor comenzará a preparar tu pedido.'
                : 'No pudimos procesar tu pago. Por favor regresa al checkout e intenta de nuevo.'
              }
            </p>
          </div>
        </div>

        {/* Rastreador de Estado de Envío (Stepper) */}
        <div 
          style={{ 
            borderColor: 'color-mix(in srgb, var(--border) 40%, transparent)',
            paddingTop: '24px',
            paddingBottom: '24px'
          }}
          className="w-full border-y text-left"
        >
          <h3 
            style={{ marginBottom: '20px' }}
            className="text-xs font-extrabold uppercase tracking-widest text-[var(--text-secondary)]"
          >
            Estado de tu pedido
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2">
            
            {/* Paso 1: Completado */}
            <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
                <Check size={14} strokeWidth={3} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight">Pago Recibido</h4>
                <p className="text-[10px] text-green-600 font-semibold mt-0.5">Completado</p>
              </div>
            </div>

            {/* Paso 2: Activo */}
            <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-md animate-pulse flex-shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight">Preparando Envío</h4>
                <p className="text-[10px] text-[var(--accent)] font-semibold mt-0.5">En proceso</p>
              </div>
            </div>

            {/* Paso 3: Pendiente */}
            <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 flex-1">
              <div 
                style={{ borderColor: 'var(--border)' }}
                className="w-8 h-8 rounded-full border-2 text-[var(--text-muted)] flex items-center justify-center flex-shrink-0 bg-[var(--bg-secondary)]/30"
              >
                <Truck size={14} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-[var(--text-muted)] leading-tight">En Camino</h4>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Próximamente</p>
              </div>
            </div>

            {/* Paso 4: Pendiente */}
            <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 flex-1">
              <div 
                style={{ borderColor: 'var(--border)' }}
                className="w-8 h-8 rounded-full border-2 text-[var(--text-muted)] flex items-center justify-center flex-shrink-0 bg-[var(--bg-secondary)]/30"
              >
                <ShoppingBag size={14} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-[var(--text-muted)] leading-tight">Entregado</h4>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Pendiente</p>
              </div>
            </div>

          </div>
        </div>

        {/* Recibo Digital Estilizado con Muescas Laterales */}
        <div 
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 25%, transparent)',
            borderColor: 'var(--border)',
            padding: '24px'
          }}
          className="border border-dashed rounded-2xl w-full text-left relative overflow-hidden"
        >
          {/* Muescas del Ticket (Efecto físico de boleto) */}
          <div 
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border)' 
            }}
            className="absolute top-1/2 -left-3.5 w-7 h-7 rounded-full border-r -translate-y-1/2 hidden sm:block z-10" 
          />
          <div 
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border)' 
            }}
            className="absolute top-1/2 -right-3.5 w-7 h-7 rounded-full border-l -translate-y-1/2 hidden sm:block z-10" 
          />

          {/* Contenedor aislado para evitar colapsos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            {/* Cabecera del ticket */}
            <div 
              style={{ borderBottomColor: 'var(--border)', paddingBottom: '16px' }}
              className="flex justify-between items-center border-b border-dashed w-full"
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                  Número de Orden
                </span>
                <h3 className="text-lg font-mono font-bold text-[var(--accent)] mt-0.5">
                  {orderNumber || 'VN-......'}
                </h3>
              </div>
              <button 
                onClick={handleCopy}
                title="Copiar número de orden"
                style={{ borderColor: 'var(--border)' }}
                className="py-1.5 px-3 rounded-xl bg-white dark:bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] transition-colors border text-[var(--text-secondary)] cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
              >
                {copied ? (
                  <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                    <Check size={14} /> ¡Copiado!
                  </span>
                ) : (
                  <>
                    <Copy size={13} />
                    <span className="text-xs font-bold">Copiar</span>
                  </>
                )}
              </button>
            </div>

            {/* Detalles rápidos */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', width: '100%' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                  <Calendar size={13} className="text-[var(--text-secondary)]" /> Fecha de Pago
                </p>
                <p className="text-xs font-bold text-[var(--text-primary)]">{dateStr || 'Cargando...'}</p>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                  <Truck size={13} className="text-[var(--text-secondary)]" /> Envío Estimado
                </p>
                <p className="text-xs font-bold text-[var(--text-primary)]">2 - 4 días hábiles</p>
              </div>
              {mpPaymentType && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                    <Mail size={13} className="text-[var(--text-secondary)]" /> Método de Pago
                  </p>
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    {PAYMENT_TYPE_LABELS[mpPaymentType] || mpPaymentType}
                  </p>
                </div>
              )}
            </div>

            {/* Notificación de envío */}
            <div 
              style={{ 
                backgroundColor: 'color-mix(in srgb, var(--accent) 5%, transparent)',
                borderColor: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                padding: '14px',
                display: 'flex',
                gap: '10px'
              }}
              className="rounded-xl border text-xs text-[var(--text-primary)] font-medium leading-relaxed"
            >
              <Mail size={16} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
              <div>
                Te hemos enviado un correo de confirmación con el resumen y pronto recibirás el número de guía para el rastreo.
              </div>
            </div>
          </div>
        </div>

        {/* Acciones del Checkout */}
        <div 
          style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}
          className="flex-col sm:flex-row"
        >
          <Link 
            href="/" 
            className="vint-btn-primary flex-1 py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md text-sm cursor-pointer"
          >
            <ShoppingBag size={16} />
            Seguir Comprando
          </Link>
          <Link 
            href="/perfil" 
            className="vint-btn-secondary flex-1 py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 border text-sm cursor-pointer"
          >
            <User size={16} />
            Ir a mi Perfil
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  )
}

export default function ExitoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[90vh] flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ExitoContent />
    </Suspense>
  )
}