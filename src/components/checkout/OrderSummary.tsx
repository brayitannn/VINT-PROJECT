import React from "react";
import Image from "next/image";
import { Ticket, Check, AlertCircle, Percent } from "lucide-react";
import { SHIPPING_COST } from "@/context/CartContext";

interface OrderSummaryProps {
  items: any[];
  totalItems: number;
  totalPrice: number;
  discountAmount: number;
  promoCode: string;
  setPromoCode: (code: string) => void;
  handleApplyPromo: () => void;
  finalPrice: number;
  formatPrice: (price: number) => string;
}

export const OrderSummary = ({
  items,
  totalItems,
  totalPrice,
  discountAmount,
  promoCode,
  setPromoCode,
  handleApplyPromo,
  finalPrice,
  formatPrice
}: OrderSummaryProps) => {
  return (
    <div 
      style={{ 
        backgroundColor: "color-mix(in srgb, var(--bg-card) 80%, transparent)",
        borderColor: "var(--border)",
        padding: "40px",
        gap: "40px"
      }}
      className="backdrop-blur-xl border rounded-3xl shadow-lg flex flex-col w-full"
    >
      <h2 
        style={{ borderBottomColor: "color-mix(in srgb, var(--border) 60%, transparent)" }}
        className="text-xl font-bold tracking-tight text-[var(--text-primary)] border-b pb-5"
      >
        Resumen de Orden ({totalItems} {totalItems === 1 ? 'prenda' : 'prendas'})
      </h2>

      {/* Lista de productos */}
      <div 
        style={{ marginTop: "32px", marginBottom: "32px" }}
        className="space-y-5 max-h-[340px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[var(--border)]/50 [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        {items.length === 0 ? (
          <div 
            style={{ paddingTop: "64px", paddingBottom: "64px" }}
            className="text-center text-sm text-[var(--text-secondary)] font-medium"
          >
            Tu carrito está vacío.
          </div>
        ) : (
          items.map(item => (
            <div 
              key={item.id} 
              style={{ borderBottomColor: "color-mix(in srgb, var(--border) 10%, transparent)" }}
              className="flex gap-4 items-center justify-between py-1.5 border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="flex gap-3 items-center min-w-0">
                {/* Imagen del Producto */}
                <div 
                  style={{ borderColor: "color-mix(in srgb, var(--border) 20%, transparent)" }}
                  className="w-[58px] h-[72px] rounded-xl bg-[var(--bg-secondary)] overflow-hidden relative flex-shrink-0 shadow-sm border"
                >
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                {/* Info */}
                <div className="min-w-0 flex flex-col justify-center">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
                    Talla: {item.size} • Cant: {item.quantity}
                  </p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-[var(--accent)] flex-shrink-0 ml-2">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Código Promocional */}
      <div 
        style={{ borderTopColor: "color-mix(in srgb, var(--border) 60%, transparent)" }}
        className="border-t pt-8 flex flex-col gap-3"
      >
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] mb-1">
          <Ticket className="w-3.5 h-3.5" /> ¿Tienes un cupón de descuento?
        </div>
        <div className="flex gap-2 w-full">
          <input
            type="text"
            placeholder="Ej. VINT10"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            style={{ 
              borderColor: "color-mix(in srgb, var(--border) 30%, transparent)",
              paddingLeft: "16px",
              paddingRight: "16px"
            }}
            className="flex-1 min-w-0 h-11 text-sm bg-[var(--bg-secondary)] border rounded-xl outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/70"
          />
          <button
            type="button"
            onClick={handleApplyPromo}
            style={{
              paddingLeft: "24px",
              paddingRight: "24px"
            }}
            className="h-11 text-xs font-extrabold rounded-xl hover:opacity-95 transition-all flex-shrink-0 cursor-pointer bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm hover:scale-[1.01]"
          >
            Aplicar
          </button>
        </div>
      </div>

      {/* Desglose de totales */}
      <div 
        style={{ 
          backgroundColor: "color-mix(in srgb, var(--bg-secondary) 35%, transparent)",
          borderColor: "color-mix(in srgb, var(--border) 20%, transparent)",
          padding: "24px"
        }}
        className="border rounded-2xl space-y-4 text-sm"
      >
        <div className="flex justify-between text-[var(--text-secondary)] font-semibold">
          <span>Subtotal</span>
          <span className="text-[var(--text-primary)] font-bold">{formatPrice(totalPrice)}</span>
        </div>
        
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600 font-bold">
            <span className="flex items-center gap-1"><Percent className="w-3.5 h-3.5" /> Descuento (10%)</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-[var(--text-secondary)] font-semibold">
          <span>Costo de Envío</span>
          <span className="text-[var(--text-primary)] font-bold">{formatPrice(SHIPPING_COST)}</span>
        </div>

        <div 
          style={{ borderTopColor: "color-mix(in srgb, var(--border) 60%, transparent)" }}
          className="flex justify-between items-center pt-6 border-t border-dashed gap-2 flex-wrap sm:flex-nowrap"
        >
          <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--text-primary)]">
            Total Final
          </span>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)] leading-none text-right">
            {formatPrice(finalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
};
