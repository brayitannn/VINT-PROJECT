"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, SHIPPING_COST } from "../../components/layout/CartContext";
import { Loader2, ArrowLeft, User, Phone, MapPin, CreditCard, Calendar, Lock } from "lucide-react";
import Image from "next/image";

// --- Utilidades de Formateo ---
const formatPrice = (price: number) => `$${price.toLocaleString('es-CO')} COP`;

const formatCardNumber = (value: string) => {
  return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim().slice(0, 19);
};

const formatExpiry = (value: string) => {
  return value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1/').slice(0, 5);
};

// --- Input idéntico al de Login ---
const CheckoutInput = ({ icon: Icon, ...props }: any) => (
  <div className="relative group w-full">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent)] z-20 pointer-events-none" />
    <input
      {...props}
      className="w-full h-[60px] text-[16px] transition-all duration-300 outline-none vint-input bg-[var(--bg-secondary)]"
      style={{
         borderRadius: "18px",
         border: "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
         color: "var(--text-primary)",
         paddingLeft: "52px",
         paddingRight: "20px"
      }}
    />
  </div>
);

export default function CheckoutPage() {
  const { items, totalItems, totalPrice, totalWithShipping, clearCart } = useCart();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({ card: '', expiry: '', cvc: '' });

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    clearCart();
    router.push('/checkout/exito');
  };

  return (
    <div className="min-h-screen pb-32 flex flex-col items-center relative w-full overflow-hidden">
      
      {/* estilos globales */}
      <style jsx global>{`
        .vint-input::placeholder {
          color: var(--text-muted) !important;
          opacity: 0.7;
          font-weight: 500;
        }
        .vint-input:focus {
          box-shadow: 0 0 0 2px var(--accent) !important;
          border-color: transparent !important;
          background-color: transparent !important;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      
      {/* Fondo Absoluto de Imagen (Toda la Pantalla) */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[var(--bg-primary)]"> 
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ease-out sm:scale-105 opacity-60"
          style={{ backgroundImage: "url('/img/checkout.png')" }}
        />
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[var(--bg-primary)]/60" />
      </div>

      <br /><div className="w-full max-w-2xl mx-auto px-4 flex flex-col items-center gap-12 pt-8 md:pt-16 relative z-10">

         {/* 1. RESUMEN DE COMPRA (Arriba) */}
         <div className="w-full bg-[var(--bg-primary)]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-10 flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/20 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          
          <h2 className="text-[24px] font-bold mb-6 tracking-tight px-2" style={{ color: "var(--text-primary)" }}>
            Tu Orden
          </h2>
          
          {/* Productos */}
          <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[var(--border)] [&::-webkit-scrollbar-thumb]:rounded-full">
            {items.map(item => (
              <div key={item.id} className="bg-[var(--bg-secondary)]/80 rounded-[24px] p-5 flex gap-5 shadow-sm border border-white/30 group">
                {/* Imagen del Producto */}
                <div className="w-[85px] h-[105px] rounded-[16px] bg-[var(--bg-primary)] overflow-hidden relative flex-shrink-0 transition-transform group-hover:scale-105 shadow-sm">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                
                {/* Información del Producto */}
                <div className="flex flex-col justify-center flex-1 min-w-0">
                  <h3 className="text-[17px] font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                    {item.name}
                  </h3>
                  <p className="text-[14px] mt-1 font-medium" style={{ color: "var(--text-secondary)" }}>
                    Talla {item.size} • Cant. {item.quantity}
                  </p>
                  
                  <p className="text-[18px] font-black mt-3" style={{ color: "var(--accent)" }}>
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="bg-[var(--bg-primary)]/40 border border-[var(--border)]/30 backdrop-blur-md rounded-[24px] p-6 space-y-4 shadow-sm">
            <div className="flex justify-between text-[15px] font-bold" style={{ color: "var(--text-secondary)" }}>
              <span>Subtotal</span>
              <span style={{ color: "var(--text-primary)" }}>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-[15px] font-bold" style={{ color: "var(--text-secondary)" }}>
              <span>Carga de envío</span>
              <span style={{ color: "var(--text-primary)" }}>{formatPrice(SHIPPING_COST)}</span>
            </div>
            
            <div className="flex justify-between items-end pt-5 mt-3 border-t-2 border-dashed border-[var(--border)]">
              <span className="text-[14px] font-extrabold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
                Total Final
              </span>
              <span className="text-[30px] font-black leading-none tracking-tighter" style={{ color: "var(--text-primary)" }}>
                {formatPrice(totalWithShipping)}
              </span>
            </div>
          </div>
          
        </div>
         
         {/* 2. FORMULARIO DE PAGO Y ENVÍO (Abajo) */}
         <div className="w-full bg-[var(--bg-card)] rounded-[32px] p-6 sm:p-10 shadow-xl border border-[var(--border)] animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
              <div className="flex flex-col gap-2">
                <h2 className="text-[32px] font-bold tracking-tight leading-tight" style={{ color: "var(--text-primary)" }}>
                  Finalizar Compra
                </h2>
                <p className="text-[15px] font-medium" style={{ color: "var(--text-muted)" }}>
                  Ingresa tus datos para recibir tu nuevo estilo.
                </p>
              </div>
              <Link 
                href="/carrito" 
                className="inline-flex items-center gap-2 text-sm font-bold transition-all hover:-translate-x-1" 
                style={{ color: "var(--accent)" }}
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al carrito
              </Link>
            </div>

            <form onSubmit={handlePayment} className="flex flex-col gap-8">
              
              {/* Sección de Envío */}
              <div className="flex flex-col gap-4">
                <h3 className="text-[13px] font-bold uppercase tracking-widest ml-1" style={{ color: "var(--text-primary)" }}>Envío</h3>
                <CheckoutInput icon={User} required type="text" placeholder="Nombre completo" />
                <CheckoutInput icon={Phone} required type="tel" placeholder="Teléfono" />
                <CheckoutInput icon={MapPin} required type="text" placeholder="Dirección de entrega (Ej. Bogotá)" />
              </div>

              {/* Sección de Pago */}
              <div className="flex flex-col gap-4 pt-2">
                <h3 className="text-[13px] font-bold uppercase tracking-widest ml-1" style={{ color: "var(--text-primary)" }}>Pago</h3>
                <CheckoutInput 
                  icon={CreditCard} 
                  required 
                  value={formData.card}
                  onChange={(e: any) => setFormData({...formData, card: formatCardNumber(e.target.value)})}
                  placeholder="Número de Tarjeta" 
                />
                <div className="flex gap-4">
                  <CheckoutInput 
                    icon={Calendar} 
                    required 
                    value={formData.expiry}
                    onChange={(e: any) => setFormData({...formData, expiry: formatExpiry(e.target.value)})}
                    placeholder="MM/YY" 
                  />
                  <CheckoutInput 
                    icon={Lock} 
                    required 
                    maxLength={4}
                    value={formData.cvc}
                    onChange={(e: any) => setFormData({...formData, cvc: e.target.value.replace(/\D/g, '')})}
                    placeholder="CVC" 
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full h-[60px] text-[17px] font-bold text-white rounded-[100px] flex items-center justify-center gap-2 relative overflow-hidden mt-6 vint-btn-primary transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 shadow-xl"
                style={{ backgroundColor: "var(--accent)" }}
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pagar ${formatPrice(totalWithShipping)}`}
              </button>
            </form>

         </div>

      </div><br />
    </div>
  );
}