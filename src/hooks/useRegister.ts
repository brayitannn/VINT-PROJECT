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
    if (formData.password.length < 6) {
      setError("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: `${formData.primerNombre} ${formData.primerApellido}`.trim(),
            primer_nombre: formData.primerNombre,
            segundo_nombre: formData.segundoNombre,
            primer_apellido: formData.primerApellido,
            segundo_apellido: formData.segundoApellido,
            role: formData.userType,
            fecha_nacimiento: formData.fechaNacimiento,
            genero: formData.genero,
            telefono: formData.phone,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Si Supabase requiere verificación de correo
      if (data.user && !data.session) {
        router.push('/login?message=Revisa tu correo para verificar tu cuenta')
        return
      }

      // Si no requiere verificación, entrar directo
      await signIn(formData.email, formData.password);
      router.push(`/dashboard/${formData.userType}`);

    } catch (err: any) {
      if (err.message?.includes("User already registered")) {
        setError("Este correo ya está registrado.");
      } else {
        setError("Ocurrió un error al crear la cuenta.");
      }
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
    error,
    handleSubmit
  };
}
