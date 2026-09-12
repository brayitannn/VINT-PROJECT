import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart, SHIPPING_COST } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { procesarCompra } from "@/services/pedidos";

export function useCheckout() {
  const { items, totalItems, totalPrice, totalWithShipping, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  // --- Estados de Flujo ---
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  // --- Paso 1: Envío ---
  const [shipping, setShipping] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    additionalInfo: ''
  });
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});

  // Auto-completar datos si el usuario está autenticado
  useEffect(() => {
    if (user) {
      setShipping(prev => ({
        ...prev,
        email: prev.email || user.email || '',
        name: prev.name || user.user_metadata?.nombre || user.user_metadata?.full_name || ''
      }));
    }
  }, [user]);

  // Cálculo del Total
  const finalPrice = totalPrice + SHIPPING_COST;

  // --- Validar Envío ---
  const validateShipping = () => {
    const errors: Record<string, string> = {};
    if (!shipping.name.trim()) errors.name = "El nombre es requerido.";
    if (!shipping.phone.trim() || shipping.phone.length < 7) errors.phone = "Número de teléfono inválido (mín. 7 dígitos).";
    if (!shipping.email.trim() || !/\S+@\S+\.\S+/.test(shipping.email)) errors.email = "Ingresa un correo electrónico válido.";
    if (!shipping.address.trim()) errors.address = "La dirección de entrega es requerida.";
    if (!shipping.city.trim()) errors.city = "La ciudad es requerida.";

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Procesar Compra Simulada ---
  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    if (!validateShipping()) return;

    if (!user) {
      alert("Debes iniciar sesión para completar la compra.");
      router.push("/login?redirect=/checkout");
      return;
    }

    setIsProcessing(true);

    try {
      // Simulación de procesamiento de pago (1.2 segundos para feedback visual)
      await new Promise(resolve => setTimeout(resolve, 1200));

      const itemsPayload = items.map(item => ({
        id_prenda: Number(item.id),
        precio: Number(item.price)
      }));

      const response = await procesarCompra(
        itemsPayload,
        {
          nombre: shipping.name,
          telefono: shipping.phone,
          email: shipping.email,
          direccion: shipping.address,
          ciudad: shipping.city,
          info_adicional: shipping.additionalInfo || undefined
        },
        SHIPPING_COST
      );

      // Mostrar pantalla de carga de transición
      setShowLoader(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Limpiar carrito tras éxito
      clearCart();

      const primerPedidoId = response.data?.pedidos?.[0]?.id || '';
      router.push(`/checkout/exito?order_id=${primerPedidoId}`);
    } catch (err: any) {
      console.error("Error al procesar compra:", err);
      alert(err.message || "Ocurrió un error al procesar tu compra. Por favor intenta de nuevo.");
      setIsProcessing(false);
      setShowLoader(false);
    }
  };

  const formatPrice = (price: number) => `$${price.toLocaleString('es-CO')} COP`;

  return {
    items,
    totalItems,
    totalPrice,
    totalWithShipping,
    step,
    setStep,
    isProcessing,
    setIsProcessing,
    shipping,
    setShipping,
    shippingErrors,
    finalPrice,
    handleNextStep,
    showLoader,
    formatPrice
  };
}
