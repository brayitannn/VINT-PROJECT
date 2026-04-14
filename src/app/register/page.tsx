"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Check, ShoppingBag, Store, ArrowLeft, User, Mail, Lock, Eye, EyeOff, ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { VintSelect } from "@/components/ui/VintSelect";

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
    fechaNacimiento: "",
    genero: "",
  });

  const hoy = new Date().toISOString().split('T')[0];

  const [showPassword, setShowPassword] = useState(false);
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
          name: formData.name,
          role: formData.userType,
          fecha_nacimiento: formData.fechaNacimiento,
          genero: formData.genero,
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

  return (
    <div className="w-full max-w-[480px] relative z-10 flex flex-col pt-24">
      <div className="flex flex-col gap-6 mb-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-70" 
          style={{ color: "var(--accent)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Vint
        </Link>
        <div className="flex flex-col gap-2">
          <h2 className="text-[32px] font-bold tracking-tight leading-tight" style={{ color: "var(--text-primary)" }}>Únete a VINT</h2>
          <p className="text-[15px] font-medium" style={{ color: "var(--text-muted)" }}>Compra y vende moda de nivel.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="text-[14px] text-center p-4 rounded-2xl mb-2 font-medium bg-red-50 text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Nombre completo */}
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent)] z-20 pointer-events-none" />
            <Input
              type="text"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full h-[60px] text-[16px] transition-all duration-300 outline-none vint-input bg-[var(--bg-secondary)]"
              style={{
                 borderRadius: "18px",
                 border: "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
                 color: "var(--text-primary)",
                 paddingLeft: "52px",
                 paddingRight: "20px"
              }}
            />
          </div>

          {/* Email */}
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent)] z-20 pointer-events-none" />
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full h-[60px] text-[16px] transition-all duration-300 outline-none vint-input bg-[var(--bg-secondary)]"
              style={{
                 borderRadius: "18px",
                 border: "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
                 color: "var(--text-primary)",
                 paddingLeft: "52px",
                 paddingRight: "20px"
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent)] z-20 pointer-events-none" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full h-[60px] text-[16px] transition-all duration-300 outline-none vint-input bg-[var(--bg-secondary)]"
                style={{
                   borderRadius: "18px",
                   border: "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
                   color: "var(--text-primary)",
                   paddingLeft: "52px",
                   paddingRight: "45px"
                }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors z-30"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative group">
              <Input
                type="password"
                placeholder="Confirmar"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full h-[60px] text-[16px] transition-all duration-300 outline-none vint-input bg-[var(--bg-secondary)]"
                style={{
                   borderRadius: "18px",
                   border: "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
                   color: "var(--text-primary)",
                   paddingLeft: "20px",
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fecha de Nacimiento */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold uppercase tracking-wider ml-1" style={{ color: "var(--text-muted)" }}>Fecha de Nacimiento</label>
              <Input
                type="date"
                max={hoy}
                value={formData.fechaNacimiento}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                required
                className="w-full h-[60px] text-[16px] transition-all duration-300 outline-none vint-input bg-[var(--bg-secondary)]"
                style={{
                   borderRadius: "18px",
                   border: "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
                   color: "var(--text-muted)",
                   paddingLeft: "20px",
                   paddingRight: "20px"
                }}
              />
            </div>

            {/* Género */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold uppercase tracking-wider ml-1" style={{ color: "var(--text-muted)" }}>Género</label>
              <VintSelect
                value={formData.genero}
                onChange={(val) => setFormData({ ...formData, genero: val })}
                options={[
                  { value: "Hombre", label: "Hombre" },
                  { value: "Mujer", label: "Mujer" },
                  { value: "Prefiero no decirlo", label: "Prefiero no decirlo" },
                ]}
                placeholder="Selecciona una opción"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-6">
          <label className="text-[13px] font-bold uppercase tracking-wider block text-center" style={{ color: "var(--text-muted)" }}>¿A qué vienes a Vint?</label>
          <RadioGroup
             value={formData.userType}
             onValueChange={(value) => setFormData({ ...formData, userType: value })}
             className="grid grid-cols-2 gap-4"
          >
             {[
               { value: "comprador", label: "Solo Comprar", icon: ShoppingBag },
               { value: "vendedor", label: "Quiero Vender", icon: Store },
             ].map((type) => {
               const isSelected = formData.userType === type.value;
               const Icon = type.icon;
               return (
                 <label 
                   key={type.value}
                   className="relative flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-400 group overflow-hidden"
                   style={{
                      borderRadius: "24px",
                      border: isSelected ? "2px solid var(--accent)" : "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
                      backgroundColor: isSelected ? "color-mix(in srgb, var(--bg-card) 90%, transparent)" : "var(--bg-secondary)",
                      transform: isSelected ? "translateY(-4px)" : "translateY(0)",
                      boxShadow: isSelected ? "0 12px 24px color-mix(in srgb, var(--accent) 15%, transparent)" : "none",
                   }}
                 >
                   <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                   
                   {isSelected && (
                      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle at center, var(--accent) 0%, transparent 70%)" }}></div>
                   )}

                   {isSelected && (
                     <div className="absolute top-4 right-4 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
                       <div className="flex items-center justify-center w-5 h-5 rounded-full text-white" style={{ backgroundColor: "var(--accent)" }}>
                         <Check className="w-3 h-3 stroke-[3]" />
                       </div>
                     </div>
                   )}
                   <Icon className="w-9 h-9 mb-3 transition-colors duration-300 relative z-10" style={{ color: isSelected ? "var(--accent)" : "var(--text-muted)" }} />
                   <span className="text-[15px] font-bold text-center leading-tight relative z-10" style={{ color: isSelected ? "var(--accent)" : "var(--text-primary)" }}>{type.label}</span>
                 </label>
               )
             })}
          </RadioGroup>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[64px] text-[17px] font-bold text-white rounded-[100px] shadow-soft flex items-center justify-center gap-2 relative overflow-hidden mt-2"
          style={{
            background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
            opacity: loading ? 0.7 : 1,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Crear mi cuenta"}
        </button>
        
        <div className="mt-4 text-center">
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Al registrarte, aceptas nuestras{" "}
              <span className="font-semibold cursor-pointer hover:underline" style={{ color: "var(--text-secondary)" }}>Condiciones</span>
              {" "}y la{" "}
              <span className="font-semibold cursor-pointer hover:underline" style={{ color: "var(--text-secondary)" }}>Política de Privacidad</span>.
            </p>
        </div>

        <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-[15px] text-[var(--text-muted)]">
                ¿Ya tienes una cuenta?{" "}
                <Link 
                    href="/login" 
                    className="font-bold hover:underline"
                    style={{ color: "var(--accent)" }}
                >
                    Inicia sesión
                </Link>
            </p>
        </div>

      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row relative w-full overflow-hidden bg-[var(--bg-primary)]">
      <style jsx global>{`
        .vint-input::placeholder {
          color: var(--text-muted) !important;
          opacity: 0.7;
          font-weight: 500;
        }
        .vint-input:focus {
          box-shadow: 0 0 0 2px var(--accent) !important;
          border-color: transparent !important;
          background-color: transparent !important;
        }
        .shadow-soft:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px color-mix(in srgb, var(--accent) 30%, transparent);
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      
      {/* Left Section - Image */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ease-out sm:scale-105"
          style={{ backgroundImage: "url('/bg-register.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        
        {/* Logo overlay on image */}
        <div className="absolute top-12 left-12 z-20">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h1 
                className="text-[48px] font-bold tracking-tighter leading-none font-display text-white" 
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
              >
                  vint
              </h1>
            </Link>
        </div>

        <div className="absolute bottom-20 left-12 z-20 max-w-md">
            <h2 className="text-4xl font-bold text-white leading-tight font-display mb-4">
                Redefinimos lo retro,<br/>inspiramos el futuro.
            </h2>
            <p className="text-lg text-white/80 font-medium">
                La comunidad de moda vintage más grande de Colombia te está esperando.
            </p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center relative z-10 min-h-screen overflow-y-auto">
         
         {/* Mobile Logo Only */}
         <div className="md:hidden flex flex-col items-center pt-12 mb-4 animate-fade-in-up">
            <Link href="/">
              <h1 className="text-[48px] font-bold tracking-tighter text-[var(--accent)] font-display">vint</h1>
            </Link>
         </div>
         
         <div className="animate-fade-in-up w-full flex flex-1 justify-center items-center pt-32 pb-12 px-6 sm:px-12" style={{ animationDelay: "0.1s" }}>
           <Suspense fallback={<div className="py-20"><Loader2 className="w-12 h-12 animate-spin text-[var(--accent)]" /></div>}>
             <RegisterForm />
           </Suspense>
         </div>

      </div>
    </div>
  )
}