"use client";

import { useCheckout } from "@/hooks/useCheckout";
import { ShippingForm } from "@/components/checkout/ShippingForm";
import { PaymentForm } from "@/components/checkout/PaymentForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { SimulationModal } from "@/components/checkout/SimulationModal";
import { CheckoutRecommendations } from "@/components/checkout/CheckoutRecommendations";
import { Check, ArrowLeft, ShieldCheck } from "lucide-react";

// --- Utilidades de Formateo ---
const formatPrice = (price: number) => `$${price.toLocaleString('es-CO')} COP`;

export default function CheckoutPage() {
  const {
    items,
    totalItems,
    totalPrice,
    step,
    setStep,
    isProcessing,
    shipping,
    setShipping,
    shippingErrors,
    paymentMethod,
    setPaymentMethod,
    card,
    setCard,
    focusedField,
    setFocusedField,
    cardErrors,
    pse,
    setPse,
    pseErrors,
    nequi,
    setNequi,
    nequiErrors,
    showSimModal,
    setShowSimModal,
    simState,
    setSimState,
    simCounter,
    simOtp,
    setSimOtp,
    simBankUser,
    setSimBankUser,
    finalPrice,
    handleNextStep,
    handleCheckoutSubmit,
    handlePseLoginSubmit,
    handlePseOtpSubmit,
    handleSimulatePushApproval,
    setIsProcessing
  } = useCheckout();

  return (
    <div className="min-h-screen pb-32 flex flex-col items-center relative w-full overflow-hidden bg-[var(--bg-primary)]">
      
      {/* Estilos locales para 3D Card Flip y animaciones */}
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .text-shadow-sm {
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }
      `}</style>
      
      {/* Fondo Premium Minimalista */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[var(--bg-primary)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--bg-secondary)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,94,60,0.05)_0%,transparent_50%)]" />
        {/* Sutil cuadrícula minimalista */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#8B5E3C_1px,transparent_1px),linear-gradient(to_bottom,#8B5E3C_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div 
        style={{ paddingTop: "110px" }}
        className="w-full max-w-3xl mx-auto px-4 relative z-10"
      >
        
        {/* Barra de progreso de pasos */}
        <div className="w-full flex justify-center px-4" style={{ marginBottom: "56px" }}>
          <div className="w-full max-w-md flex items-center relative">
            {/* Línea de fondo alineada a la altura exacta de los círculos (top-5) */}
            <div 
              style={{ backgroundColor: "color-mix(in srgb, var(--border) 30%, transparent)" }}
              className="absolute left-1/4 right-1/4 top-5 -translate-y-1/2 h-[2px] rounded-full z-0"
            >
              <div 
                className="h-full bg-[var(--accent)] transition-all duration-500 rounded-full" 
                style={{ width: step === 1 ? '0%' : '100%' }}
              />
            </div>
            
            {/* Paso 1 */}
            <div className="relative z-10 flex flex-col items-center flex-1">
              <button 
                onClick={() => step === 2 && setStep(1)}
                disabled={isProcessing}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 cursor-pointer ${
                  step >= 1 ? 'bg-[var(--accent)] text-white shadow-lg scale-105' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                }`}
              >
                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
              </button>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-secondary)] mt-3">
                Envío
              </span>
            </div>
            
            {/* Paso 2 */}
            <div className="relative z-10 flex flex-col items-center flex-1">
              <div 
                style={{ borderColor: "color-mix(in srgb, var(--border) 30%, transparent)" }}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= 2 ? 'bg-[var(--accent)] text-white shadow-lg scale-105' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border'
                }`}
              >
                2
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-secondary)] mt-3">
                Pago
              </span>
            </div>
          </div>
        </div>

        {/* Layout Centrado de Columna Única */}
        <div className="w-full flex flex-col gap-10">
          
          {/* Encabezado e indicador del paso */}
          <div 
            style={{ 
              backgroundColor: "color-mix(in srgb, var(--bg-card) 50%, transparent)",
              borderColor: "var(--border)",
              padding: "40px"
            }}
            className="flex justify-between items-center border rounded-3xl shadow-sm"
          >
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                {step === 1 ? "Información de Envío" : "Selecciona tu Medio de Pago"}
              </h1>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                {step === 1 ? "Ingresa la dirección para recibir tu compra" : "Tus datos bancarios están cifrados de forma simulada y segura"}
              </p>
            </div>
            {step === 2 && (
              <button 
                onClick={() => setStep(1)}
                disabled={isProcessing}
                className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Modificar Envío
              </button>
            )}
          </div>

          {/* PASO 1 y 2: FORMULARIOS */}
          {step === 1 ? (
            <ShippingForm
              shipping={shipping}
              setShipping={setShipping}
              shippingErrors={shippingErrors}
              handleNextStep={handleNextStep}
            />
          ) : (
            <div className="flex flex-col gap-8 w-full">
              <PaymentForm
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                card={card}
                setCard={setCard}
                focusedField={focusedField}
                setFocusedField={setFocusedField}
                cardErrors={cardErrors}
                pse={pse}
                setPse={setPse}
                pseErrors={pseErrors}
                nequi={nequi}
                setNequi={setNequi}
                nequiErrors={nequiErrors}
                isProcessing={isProcessing}
                finalPrice={finalPrice}
                handleCheckoutSubmit={handleCheckoutSubmit}
                formatPrice={formatPrice}
              />
              <CheckoutRecommendations />
            </div>
          )}

          {/* RESUMEN DE LA ORDEN (Ubicado Abajo de los formularios) */}
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
              <ShieldCheck className="w-4 h-4 text-green-600" /> Cifrado SSL de 256 bits
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-600" /> Garantía de Reembolso
            </span>
          </div>

        </div>
      </div>



      {/* MODAL DE SIMULACIÓN DE PAGOS INTERACTIVO */}
      <SimulationModal
        showSimModal={showSimModal}
        setShowSimModal={setShowSimModal}
        simState={simState}
        setSimState={setSimState}
        simCounter={simCounter}
        simOtp={simOtp}
        setSimOtp={setSimOtp}
        simBankUser={simBankUser}
        setSimBankUser={setSimBankUser}
        pse={pse}
        nequi={nequi}
        finalPrice={finalPrice}
        setIsProcessing={setIsProcessing}
        handlePseLoginSubmit={handlePseLoginSubmit}
        handlePseOtpSubmit={handlePseOtpSubmit}
        handleSimulatePushApproval={handleSimulatePushApproval}
        formatPrice={formatPrice}
      />

    </div>
  );
}