"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Check } from "lucide-react";

import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { getSupabaseClient } from "@/lib/supabase/client";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const supabase = getSupabaseClient();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "comprador",
  });

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "vendedor") {
      setFormData(prev => ({ ...prev, userType: "vendedor" }));
    }
  }, [searchParams]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (formData.password.length < 6) {
      setError("La contraseña debe tener mínimo 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.userType,
          },
        },
      });

      if (signUpError) throw signUpError;
      await signIn(formData.email, formData.password);
      
      // ✅ Redirigir al dashboard según el rol escogido
      router.push(`/dashboard/${formData.userType}`);
      
    } catch (err: any) {
      if (err.message?.includes("User already registered")) {
        setError("Este correo ya está registrado");
      } else {
        setError("Error al crear la cuenta");
      }
      setLoading(false);
    }
  };

  const fields = [
    { id: "name", type: "text", placeholder: "María Fernanda Gómez", label: "Nombre completo" },
    { id: "email", type: "email", placeholder: "tu@email.com", label: "Correo electrónico" },
    { id: "password", type: "password", placeholder: "••••••••", label: "Contraseña" },
    { id: "confirmPassword", type: "password", placeholder: "••••••••", label: "Confirmar contraseña" },
  ];

  return (
    <div 
      className="w-full max-w-[500px] p-8 sm:p-12 relative z-10"
      style={{
        backgroundColor: "var(--bg-card)",
        borderRadius: "20px",
        boxShadow: "0 20px 60px var(--shadow)",
      }}
    >
      <div className="mb-8 text-center flex flex-col items-center">
        <h1
          className="font-display text-4xl sm:text-[40px] mb-2 tracking-wide font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Únete a VINT ✨
        </h1>
        <p className="text-[15px]" style={{ color: "var(--text-secondary)" }}>
          Únete a la mejor comunidad de moda vintage
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div
            className="text-[15px] font-medium text-center rounded-xl py-3 px-4"
            style={{
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
            }}
          >
            {error}
          </div>
        )}

        <div className="flex flex-col gap-6">
          {fields.map((field) => (
            <div key={field.id} className="flex flex-col gap-2 relative">
              <label
                htmlFor={field.id}
                className="uppercase font-semibold ml-1"
                style={{ 
                  fontSize: "11px", 
                  letterSpacing: "0.12em", 
                  color: "var(--accent)" 
                }}
              >
                {field.label}
              </label>
              <Input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                value={(formData as any)[field.id]}
                onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                required
                className="h-12 w-full text-[15px] px-4 transition-all duration-300 outline-none vint-input-glow vint-placeholder"
                style={{
                  borderRadius: "12px",
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid transparent",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 pt-2 pb-1">
          <label
            className="uppercase font-semibold ml-1"
            style={{ fontSize: "11px", letterSpacing: "0.12em", color: "var(--accent)" }}
          >
            Selecciona tu perfil principal
          </label>

          <RadioGroup
            value={formData.userType}
            onValueChange={(value) => setFormData({ ...formData, userType: value })}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { value: "comprador", label: "Quiero Comprar" },
              { value: "vendedor", label: "Quiero Vender" },
            ].map((type) => {
              const isSelected = formData.userType === type.value;
              return (
                <div
                  key={type.value}
                  className="relative flex flex-row items-center justify-center p-3 cursor-pointer transition-all duration-300"
                  style={{
                    borderRadius: "12px",
                    backgroundColor: isSelected ? "var(--bg-primary)" : "var(--bg-secondary)",
                    border: isSelected ? "1px solid var(--accent)" : "1px solid transparent",
                    boxShadow: isSelected ? "0 2px 10px var(--shadow)" : "none",
                  }}
                  onClick={() => setFormData({ ...formData, userType: type.value })}
                >
                  <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                  {isSelected && (
                     <Check className="absolute left-3 w-4 h-4" style={{ color: "var(--accent)" }} />
                  )}
                  <span
                    className="text-[14px] font-semibold text-center mt-[1px]"
                    style={{ 
                      color: isSelected ? "var(--accent)" : "var(--text-muted)",
                      marginLeft: isSelected ? "12px" : "0",
                      transition: "margin 0.3s ease"
                    }}
                  >
                    {type.label}
                  </span>
                </div>
              )
            })}
          </RadioGroup>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[52px] text-[15px] font-bold text-white mt-4 border-0 hover-scale flex items-center justify-center gap-2 relative overflow-hidden"
          style={{
            borderRadius: "12px",
            background: "linear-gradient(to right, var(--accent), var(--accent-hover))",
            boxShadow: "0 8px 20px var(--shadow)",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Creando cuenta...
            </>
          ) : "Crear cuenta gratis"}
        </button>

        <div className="relative py-4 flex items-center justify-center w-full">
          <div className="flex-1 border-t" style={{ borderColor: "var(--border)" }}></div>
          <span
            className="px-4 uppercase font-semibold"
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              color: "var(--text-muted)",
            }}
          >
            ¿Ya tienes cuenta?
          </span>
          <div className="flex-1 border-t" style={{ borderColor: "var(--border)" }}></div>
        </div>

        <div className="text-center pb-2">
          <Link
             href="/login"
             className="font-bold text-[15px] hover:opacity-80 transition-opacity drop-shadow-sm"
             style={{ color: "var(--accent)" }}
          >
             Iniciar sesión
          </Link>
        </div>
        
        <div className="mt-2 text-center text-xs">
         <Link href="/" className="font-medium hover:underline" style={{ color: "var(--text-muted)" }}>
            &larr; Volver al inicio
         </Link>
        </div>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen py-16 px-4 flex items-center justify-center relative animate-fade-in-up my-auto"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <style jsx global>{`
        .vint-input-glow:focus {
          box-shadow: 0 0 0 2px var(--accent) !important;
          border-color: var(--accent) !important;
        }
        .vint-placeholder::placeholder {
          color: var(--text-muted) !important;
          opacity: 0.8;
        }
        .hover-scale {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-scale:hover {
          transform: scale(1.02);
          box-shadow: 0 10px 25px var(--shadow);
        }
      `}</style>
      
      {/* Texture Layer */}
      <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.04]" style={{ backgroundImage: "url('data:image/svg+xml;utf8,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

      <Suspense fallback={<div className="relative z-10 w-full max-w-[500px] flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[var(--accent)]" /></div>}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}