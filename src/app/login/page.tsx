"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { getSupabaseClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const supabase = getSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      
      const { data: { user } } = await supabase.auth.getUser();
      let role = user?.user_metadata?.role || "comprador";
      if (role === "buyer") role = "comprador";
      if (role === "seller") role = "vendedor";

      router.push(`/dashboard/${role}`);
      
    } catch (err: any) {
      setError("Credenciales incorrectas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] relative z-10 flex flex-col pt-12">
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
          <h2 className="text-[32px] font-bold tracking-tight leading-tight" style={{ color: "var(--text-primary)" }}>Bienvenido</h2>
          <p className="text-[15px] font-medium" style={{ color: "var(--text-muted)" }}>Ingresa tus credenciales para continuar.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="text-[14px] text-center p-4 rounded-2xl mb-2 font-medium bg-red-50 text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent)] z-20 pointer-events-none" />
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent)] z-20 pointer-events-none" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-[60px] text-[16px] transition-all duration-300 outline-none vint-input bg-[var(--bg-secondary)]"
              style={{
                 borderRadius: "18px",
                 border: "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
                 color: "var(--text-primary)",
                 paddingLeft: "52px",
                 paddingRight: "52px"
              }}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-1">
          <Link 
            href="/forgot-password" 
            className="text-sm font-semibold hover:underline"
            style={{ color: "var(--accent)" }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[60px] text-[17px] font-bold text-white rounded-[100px] shadow-soft flex items-center justify-center gap-2 relative overflow-hidden mt-2"
          style={{
            background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
            opacity: loading ? 0.7 : 1,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Iniciar sesión"}
        </button>
        
        <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-[15px] text-[var(--text-muted)]">
                ¿Aún no tienes cuenta?{" "}
                <Link 
                    href="/register" 
                    className="font-bold hover:underline"
                    style={{ color: "var(--accent)" }}
                >
                    Regístrate aquí
                </Link>
            </p>
        </div>

      </form>
    </div>
  );
}

export default function LoginPage() {
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
          style={{ backgroundImage: "url('/bg-login.jpg')" }}
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
                Redescubre la moda,<br/>revoluciona tu estilo.
            </h2>
            <p className="text-lg text-white/80 font-medium">
                Únete a la comunidad más exclusiva de moda circular en Colombia.
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
             <LoginForm />
           </Suspense>
         </div>

      </div>
    </div>
  )
}