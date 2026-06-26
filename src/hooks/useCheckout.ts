import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart, SHIPPING_COST } from "@/context/CartContext";
import { API_BASE_URL } from "@/lib/api";

export function useCheckout() {
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
    city: '',
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


  // --- Estado de la Simulación ---
  const [showSimModal, setShowSimModal] = useState(false);
  const [simState, setSimState] = useState<'none' | 'loading' | 'pse_login' | 'pse_otp' | 'nequi_push'>('none');
  const [simCounter, setSimCounter] = useState(299); // 4m 59s
  const [simOtp, setSimOtp] = useState('');
  const [simBankUser, setSimBankUser] = useState('');
  const [showLoader, setShowLoader] = useState(false);

  // Cálculo del Total sin descuento
  const finalPrice = totalPrice + SHIPPING_COST;

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

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateShipping()) return;

    setIsProcessing(true);

    // Abrir una ventana en blanco de inmediato para evitar que el navegador bloquee el popup
    const newWindow = typeof window !== 'undefined' ? window.open('about:blank', '_blank') : null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/checkout/mercadopago`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({
            id: String(item.id),
            name: item.name,
            price: Number(item.price),
            quantity: 1
          })),
          email_comprador: shipping.email || "comprador@vint.com"
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "No se pudo generar la preferencia de pago.");
      }

      const data = await response.json();
      if (data.initPoint) {
        if (newWindow) {
          newWindow.location.href = data.initPoint;
        } else if (typeof window !== 'undefined') {
          window.open(data.initPoint, '_blank');
        }
      } else {
        throw new Error("No se recibió la URL de pago de Mercado Pago.");
      }
    } catch (err: any) {
      console.error(err);
      if (newWindow) newWindow.close();
      alert("Error al procesar el pago: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => `$${price.toLocaleString('es-CO')} COP`;


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

    if (paymentMethod === 'delivery') {
      // Contraentrega simple
      await new Promise(resolve => setTimeout(resolve, 2000));
      finishOrder();
      return;
    }

    // Para tarjeta, pse, nequi: llamamos a la API interna de Next.js
    try {
      const response = await fetch(`${API_BASE_URL}/api/checkout/mercadopago`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({
            id: String(item.id),
            name: item.name,
            price: Number(item.price),
            quantity: 1
          })),
          email_comprador: shipping.email || "comprador@vint.com"
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "No se pudo generar la preferencia de pago.");
      }

      const data = await response.json();
      if (data.initPoint) {
        // Redirigir al portal de pago de Mercado Pago
        window.location.href = data.initPoint;
      } else {
        throw new Error("No se recibió la URL de pago de Mercado Pago.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error al procesar el pago: " + err.message);
      setIsProcessing(false);
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

  const finishOrder = async () => {
    setShowSimModal(false);
    setIsProcessing(false);
    setShowLoader(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    clearCart();
    router.push('/checkout/exito');
  };

  return {
    items,
    totalItems,
    totalPrice,
    totalWithShipping,
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
    setIsProcessing,
    showLoader
  };
}
