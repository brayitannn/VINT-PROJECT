import React from "react";
import { Loader2, Building2, ShieldCheck, Lock, Smartphone } from "lucide-react";
import { PremiumInput } from "./PremiumInput";

const formatCounterTime = (seconds: number) => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

interface SimulationModalProps {
  showSimModal: boolean;
  setShowSimModal: (show: boolean) => void;
  simState: 'none' | 'loading' | 'pse_login' | 'pse_otp' | 'nequi_push';
  setSimState: (state: any) => void;
  simCounter: number;
  simOtp: string;
  setSimOtp: (otp: string) => void;
  simBankUser: string;
  setSimBankUser: (user: string) => void;
  pse: { bank: string };
  nequi: { phone: string };
  finalPrice: number;
  setIsProcessing: (proc: boolean) => void;
  handlePseLoginSubmit: (e: React.FormEvent) => void;
  handlePseOtpSubmit: (e: React.FormEvent) => void;
  handleSimulatePushApproval: () => void;
  formatPrice: (price: number) => string;
}

export const SimulationModal = ({
  showSimModal,
  setShowSimModal,
  simState,
  setSimState,
  simCounter,
  simOtp,
  setSimOtp,
  simBankUser,
  setSimBankUser,
  pse,
  nequi,
  finalPrice,
  setIsProcessing,
  handlePseLoginSubmit,
  handlePseOtpSubmit,
  handleSimulatePushApproval,
  formatPrice
}: SimulationModalProps) => {
  if (!showSimModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Cabecera del simulador */}
        <div className="bg-[var(--text-primary)] text-white px-6 py-4 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[var(--accent)] flex items-center justify-center text-xs font-extrabold text-white">V</div>
            <span className="font-bold text-sm tracking-wider uppercase">Simulador de Pago Vint</span>
          </div>
          <button 
            onClick={() => {
              setShowSimModal(false);
              setIsProcessing(false);
            }}
            className="text-white/60 hover:text-white text-xs font-bold cursor-pointer"
          >
            Cancelar
          </button>
        </div>

        {/* Contenido según el estado de la simulación */}
        <div className="p-6 sm:p-8 flex flex-col items-center">
          
          {/* ESTADO: CARGANDO / CONECTANDO */}
          {simState === 'loading' && (
            <div className="py-12 flex flex-col items-center gap-4 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-[var(--accent)]" />
              <div>
                <h3 className="font-bold text-[var(--text-primary)] text-lg">Procesando Transferencia</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5 max-w-[280px]">Conectando de forma segura con los servidores de autenticación. Por favor no cierres la ventana.</p>
              </div>
            </div>
          )}

          {/* ESTADO: LOGIN PSE */}
          {simState === 'pse_login' && (
            <form onSubmit={handlePseLoginSubmit} className="w-full flex flex-col gap-4">
              <div 
                style={{ borderBottomColor: "color-mix(in srgb, var(--border) 25%, transparent)" }}
                className="flex items-center gap-3 justify-center mb-2 pb-4 border-b"
              >
                <Building2 className="w-6 h-6 text-[var(--accent)]" />
                <div className="text-center sm:text-left">
                  <h3 className="font-black text-sm uppercase text-[var(--text-primary)]">Portal Bancario Seguro</h3>
                  <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Banco seleccionado: {pse.bank}</p>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-300 rounded-xl p-3.5 text-[11px] leading-relaxed mb-1 font-medium flex gap-2">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 text-blue-600 mt-0.5" />
                <span>Esto es una <b>simulación de pasarela libre de costos</b>. Puedes ingresar cualquier valor ficticio en los campos.</span>
              </div>

              <PremiumInput 
                label="Usuario / Identificación de Banco"
                placeholder="Ej. miusuario123"
                required
                value={simBankUser}
                onChange={(e: any) => setSimBankUser(e.target.value)}
              />

              <PremiumInput 
                label="Contraseña"
                placeholder="••••••••"
                type="password"
                required
              />

              <button
                type="submit"
                className="w-full h-12 bg-blue-600 text-white font-bold rounded-xl text-sm mt-3 hover:bg-blue-700 shadow-sm cursor-pointer"
              >
                Ingresar de forma segura
              </button>
            </form>
          )}

          {/* ESTADO: OTP PSE */}
          {simState === 'pse_otp' && (
            <form onSubmit={handlePseOtpSubmit} className="w-full flex flex-col gap-4 text-center">
              <div className="flex flex-col items-center gap-2 mb-2">
                <Lock className="w-8 h-8 text-green-600" />
                <h3 className="font-bold text-lg text-[var(--text-primary)]">Verificación OTP</h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-xs">Hemos enviado un código SMS temporal a tu teléfono. Ingresa cualquier número de 4 dígitos para aprobar.</p>
              </div>

              <div className="flex justify-center gap-3 py-2">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="0 0 0 0"
                  value={simOtp}
                  onChange={(e) => setSimOtp(e.target.value.replace(/\D/g, ''))}
                  style={{ borderColor: "color-mix(in srgb, var(--border) 30%, transparent)" }}
                  className="w-32 h-12 text-center text-lg font-black tracking-widest bg-[var(--bg-secondary)] border rounded-xl outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--text-primary)]"
                />
              </div>

              <button
                type="submit"
                disabled={simOtp.length < 4}
                className="w-full h-12 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
              >
                Autorizar Pago por {formatPrice(finalPrice)}
              </button>
            </form>
          )}

          {/* ESTADO: PUSH NEQUI / DAVIPLATA */}
          {simState === 'nequi_push' && (
            <div className="w-full flex flex-col items-center text-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center animate-pulse">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-xs shadow">
                  !
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-lg text-[var(--text-primary)]">Aprobación en Celular</h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-xs leading-relaxed">
                  Hemos enviado una solicitud de pago por <b className="text-[var(--text-primary)]">{formatPrice(finalPrice)}</b> al celular <b className="text-[var(--text-primary)]">{nequi.phone}</b>.
                </p>
                <p className="text-xs font-semibold text-purple-600">
                  Abre tu aplicación bancaria en el celular y acepta el cobro pendiente.
                </p>
              </div>

              <div 
                style={{ borderColor: "color-mix(in srgb, var(--border) 40%, transparent)" }}
                className="bg-[var(--bg-secondary)] border rounded-xl px-5 py-3.5 w-full flex flex-col items-center gap-1.5 shadow-inner"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">El cobro expira en</span>
                <span className="text-2xl font-black font-mono text-[var(--text-primary)]">{formatCounterTime(simCounter)}</span>
              </div>

              <button
                onClick={handleSimulatePushApproval}
                className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm shadow mt-2 transition-transform hover:scale-[1.01] cursor-pointer"
              >
                Simular Aprobación en Celular
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
