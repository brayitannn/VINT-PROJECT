'use client'

import Link from 'next/link'
import { CheckCircle, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ExitoPage() {
  const [orderNumber, setOrderNumber] = useState('')

  useEffect(() => {
    setOrderNumber(`VN-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`)
  }, [])

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-xl max-w-md w-full flex flex-col items-center">
        
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-sm">
          <CheckCircle size={40} />
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">¡Pago Exitoso!</h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Tu orden ha sido procesada correctamente. Estamos preparando tus prendas para el envío.
        </p>

        <div className="bg-gray-50 w-full rounded-xl p-4 mb-8 border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Número de Orden
          </p>
          <p className="text-xl font-mono font-bold text-[var(--accent)]">
            {orderNumber || 'VN-......'}
          </p>
        </div>

        <Link 
          href="/" 
          className="w-full py-4 bg-[var(--accent)] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md"
        >
          <ShoppingBag size={18} />
          Seguir Comprando
        </Link>
      </div>
    </div>
  )
}