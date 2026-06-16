import React from "react";
import { CreditCard, Lock } from "lucide-react";

export const CreditCardMockup = ({ number, name, expiry, cvc, focusedField }: any) => {
  const isFlipped = focusedField === 'cvc';
  
  // Detectar marca de tarjeta
  let brand = 'generic';
  const cleanNumber = number.replace(/\s+/g, '');
  if (cleanNumber.startsWith('4')) brand = 'visa';
  else if (cleanNumber.startsWith('5')) brand = 'mastercard';
  else if (cleanNumber.startsWith('3')) brand = 'amex';

  return (
    <div 
      className="w-full max-w-[360px] h-[210px] perspective-1000 mb-8 font-mono select-none"
      style={{ margin: "0 auto" }}
    >
      <div 
        className={`w-full h-full relative transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Lado Frontal */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl flex flex-col justify-between text-white backface-hidden shadow-2xl overflow-hidden"
          style={{
            padding: "22px 28px",
            background: "linear-gradient(135deg, #2D1E16 0%, #1D120C 50%, #0F0906 100%)",
            border: "1px solid rgba(139, 94, 60, 0.35)",
            boxShadow: "0 20px 45px rgba(44, 36, 30, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Reflejos y luces ambientales */}
          <div className="absolute right-[-15%] top-[-15%] w-[65%] h-[65%] rounded-full bg-gradient-to-br from-[#8B5E3C] to-transparent opacity-25 blur-2xl pointer-events-none" />
          <div className="absolute left-[-20%] bottom-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-[#A8724D] to-transparent opacity-20 blur-3xl pointer-events-none" />
          <div className="absolute left-[20%] top-[25%] w-[40%] h-[40%] rounded-full bg-white/5 blur-xl pointer-events-none" />
          
          <div className="flex justify-between items-center z-10">
            {/* Chip Premium */}
            <div className="w-11 h-8 rounded-lg bg-gradient-to-br from-[#E6C587] via-[#D4AF37] to-[#AA7C11] relative overflow-hidden flex items-center justify-center border border-yellow-500/30 shadow-md">
              {/* Chip grid details */}
              <div className="absolute inset-0 opacity-20 border-b border-r border-black/40" />
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/30" />
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/30" />
              <div className="absolute top-1/4 bottom-1/4 left-1/4 right-1/4 rounded-sm border border-black/25" />
            </div>
            
            {/* Logo de Franquicia */}
            <div className="flex items-center justify-center">
              {brand === 'visa' && (
                <span className="text-[17px] font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#0057B7] to-[#FFD700]">
                  VISA
                </span>
              )}
              {brand === 'mastercard' && (
                <div className="flex items-center -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-[#EB001B] opacity-95" />
                  <div className="w-6 h-6 rounded-full bg-[#F79E1B] opacity-90 mix-blend-screen" />
                </div>
              )}
              {brand === 'amex' && (
                <span className="text-[9px] font-extrabold tracking-widest bg-gradient-to-br from-[#2470B8] to-[#114E84] px-2.5 py-1 rounded text-white border border-[#4096E6]/30 shadow-sm">
                  AMEX
                </span>
              )}
              {brand === 'generic' && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10">
                  <CreditCard className="w-4.5 h-4.5 opacity-80 text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4.5 z-10">
            {/* Número */}
            <div className="text-[18px] sm:text-[19px] font-medium tracking-[0.16em] text-shadow-sm truncate">
              {number || '•••• •••• •••• ••••'}
            </div>

            <div className="flex justify-between items-end">
              {/* Titular */}
              <div className="flex flex-col min-w-0 pr-3 font-sans">
                <span className="text-[8px] uppercase tracking-[0.15em] text-white/45 font-semibold">Titular de Tarjeta</span>
                <span className="text-[12px] uppercase tracking-wider truncate font-semibold text-white mt-0.5">
                  {name || 'TU NOMBRE COMPLETO'}
                </span>
              </div>
              {/* Expiración */}
              <div className="flex flex-col flex-shrink-0 items-end font-sans">
                <span className="text-[8px] uppercase tracking-[0.15em] text-white/45 font-semibold">Vence</span>
                <span className="text-[12px] font-semibold text-white mt-0.5 font-mono">{expiry || 'MM/YY'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Reverso (CVC) */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl flex flex-col justify-between text-white backface-hidden rotate-y-180 shadow-2xl overflow-hidden"
          style={{
            padding: "0 0 22px 0",
            background: "linear-gradient(135deg, #1A100B 0%, #0D0805 100%)",
            border: "1px solid rgba(139, 94, 60, 0.35)",
            boxShadow: "0 20px 45px rgba(44, 36, 30, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Reflejos traseros */}
          <div className="absolute -left-20 -top-20 w-44 h-44 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          
          {/* Banda Magnética */}
          <div className="w-full h-11 bg-black/95 mt-1" />

          <div className="px-7 flex flex-col gap-3 z-10">
            {/* Panel de Firma y CVC */}
            <div>
              <span className="text-[8px] uppercase tracking-[0.12em] text-white/40 block mb-1.5 font-sans font-semibold">Firma Autorizada</span>
              <div className="flex items-center gap-3">
                <div 
                  className="flex-1 h-9 rounded-lg bg-white/10 flex items-center justify-start px-3 border border-white/5"
                  style={{
                    background: "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.07) 8px, rgba(255,255,255,0.07) 16px)"
                  }}
                >
                  <span className="text-white/50 font-serif italic text-xs truncate max-w-[150px]">{name || 'Vint Client'}</span>
                </div>
                <div className="w-12 h-9 bg-amber-50 rounded-lg text-black flex items-center justify-center font-bold text-sm shadow-md font-mono">
                  {cvc || '•••'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 opacity-30 justify-center mt-1">
              <Lock className="w-3.5 h-3.5" />
              <span className="text-[8px] tracking-[0.15em] uppercase font-sans font-bold">Pago Simulado Seguro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
