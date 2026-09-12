"use client";

import { useCheckout } from "@/hooks/useCheckout";
import { ShippingForm } from "@/components/checkout/ShippingForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { CheckoutRecommendations } from "@/components/checkout/CheckoutRecommendations";
import { Check, ShieldCheck, Sparkles } from "lucide-react";
import Loader from "@/components/ui/Loader";

const formatPrice = (price: number) => `$${price.toLocaleString('es-CO')} COP`;

export default function CheckoutPage() {
  const {
    items,
    totalItems,
    totalPrice,
    isProcessing,
    shipping,
    setShipping,
    shippingErrors,
    finalPrice,
    handleNextStep,
    showLoader
  } = useCheckout();

  return (
    <div className="min-h-screen pb-32 flex flex-col items-center relative w-full overflow-hidden bg-[var(--bg-primary)]">
      <Loader show={showLoader} />
      
      {/* Fondo Premium Minimalista */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[var(--bg-primary)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--bg-secondary)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,94,60,0.05)_0%,transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#8B5E3C_1px,transparent_1px),linear-gradient(to_bottom,#8B5E3C_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div 
        style={{ paddingTop: "110px" }}
        className="w-full max-w-3xl mx-auto px-4 relative z-10"
      >
        {/* Layout Centrado de Columna Única */}
        <div className="w-full flex flex-col gap-8">
          
          {/* Encabezado Principal */}
          <div 
            style={{ 
              backgroundColor: "color-mix(in srgb, var(--bg-card) 60%, transparent)",
              borderColor: "var(--border)",
              padding: "36px 40px"
            }}
            className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border rounded-3xl shadow-sm backdrop-blur-md"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Checkout Directo
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                Finalizar Compra
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                Completa tus datos de entrega y confirma tu orden con un solo clic.
              </p>
            </div>

            <div className="text-right sm:border-l sm:pl-6 border-[var(--border)]">
              <span className="text-xs text-[var(--text-secondary)] font-medium block">Total a pagar</span>
              <span className="text-xl sm:text-2xl font-black text-[var(--accent)]">
                {formatPrice(finalPrice)}
              </span>
            </div>
          </div>

          {/* FORMULARIO DE ENVÍO Y PAGO */}
          <ShippingForm
            shipping={shipping}
            setShipping={setShipping}
            shippingErrors={shippingErrors}
            handleNextStep={handleNextStep}
            isProcessing={isProcessing}
          />

          {/* RESUMEN DE LA ORDEN */}
          <OrderSummary
            items={items}
            totalItems={totalItems}
            totalPrice={totalPrice}
            finalPrice={finalPrice}
            formatPrice={formatPrice}
          />

          {/* Sellos de Seguridad */}
          <div className="flex justify-center items-center gap-6 opacity-60 text-xs font-semibold py-2 text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Cifrado SSL Seguro
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> Garantía de Entrega Vint
            </span>
          </div>

          {/* Recomendaciones */}
          <div className="mt-4">
            <CheckoutRecommendations />
          </div>

        </div>
      </div>
    </div>
  );
}