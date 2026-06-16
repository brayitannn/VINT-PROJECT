import React from "react";
import { 
  CreditCard, 
  Building2, 
  Smartphone, 
  DollarSign, 
  Calendar, 
  Lock, 
  User, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle, 
  Loader2
} from "lucide-react";
import { PremiumInput } from "./PremiumInput";
import { CreditCardMockup } from "./CreditCardMockup";

const formatCardNumber = (value: string) => {
  return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim().slice(0, 19);
};

const formatExpiry = (value: string) => {
  return value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1/').slice(0, 5);
};

const colombianBanks = [
  "Bancolombia",
  "Banco de Bogotá",
  "Davivienda",
  "Nequi",
  "DaviPlata",
  "BBVA Colombia",
  "Banco de Occidente",
  "Banco Popular",
  "Banco AV Villas",
  "Scotiabank Colpatria",
  "Itaú",
  "Lulo Bank",
  "RappiPay",
  "Banco GNB Sudameris",
  "Banco Caja Social",
  "Banco Falabella"
];

interface PaymentFormProps {
  paymentMethod: 'card' | 'pse' | 'nequi' | 'delivery';
  setPaymentMethod: (method: 'card' | 'pse' | 'nequi' | 'delivery') => void;
  card: { number: string; name: string; expiry: string; cvc: string };
  setCard: (card: any) => void;
  focusedField: string;
  setFocusedField: (field: string) => void;
  cardErrors: any;
  pse: { bank: string; idType: string; idNumber: string; email: string };
  setPse: (pse: any) => void;
  pseErrors: any;
  nequi: { phone: string };
  setNequi: (nequi: any) => void;
  nequiErrors: any;
  isProcessing: boolean;
  finalPrice: number;
  handleCheckoutSubmit: (e: React.FormEvent) => void;
  formatPrice: (price: number) => string;
}

