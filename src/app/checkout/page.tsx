"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, SHIPPING_COST } from "@/context/CartContext";
import { 
  Loader2, 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Lock, 
  Smartphone, 
  Building2, 
  DollarSign, 
  Check, 
  CheckCircle,
  ChevronRight, 
  Ticket, 
  AlertCircle,
  Mail,
  ShieldCheck,
  Percent
} from "lucide-react";
import Image from "next/image";

// --- Utilidades de Formateo ---
const formatPrice = (price: number) => `$${price.toLocaleString('es-CO')} COP`;

const formatCardNumber = (value: string) => {
  return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim().slice(0, 19);
};

const formatExpiry = (value: string) => {
  return value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1/').slice(0, 5);
};

// --- Input estilizado premium con padding e icono corregidos ---
const PremiumInput = ({ icon: Icon, label, error, ...props }: any) => (
  <div className="flex flex-col gap-2 w-full">
    {label && (
      <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] ml-1">
        {label}
      </label>
    )}
    <div className="relative group w-full">
      {Icon && (
        <Icon 
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent)] z-20 pointer-events-none" 
        />
      )}
      <input
        {...props}
        style={{ 
          paddingLeft: Icon ? "48px" : "16px", 
          paddingRight: "16px",
          borderColor: error ? "rgb(239, 68, 68)" : "color-mix(in srgb, var(--border) 30%, transparent)"
        }}
        className="w-full h-[54px] text-[15px] transition-all duration-300 outline-none bg-[var(--bg-secondary)] border rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] placeholder-opacity-50 focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent focus:bg-[var(--bg-primary)]/20"
      />
    </div>
    {error && (
      <span className="text-red-500 text-xs ml-1 font-medium flex items-center gap-1 mt-0.5">
        <AlertCircle className="w-3.5 h-3.5" /> {error}
      </span>
    )}
  </div>
);

