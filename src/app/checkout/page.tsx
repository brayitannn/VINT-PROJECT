'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart, SHIPPING_COST } from '../../components/layout/CartContext'
import { CreditCard, Truck, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-CO')} COP`
}

export default function CheckoutPage() {
  const { items, totalItems, totalPrice, totalWithShipping, clearCart } = useCart()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    setTimeout(() => {
      clearCart()
      router.push('/checkout/exito')
    }, 2000)
  }

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 text-[#4A3B32]">Tu carrito está vacío</h1>
        <Link href="/" className="px-6 py-3 bg-[var(--accent)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
          Volver a la tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 pt-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Formulario de Pago y Envío */}
        <div className="lg:col-span-7 space-y-8">
          <form id="checkout-form" onSubmit={handlePayment} className="space-y-8">
            
            {/* Sección de Envío */}
            <section className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck size={20} className="text-[var(--accent)]" />
                Datos de Envío
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Nombre completo</label>
                  <input required type="text" className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all" placeholder="Ej. Bryan Calderón" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Teléfono</label>
                  <input required type="tel" className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all" placeholder="Ej. 300 123 4567" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500">Dirección de entrega</label>
                  <input required type="text" className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all" placeholder="Ej. Calle 123 #45-67, Bogotá" />
                </div>
              </div>
            </section>

            {/* Sección de Tarjeta */}
            <section className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-[var(--accent)]" />
                Método de Pago
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500">Número de Tarjeta</label>
                  <input required type="text" maxLength={19} className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all font-mono tracking-widest" placeholder="0000 0000 0000 0000" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Fecha de Expiración</label>
                  <input required type="text" maxLength={5} className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all font-mono" placeholder="MM/YY" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">CVC</label>
                  <input required type="text" maxLength={4} className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all font-mono" placeholder="123" />
                </div>
              </div>
            </section>

          </form>
        </div>

        {/* Resumen de la Orden */}
        <div className="lg:col-span-5">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Resumen de la orden</h2>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 relative">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                    <span className="absolute -top-2 -right-2 bg-gray-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-md">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Talla {item.size}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({totalItems} prendas)</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Envío</span>
                <span>{formatPrice(SHIPPING_COST)}</span>
              </div>
              <div className="flex justify-between text-lg font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total a pagar</span>
                <span className="text-[var(--accent)]">{formatPrice(totalWithShipping)}</span>
              </div>
            </div>

            <button
              form="checkout-form"
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-[var(--accent)] text-white font-bold text-lg hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Procesando...
                </>
              ) : (
                `Pagar ${formatPrice(totalWithShipping)}`
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}