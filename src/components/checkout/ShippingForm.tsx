import React from "react";
import { User, Phone, Mail, MapPin, ChevronRight, Loader2 } from "lucide-react";
import { PremiumInput } from "./PremiumInput";

interface ShippingFormProps {
  shipping: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    additionalInfo: string;
  };
  setShipping: (shipping: any) => void;
  shippingErrors: any;
  handleNextStep: (e: React.FormEvent) => void;
  isProcessing?: boolean;
}

export const ShippingForm = ({
  shipping,
  setShipping,
  shippingErrors,
  handleNextStep,
  isProcessing = false
}: ShippingFormProps) => {
  return (
    <form 
      onSubmit={handleNextStep} 
      style={{ 
        borderColor: "var(--border)",
        padding: "40px",
        gap: "40px"
      }}
      className="bg-[var(--bg-card)] border rounded-3xl shadow-md flex flex-col"
    >
      <h3 
        style={{ borderBottomColor: "color-mix(in srgb, var(--border) 60%, transparent)" }}
        className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2 border-b pb-4"
      >
        <MapPin className="w-4 h-4 text-[var(--accent)]" /> 1. Dirección de entrega
      </h3>
      
      <div className="flex flex-col" style={{ gap: "40px" }}>
        <PremiumInput 
          icon={User}
          label="Nombre Completo"
          placeholder="Ej. Juan Pérez"
          value={shipping.name}
          onChange={(e: any) => setShipping({ ...shipping, name: e.target.value })}
          error={shippingErrors.name}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          <PremiumInput 
            icon={Phone}
            label="Teléfono Móvil"
            placeholder="Ej. 3001234567"
            type="tel"
            value={shipping.phone}
            onChange={(e: any) => setShipping({ ...shipping, phone: e.target.value.replace(/\D/g, '') })}
            error={shippingErrors.phone}
          />

          <PremiumInput 
            icon={Mail}
            label="Correo Electrónico"
            placeholder="Ej. juan@correo.com"
            type="email"
            value={shipping.email}
            onChange={(e: any) => setShipping({ ...shipping, email: e.target.value })}
            error={shippingErrors.email}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="sm:col-span-2">
            <PremiumInput 
              icon={MapPin}
              label="Dirección de Entrega"
              placeholder="Ej. Calle 45 # 12-34 Apto 302"
              value={shipping.address}
              onChange={(e: any) => setShipping({ ...shipping, address: e.target.value })}
              error={shippingErrors.address}
            />
          </div>
          <div>
            <PremiumInput 
              label="Ciudad"
              placeholder="Ej. Bogotá"
              value={shipping.city}
              onChange={(e: any) => setShipping({ ...shipping, city: e.target.value })}
              error={shippingErrors.city}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] ml-1.5">
            Instrucciones adicionales (Opcional)
          </label>
          <textarea
            placeholder="Ej. Conjunto residencial, torre A, portería"
            value={shipping.additionalInfo}
            onChange={(e: any) => setShipping({ ...shipping, additionalInfo: e.target.value })}
            style={{ 
              borderColor: "color-mix(in srgb, var(--border) 30%, transparent)",
              padding: "16px 20px"
            }}
            className="w-full min-h-[100px] border rounded-xl outline-none text-[15px] transition-all bg-[var(--bg-secondary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full h-[54px] rounded-xl font-bold text-white bg-[var(--accent)] hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-transform duration-300 hover:scale-[1.01] mt-6 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirigiendo a Mercado Pago...
          </>
        ) : (
          <>
            Continuar al Pago
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};