export const PaymentForm = ({
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
  isProcessing,
  finalPrice,
  handleCheckoutSubmit,
  formatPrice
}: PaymentFormProps) => {
  return (
    <form 
      onSubmit={handleCheckoutSubmit} 
      style={{ 
        borderColor: "var(--border)",
        padding: "40px",
        gap: "40px"
      }}
      className="bg-[var(--bg-card)] border rounded-3xl shadow-md flex flex-col"
    >
      {/* Opciones de Método (Pestañas horizontales premium) */}
      <div 
        style={{ 
          backgroundColor: "color-mix(in srgb, var(--bg-secondary) 60%, transparent)",
          borderColor: "color-mix(in srgb, var(--border) 30%, transparent)"
        }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-1 rounded-xl border"
      >
        <button
          type="button"
          onClick={() => setPaymentMethod('card')}
          style={{
            borderColor: paymentMethod === 'card' ? "color-mix(in srgb, var(--border) 30%, transparent)" : "transparent"
          }}
          className={`py-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
            paymentMethod === 'card' 
              ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-sm border' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer'
          }`}
        >
          <CreditCard className="w-4.5 h-4.5" />
          <span>Tarjeta</span>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod('pse')}
          style={{
            borderColor: paymentMethod === 'pse' ? "color-mix(in srgb, var(--border) 30%, transparent)" : "transparent"
          }}
          className={`py-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
            paymentMethod === 'pse' 
              ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-sm border' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer'
          }`}
        >
          <Building2 className="w-4.5 h-4.5" />
          <span>PSE</span>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod('nequi')}
          style={{
            borderColor: paymentMethod === 'nequi' ? "color-mix(in srgb, var(--border) 30%, transparent)" : "transparent"
          }}
          className={`py-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
            paymentMethod === 'nequi' 
              ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-sm border' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer'
          }`}
        >
          <Smartphone className="w-4.5 h-4.5" />
          <span>Nequi / D.Plata</span>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod('delivery')}
          style={{
            borderColor: paymentMethod === 'delivery' ? "color-mix(in srgb, var(--border) 30%, transparent)" : "transparent"
          }}
          className={`py-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
            paymentMethod === 'delivery' 
              ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-sm border' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer'
          }`}
        >
          <DollarSign className="w-4.5 h-4.5" />
          <span>Contraentrega</span>
        </button>
      </div>

      {/* --- SECCIÓN MÉTODOS --- */}

      {/* 1. Formulario Tarjeta */}
      {paymentMethod === 'card' && (
        <div className="flex flex-col animate-fade-in-up" style={{ gap: "40px" }}>
          {/* Mockup interactivo 3D */}
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <CreditCardMockup 
              number={card.number}
              name={card.name}
              expiry={card.expiry}
              cvc={card.cvc}
              focusedField={focusedField}
            />
          </div>

          <div className="flex flex-col" style={{ gap: "40px" }}>
            <PremiumInput 
              icon={CreditCard}
              label="Número de Tarjeta"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              value={card.number}
              onFocus={() => setFocusedField('number')}
              onBlur={() => setFocusedField('')}
              onChange={(e: any) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
              error={cardErrors.number}
            />

            <PremiumInput 
              icon={User}
              label="Nombre en la Tarjeta"
              placeholder="Ej. JUAN PEREZ"
              value={card.name}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField('')}
              onChange={(e: any) => setCard({ ...card, name: e.target.value.toUpperCase() })}
              error={cardErrors.name}
            />

            <div className="grid grid-cols-2 gap-6 sm:gap-8">
              <PremiumInput 
                icon={Calendar}
                label="Vencimiento"
                placeholder="MM/YY"
                maxLength={5}
                value={card.expiry}
                onFocus={() => setFocusedField('expiry')}
                onBlur={() => setFocusedField('')}
                onChange={(e: any) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                error={cardErrors.expiry}
              />

              <PremiumInput 
                icon={Lock}
                label="CVC"
                placeholder="123"
                maxLength={4}
                value={card.cvc}
                onFocus={() => setFocusedField('cvc')}
                onBlur={() => setFocusedField('')}
                onChange={(e: any) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '') })}
                error={cardErrors.cvc}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Formulario PSE */}
      {paymentMethod === 'pse' && (
        <div className="flex flex-col animate-fade-in-up" style={{ gap: "40px" }}>
          <div 
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              color: "#F59E0B"
            }}
          >
            <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-[#F59E0B]">Pago Seguro PSE</span>
              <span className="text-[13px] opacity-90 leading-relaxed mt-0.5">
                Al presionar pagar, se abrirá un portal bancario simulado interactivo de alta fidelidad para completar el pago.
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] ml-1.5">
              Selecciona tu banco
            </label>
            <select
              value={pse.bank}
              onChange={(e) => setPse({ ...pse, bank: e.target.value })}
              style={{ borderColor: "color-mix(in srgb, var(--border) 30%, transparent)" }}
              className="w-full h-[54px] text-[15px] outline-none bg-[var(--bg-secondary)] border rounded-xl px-4 focus:ring-2 focus:ring-[var(--accent)] text-[var(--text-primary)]"
            >
              <option value="">-- Escoger Banco --</option>
              {colombianBanks.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            {pseErrors.bank && <span className="text-red-500 text-xs font-medium ml-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {pseErrors.bank}</span>}
          </div>

          <div className="grid grid-cols-3 gap-6 sm:gap-8">
            <div className="col-span-1 flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] ml-1.5">
                Documento
              </label>
              <select
                value={pse.idType}
                onChange={(e) => setPse({ ...pse, idType: e.target.value })}
                style={{ borderColor: "color-mix(in srgb, var(--border) 30%, transparent)" }}
                className="w-full h-[54px] text-[15px] outline-none bg-[var(--bg-secondary)] border rounded-xl px-3 focus:ring-2 focus:ring-[var(--accent)] text-[var(--text-primary)]"
              >
                <option value="CC">C.C.</option>
                <option value="CE">C.E.</option>
                <option value="NIT">NIT</option>
                <option value="PP">Pasaporte</option>
              </select>
            </div>
            <div className="col-span-2">
              <PremiumInput 
                label="Número de Documento"
                placeholder="1000123456"
                value={pse.idNumber}
                onChange={(e: any) => setPse({ ...pse, idNumber: e.target.value.replace(/\D/g, '') })}
                error={pseErrors.idNumber}
              />
            </div>
          </div>

          <PremiumInput 
            icon={Mail}
            label="Correo registrado en PSE"
            placeholder="ejemplo@banco.com"
            type="email"
            value={pse.email}
            onChange={(e: any) => setPse({ ...pse, email: e.target.value })}
            error={pseErrors.email}
          />
        </div>
      )}

      {/* 3. Formulario Nequi / Daviplata */}
      {paymentMethod === 'nequi' && (
        <div className="flex flex-col animate-fade-in-up" style={{ gap: "40px" }}>
          <div 
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              color: "#F59E0B"
            }}
          >
            <Smartphone className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-[#F59E0B]">Billeteras Móviles (Nequi / DaviPlata)</span>
              <span className="text-[13px] opacity-90 leading-relaxed mt-0.5">
                Te enviaremos una notificación de aprobación (Push) en tiempo real a tu celular para simular el cobro de tu cuenta.
              </span>
            </div>
          </div>

          <PremiumInput 
            icon={Smartphone}
            label="Número de Celular vinculado"
            placeholder="Ej. 3123456789"
            maxLength={10}
            value={nequi.phone}
            onChange={(e: any) => setNequi({ ...nequi, phone: e.target.value.replace(/\D/g, '') })}
            error={nequiErrors.phone}
          />
        </div>
      )}

      {/* 4. Formulario Contraentrega */}
      {paymentMethod === 'delivery' && (
        <div 
          style={{ 
            backgroundColor: "color-mix(in srgb, var(--bg-secondary) 40%, transparent)",
            borderColor: "color-mix(in srgb, var(--border) 30%, transparent)"
          }}
          className="flex flex-col gap-6 p-8 rounded-2xl border animate-fade-in-up"
        >
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)" }}>
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-sm text-[var(--text-primary)]">Paga en Efectivo en tu Puerta</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Paga el valor exacto de la orden a la transportadora cuando el paquete llegue a tu hogar.
              </p>
            </div>
          </div>
          
          <div 
            style={{ borderTopColor: "color-mix(in srgb, var(--border) 30%, transparent)" }}
            className="border-t pt-4 mt-2"
          >
            <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Envío rápido y seguro asegurado por Coordinadora / Servientrega.</span>
            </div>
          </div>
        </div>
      )}

      {/* Botón Pagar general */}
      <button
        type="submit"
        disabled={isProcessing}
        className="w-full h-[58px] rounded-xl font-bold text-white bg-[var(--accent)] hover:opacity-95 shadow-lg flex items-center justify-center gap-2.5 transition-transform duration-300 hover:scale-[1.01] disabled:opacity-75 disabled:hover:scale-100 cursor-pointer"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Procesando Pedido Seguro...
          </>
        ) : (
          <>
            <Lock className="w-4.5 h-4.5" />
            Pagar {formatPrice(finalPrice)}
          </>
        )}
      </button>
    </form>
  );
};
