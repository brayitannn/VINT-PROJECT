'use client'

import Link from 'next/link'
import { Check, ShoppingBag, Copy, Calendar, Truck, Mail, ArrowRight, User, ShieldCheck } from 'lucide-react'
import { useEffect, useState, Suspense } from 'react'
import { useCart } from '@/context/CartContext'
import { useSearchParams } from 'next/navigation'

function ExitoContent() {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState('')
  const [copied, setCopied] = useState(false)
  const [dateStr, setDateStr] = useState('')

  const orderIdParam = searchParams.get('order_id')

  useEffect(() => {
    clearCart()

    if (orderIdParam) {
      setOrderNumber(orderIdParam.startsWith('VN-') ? orderIdParam : `VN-${orderIdParam.slice(0, 8).toUpperCase()}`)
    } else {
      setOrderNumber(`VN-${Math.floor(100000 + Math.random() * 900000).toString()}`)
    }

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
    setDateStr(new Date().toLocaleDateString('es-CO', options))
  }, [clearCart, orderIdParam])

  const handleCopy = () => {
    if (typeof window !== 'undefined' && orderNumber) {
      navigator.clipboard.writeText(orderNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div 
      style={{ padding: '40px 16px' }}
      className="min-h-[90vh] flex flex-col items-center justify-center text-center bg-[var(--bg-primary)]"
    >
      {/* Estilos locales */}
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
        <div className="absolute top-0 right-0 w-28 h-28 bg-[radial-gradient(circle,rgba(139,94,60,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-[radial-gradient(circle,rgba(139,94,60,0.05)_0%,transparent_70%)] pointer-events-none" />

        {/* Hero Area: Icono y Textos */}
        <div 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}
        >
          {/* Ícono de Éxito Animado */}
          <div className="relative animate-ring-scale">
            <div 
              style={{ borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)' }}
              className="w-20 h-20 rounded-full border-4 flex items-center justify-center bg-white dark:bg-[var(--bg-secondary)] shadow-inner animate-pulse-accent"
            >
              <svg className="w-10 h-10 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" className="animate-draw-check" />
              </svg>
            </div>
            {/* Badge flotante */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full text-white flex items-center justify-center border-2 border-white dark:border-[var(--bg-card)] shadow z-10 bg-emerald-500">
              <Check size={12} strokeWidth={3} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-[var(--text-primary)] tracking-tight">
              ¡Compra Confirmada!
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
              Tu pedido ha sido registrado con éxito en la base de datos. La prenda ha pasado a estado <strong className="text-emerald-600 font-semibold">Vendida</strong> y ya aparece en tu historial.
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
            Estado del pedido
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2">
            
            {/* Paso 1: Completado */}
            <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
                <Check size={14} strokeWidth={3} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight">Pago Simulado</h4>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Aprobado</p>
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

        {/* Recibo Digital Estilizado */}
        <div 
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 25%, transparent)',
            borderColor: 'var(--border)',
            padding: '24px'
          }}
          className="border border-dashed rounded-2xl w-full text-left relative overflow-hidden"
        >
          {/* Muescas de Boleto */}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            {/* Cabecera del ticket */}
            <div 
              style={{ borderBottomColor: 'var(--border)', paddingBottom: '16px' }}
              className="flex justify-between items-center border-b border-dashed w-full"
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                  ID de Pedido
                </span>
                <h3 className="text-lg font-mono font-bold text-[var(--accent)] mt-0.5">
                  {orderNumber}
                </h3>
              </div>
              <button 
                onClick={handleCopy}
                title="Copiar número de orden"
                style={{ borderColor: 'var(--border)' }}
                className="py-1.5 px-3 rounded-xl bg-white dark:bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] transition-colors border text-[var(--text-secondary)] cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
              >
                {copied ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
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
                  <Calendar size={13} className="text-[var(--text-secondary)]" /> Fecha
                </p>
                <p className="text-xs font-bold text-[var(--text-primary)]">{dateStr || 'Hoy'}</p>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                  <Truck size={13} className="text-[var(--text-secondary)]" /> Entrega Estimada
                </p>
                <p className="text-xs font-bold text-[var(--text-primary)]">2 - 4 días hábiles</p>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                  <ShieldCheck size={13} className="text-[var(--text-secondary)]" /> Método
                </p>
                <p className="text-xs font-bold text-emerald-600">Simulado</p>
              </div>
            </div>

            {/* Notificación */}
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
                Tu compra ha sido guardada en la base de datos y ya puedes verla en tu historial de <strong className="text-[var(--accent)]">Mis Compras</strong>.
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
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
            href="/dashboard/comprador" 
            className="vint-btn-secondary flex-1 py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 border text-sm cursor-pointer"
          >
            <User size={16} />
            Ver Mis Compras
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