// --- Componente de Tarjeta de Crédito 3D ---
const CreditCardMockup = ({ number, name, expiry, cvc, focusedField }: any) => {
  const isFlipped = focusedField === 'cvc';
  
  // Detectar marca de tarjeta
  let brand = 'generic';
  const cleanNumber = number.replace(/\s+/g, '');
  if (cleanNumber.startsWith('4')) brand = 'visa';
  else if (cleanNumber.startsWith('5')) brand = 'mastercard';
  else if (cleanNumber.startsWith('3')) brand = 'amex';

  return (
    <div className="w-full max-w-[340px] h-[200px] mx-auto perspective-1000 mb-8 font-mono select-none">
      <div 
        className={`w-full h-full relative transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Lado Frontal */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between text-white backface-hidden shadow-xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #3a271c 0%, #1e130c 50%, #0d0805 100%)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          {/* Reflejos visuales (vidrio) */}
          <div className="absolute -right-20 -top-20 w-44 h-44 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div 
            className="absolute -left-20 -bottom-20 w-44 h-44 rounded-full blur-3xl pointer-events-none" 
            style={{ backgroundColor: "color-mix(in srgb, var(--accent) 15%, transparent)" }}
          />
          
          <div className="flex justify-between items-start z-10">
            {/* Chip */}
            <div className="w-11 h-8 rounded-md bg-gradient-to-br from-[#dfb15b] to-[#b3852d] relative overflow-hidden flex items-center justify-center border border-[#dfb15b]/20 shadow-inner">
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-25 gap-[1px] p-[2px]">
                {[...Array(9)].map((_, i) => <div key={i} className="border border-black/20" />)}
              </div>
            </div>
            {/* Logo de Franquicia */}
            <div>
              {brand === 'visa' && <span className="text-xl font-extrabold italic tracking-tighter text-blue-300">VISA</span>}
              {brand === 'mastercard' && (
                <div className="flex items-center -space-x-1.5">
                  <div className="w-5.5 h-5.5 rounded-full bg-red-500 opacity-90" />
                  <div className="w-5.5 h-5.5 rounded-full bg-yellow-500 opacity-90" />
                </div>
              )}
              {brand === 'amex' && <span className="text-xs font-bold tracking-tight bg-blue-600/40 px-2 py-0.5 rounded text-white border border-blue-400/20">AMEX</span>}
              {brand === 'generic' && <CreditCard className="w-7 h-7 opacity-70" />}
            </div>
          </div>

          <div className="space-y-3 z-10">
            {/* Número */}
            <div className="text-[18px] sm:text-[19px] font-semibold tracking-widest text-shadow-sm truncate">
              {number || '•••• •••• •••• ••••'}
            </div>

            <div className="flex justify-between items-end">
              {/* Titular */}
              <div className="flex flex-col min-w-0 pr-3">
                <span className="text-[8px] uppercase tracking-wider text-white/50">Titular de Tarjeta</span>
                <span className="text-[12px] uppercase tracking-wide truncate font-medium">
                  {name || 'TU NOMBRE COMPLETO'}
                </span>
              </div>
              {/* Expiración */}
              <div className="flex flex-col flex-shrink-0 items-end">
                <span className="text-[8px] uppercase tracking-wider text-white/50">Vence</span>
                <span className="text-[12px] font-medium">{expiry || 'MM/YY'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Reverso (CVC) */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl py-6 flex flex-col justify-between text-white backface-hidden rotate-y-180 shadow-xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1c130e 0%, #0d0805 100%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Banda Magnética */}
          <div className="w-full h-10 bg-black/90 mt-1" />

          <div className="px-6 flex flex-col gap-3 z-10">
            {/* Panel de Firma y CVC */}
            <div>
              <span className="text-[8px] uppercase tracking-wider text-white/40 block mb-1">Firma Autorizada</span>
              <div className="flex items-center gap-3">
                <div 
                  className="flex-1 h-8 rounded bg-white/10 flex items-center justify-end px-3"
                  style={{
                    background: "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 16px)"
                  }}
                >
                  <span className="text-white/40 font-serif italic text-xs truncate max-w-[120px]">{name || 'Vint Client'}</span>
                </div>
                <div className="w-12 h-8 bg-amber-50 rounded text-black flex items-center justify-center font-bold text-xs shadow-inner">
                  {cvc || '•••'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 opacity-40 justify-center">
              <Lock className="w-3 h-3" />
              <span className="text-[8px] tracking-widest uppercase font-sans">Pago Simulado Seguro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CheckoutPage() {
  const { items, totalItems, totalPrice, totalWithShipping, clearCart } = useCart();
  const router = useRouter();
  
  // --- Estados del Formulario ---
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Paso 1: Envío
  const [shipping, setShipping] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',        // ✅ CORREGIDO: antes tenía 'Bogotá' como valor por defecto
    additionalInfo: ''
  });
  const [shippingErrors, setShippingErrors] = useState<any>({});

  // Paso 2: Métodos de Pago
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pse' | 'nequi' | 'delivery'>('card');
  
  // Datos de tarjeta
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '' });
  const [focusedField, setFocusedField] = useState('');
  const [cardErrors, setCardErrors] = useState<any>({});

  // Datos de PSE
  const [pse, setPse] = useState({ bank: '', idType: 'CC', idNumber: '', email: '' });
  const [pseErrors, setPseErrors] = useState<any>({});

  // Datos de Nequi / Daviplata
  const [nequi, setNequi] = useState({ phone: '' });
  const [nequiErrors, setNequiErrors] = useState<any>({});

  // --- Códigos de Descuento ---
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' }); // 'success' | 'error'

  // --- Estado de la Simulación ---
  const [showSimModal, setShowSimModal] = useState(false);
  const [simState, setSimState] = useState<'none' | 'loading' | 'pse_login' | 'pse_otp' | 'nequi_push'>('none');
  const [simCounter, setSimCounter] = useState(299); // 4m 59s
  const [simOtp, setSimOtp] = useState('');
  const [simBankUser, setSimBankUser] = useState('');

  // Lista de bancos colombianos reales
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

  // Cálculo del Total considerando descuento
  const finalPrice = Math.max(0, totalPrice - discountAmount + SHIPPING_COST);

  // Contador regresivo para Nequi
  useEffect(() => {
    let timer: any;
    if (showSimModal && simState === 'nequi_push' && simCounter > 0) {
      timer = setInterval(() => {
        setSimCounter(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showSimModal, simState, simCounter]);

  const formatCounterTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // --- Validar Paso 1 (Envío) ---
  const validateShipping = () => {
    const errors: any = {};
    if (!shipping.name.trim()) errors.name = "El nombre es requerido.";
    if (!shipping.phone.trim() || shipping.phone.length < 7) errors.phone = "Número de teléfono inválido (min. 7 dígitos).";
    if (!shipping.email.trim() || !/\S+@\S+\.\S+/.test(shipping.email)) errors.email = "Ingresa un correo electrónico válido.";
    if (!shipping.address.trim()) errors.address = "La dirección de entrega es requerida.";
    if (!shipping.city.trim()) errors.city = "La ciudad es requerida.";
    
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- Aplicar Cupón de Descuento ---
  const handleApplyPromo = () => {
    const cleanPromo = promoCode.trim().toUpperCase();
    if (cleanPromo === 'VINT10' || cleanPromo === 'VINTAGE') {
      const discount = Math.round(totalPrice * 0.1);
      setDiscountAmount(discount);
      setPromoMessage({ text: `¡Cupón ${cleanPromo} aplicado! Recibes 10% de descuento (-${formatPrice(discount)})`, type: 'success' });
    } else if (cleanPromo === '') {
      setPromoMessage({ text: 'Por favor escribe un código.', type: 'error' });
    } else {
      setPromoMessage({ text: 'Código de descuento no válido.', type: 'error' });
    }
  };

  // --- Ejecución y Simulación del Pago ---
  const validatePayment = () => {
    if (paymentMethod === 'card') {
      const errors: any = {};
      const cleanNum = card.number.replace(/\s+/g, '');
      if (cleanNum.length < 15) errors.number = "Número de tarjeta incompleto.";
      if (!card.name.trim()) errors.name = "Nombre del titular requerido.";
      if (card.expiry.length < 5) errors.expiry = "Formato de expiración incorrecto (MM/YY).";
      if (card.cvc.length < 3) errors.cvc = "CVC inválido.";
      
      setCardErrors(errors);
      return Object.keys(errors).length === 0;
    }

    if (paymentMethod === 'pse') {
      const errors: any = {};
      if (!pse.bank) errors.bank = "Debes seleccionar un banco.";
      if (!pse.idNumber.trim()) errors.idNumber = "Ingresa tu número de documento.";
      if (!pse.email.trim() || !/\S+@\S+\.\S+/.test(pse.email)) errors.email = "Ingresa el email registrado en PSE.";
      
      setPseErrors(errors);
      return Object.keys(errors).length === 0;
    }

    if (paymentMethod === 'nequi') {
      const errors: any = {};
      if (!nequi.phone.trim() || nequi.phone.length < 10) errors.phone = "Número de celular inválido (10 dígitos).";
      
      setNequiErrors(errors);
      return Object.keys(errors).length === 0;
    }

    return true; // Contraentrega no requiere validación extra
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePayment()) return;

    setIsProcessing(true);

    if (paymentMethod === 'card') {
      // Simulación de procesamiento de tarjeta instantáneo y seguro
      await new Promise(resolve => setTimeout(resolve, 2500));
      finishOrder();
    } else if (paymentMethod === 'pse') {
      // Iniciar modal de simulación PSE
      setShowSimModal(true);
      setSimState('loading');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSimState('pse_login');
      setIsProcessing(false);
    } else if (paymentMethod === 'nequi') {
      // Iniciar modal de simulación push
      setShowSimModal(true);
      setSimCounter(299);
      setSimState('nequi_push');
      setIsProcessing(false);
    } else if (paymentMethod === 'delivery') {
      // Contraentrega simple
      await new Promise(resolve => setTimeout(resolve, 2000));
      finishOrder();
    }
  };

  const handlePseLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simBankUser.trim()) return;
    setSimState('loading');
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSimState('pse_otp');
  };

  const handlePseOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (simOtp.length < 4) return;
    setSimState('loading');
    await new Promise(resolve => setTimeout(resolve, 2000));
    finishOrder();
  };

  const handleSimulatePushApproval = async () => {
    setSimState('loading');
    await new Promise(resolve => setTimeout(resolve, 2000));
    finishOrder();
  };

  const finishOrder = () => {
    clearCart();
    setShowSimModal(false);
    setIsProcessing(false);
    router.push('/checkout/exito');
  };

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

      <div className="w-full max-w-6xl mx-auto px-4 pt-8 md:pt-16 relative z-10">
        
        {/* Barra de progreso de pasos */}
        <div className="w-full max-w-md mx-auto mb-16 px-4">
          <div className="flex items-center relative">
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

        {/* Layout Principal: Dos columnas en Desktop con mayor espacio (gap-10) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* COLUMNA IZQUIERDA (Formularios de Checkout) */}
          <div className="lg:col-span-7 flex flex-col gap-8 w-full">
            
            {/* Encabezado e indicador del paso */}
            <div 
              style={{ 
                backgroundColor: "color-mix(in srgb, var(--bg-card) 50%, transparent)",
                borderColor: "color-mix(in srgb, var(--border) 30%, transparent)"
              }}
              className="flex justify-between items-center border rounded-2xl p-6 shadow-sm"
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

            {/* PASO 1: FORMULARIO DE ENVÍO */}
            {step === 1 && (
              <form 
                onSubmit={handleNextStep} 
                style={{ borderColor: "color-mix(in srgb, var(--border) 30%, transparent)" }}
                className="bg-[var(--bg-card)] border rounded-3xl p-6 sm:p-8 shadow-md flex flex-col gap-6"
              >
                <h3 
                  style={{ borderBottomColor: "color-mix(in srgb, var(--border) 20%, transparent)" }}
                  className="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-2 flex items-center gap-2 border-b pb-3"
                >
                  <MapPin className="w-4 h-4 text-[var(--accent)]" /> 1. Dirección de Entrega
                </h3>
                
                <div className="flex flex-col gap-6">
                  <PremiumInput 
                    icon={User}
                    label="Nombre Completo"
                    placeholder="Ej. Juan Pérez"
                    value={shipping.name}
                    onChange={(e: any) => setShipping({ ...shipping, name: e.target.value })}
                    error={shippingErrors.name}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] ml-1">
                      Instrucciones Adicionales (Opcional)
                    </label>
                    <textarea
                      placeholder="Ej. Conjunto residencial, torre A, portería"
                      value={shipping.additionalInfo}
                      onChange={(e: any) => setShipping({ ...shipping, additionalInfo: e.target.value })}
                      style={{ borderColor: "color-mix(in srgb, var(--border) 30%, transparent)" }}
                      className="w-full min-h-[90px] border rounded-xl px-4 py-3 outline-none text-[15px] transition-all bg-[var(--bg-secondary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] placeholder-opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-[54px] rounded-xl font-bold text-white bg-[var(--accent)] hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-transform duration-300 hover:scale-[1.01] mt-4 cursor-pointer"
                >
                  Continuar al Pago
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* PASO 2: FORMULARIO DE MÉTODOS DE PAGO */}
            {step === 2 && (
              <form 
                onSubmit={handleCheckoutSubmit} 
                style={{ borderColor: "color-mix(in srgb, var(--border) 30%, transparent)" }}
                className="bg-[var(--bg-card)] border rounded-3xl p-6 sm:p-8 shadow-md flex flex-col gap-8"
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
                  <div className="flex flex-col gap-6 animate-fade-in-up">
                    
                    {/* Mockup interactivo 3D */}
                    <CreditCardMockup 
                      number={card.number}
                      name={card.name}
                      expiry={card.expiry}
                      cvc={card.cvc}
                      focusedField={focusedField}
                    />

                    <div className="flex flex-col gap-6">
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

                      <div className="grid grid-cols-2 gap-6">
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
                  <div className="flex flex-col gap-6 animate-fade-in-up">
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 rounded-xl p-4 flex gap-3 items-start text-xs font-medium">
                      <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm">Pago Seguro PSE</p>
                        <p className="opacity-80 mt-1 leading-relaxed">Al presionar pagar, se abrirá un portal bancario simulado interactivo de alta fidelidad para completar el pago.</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] ml-1">
                        Selecciona tu Banco
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

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] ml-1 block mb-2">
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
                  <div className="flex flex-col gap-6 animate-fade-in-up">
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 rounded-xl p-4 flex gap-3 items-start text-xs font-medium">
                      <Smartphone className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm">Billeteras Móviles (Nequi / DaviPlata)</p>
                        <p className="opacity-80 mt-1 leading-relaxed">Te enviaremos una notificación de aprobación (Push) en tiempo real a tu celular para simular el cobro de tu cuenta.</p>
                      </div>
                    </div>

                    <PremiumInput 
                      icon={Phone}
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
                    className="flex flex-col gap-5 p-6 rounded-2xl border animate-fade-in-up"
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
            )}

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

          {/* COLUMNA DERECHA (Resumen de Compra - Sticky) */}
          <div className="lg:col-span-5 w-full lg:sticky lg:top-8 flex flex-col gap-6">
            
            <div 
              style={{ 
                backgroundColor: "color-mix(in srgb, var(--bg-card) 80%, transparent)",
                borderColor: "color-mix(in srgb, var(--border) 40%, transparent)"
              }}
              className="backdrop-blur-xl border rounded-3xl p-6 sm:p-8 shadow-lg"
            >
              <h2 
                style={{ borderBottomColor: "color-mix(in srgb, var(--border) 20%, transparent)" }}
                className="text-xl font-bold mb-6 tracking-tight text-[var(--text-primary)] border-b pb-4"
              >
                Resumen de Orden ({totalItems} {totalItems === 1 ? 'prenda' : 'prendas'})
              </h2>

              {/* Lista de productos con mejor espacio */}
              <div className="space-y-5 mb-6 max-h-[340px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[var(--border)]/50 [&::-webkit-scrollbar-thumb]:rounded-full">
                {items.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[var(--text-muted)]">
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
                style={{ borderTopColor: "color-mix(in srgb, var(--border) 20%, transparent)" }}
                className="border-t pt-6 mt-6 flex flex-col gap-3"
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
                    style={{ borderColor: "color-mix(in srgb, var(--border) 30%, transparent)" }}
                    className="flex-1 h-11 text-sm bg-[var(--bg-secondary)] border rounded-xl px-4 outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--text-primary)]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="h-11 px-5 text-xs font-extrabold rounded-xl hover:opacity-95 transition-all flex-shrink-0 cursor-pointer bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm hover:scale-[1.01]"
                  >
                    Aplicar
                  </button>
                </div>
                {promoMessage.text && (
                  <div className={`text-xs font-bold flex items-center gap-1.5 px-3 py-2.5 rounded-lg mt-1 ${
                    promoMessage.type === 'success' 
                      ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
                      : 'bg-red-500/10 text-red-700 dark:text-red-400'
                  }`}>
                    {promoMessage.type === 'success' ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span>{promoMessage.text}</span>
                  </div>
                )}
              </div>

              {/* Desglose de totales */}
              <div 
                style={{ 
                  backgroundColor: "color-mix(in srgb, var(--bg-secondary) 35%, transparent)",
                  borderColor: "color-mix(in srgb, var(--border) 20%, transparent)"
                }}
                className="border rounded-2xl p-5 space-y-4 mt-6 text-sm"
              >
                <div className="flex justify-between text-[var(--text-secondary)] font-medium">
                  <span>Subtotal</span>
                  <span className="text-[var(--text-primary)] font-semibold">{formatPrice(totalPrice)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span className="flex items-center gap-1"><Percent className="w-3.5 h-3.5" /> Descuento (10%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[var(--text-secondary)] font-medium">
                  <span>Costo de Envío</span>
                  <span className="text-[var(--text-primary)] font-semibold">{formatPrice(SHIPPING_COST)}</span>
                </div>

                <div 
                  style={{ borderTopColor: "color-mix(in srgb, var(--border) 20%, transparent)" }}
                  className="flex justify-between items-end pt-5 border-t border-dashed mt-2"
                >
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--text-secondary)]">
                    Total Final
                  </span>
                  <span className="text-2xl font-black tracking-tight text-[var(--text-primary)] leading-none">
                    {formatPrice(finalPrice)}
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL DE SIMULACIÓN DE PAGOS INTERACTIVO (ALTA FIDELIDAD) */}
      {/* ======================================================== */}
      {showSimModal && (
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
                className="text-white/60 hover:text-white text-xs font-bold"
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
      )}

    </div>
  );
}