import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getSupabaseClient } from "@/lib/supabase/client";

export function useRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const supabase = getSupabaseClient();

  const [formData, setFormData] = useState({
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    userType: "comprador",
    fechaNacimiento: "",
    genero: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "vendedor") {
      setFormData(prev => ({ ...prev, userType: "vendedor" }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (formData.password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError("La contraseña debe incluir al menos una letra mayúscula.");
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      setError("La contraseña debe incluir al menos un número.");
      return;
    }

    setLoading(true);
    setShowLoader(true);
    try {
      // aqui empieza el cambio q hice
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            // esto para el dashboard de supabase para que aparezca el nombre en auth
            full_name: `${formData.primerNombre} ${formData.primerApellido}`.trim(),

            // esto para tabla de seguridad usuarios y que se manden
            primer_nombre: formData.primerNombre,
            segundo_nombre: formData.segundoNombre || '',
            primer_apellido: formData.primerApellido,
            segundo_apellido: formData.segundoApellido || '',
            fecha_nacimiento: formData.fechaNacimiento,
            genero: formData.genero,
            telefono: formData.phone,
            id_rol: formData.userType === 'vendedor' ? 2 : 1
          },
        },
      });




      if (signUpError) throw signUpError;

      // Si Supabase requiere verificación de correo
      if (data.user && !data.session) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        router.push(`/verify?email=${encodeURIComponent(formData.email)}`)
        return
      }

      // Si no requiere verificación, entrar directo
      await signIn(formData.email, formData.password);
      await new Promise((resolve) => setTimeout(resolve, 2500));
      router.push(`/dashboard/${formData.userType}`);

    } catch (err: any) {
      console.error("Error en registro:", err);
      if (err.message?.includes("User already registered")) {
        setError("Este correo ya está registrado.");
      } else {
        setError(err.message || "Ocurrió un error al crear la cuenta.");
      }
      setShowLoader(false);
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    showLoader,
    error,
    handleSubmit
  };
}
