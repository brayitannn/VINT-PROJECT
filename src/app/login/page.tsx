"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const supabase = getSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen py-10 px-4 flex items-center justify-center relative animate-fade-in-up"
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
          box-shadow: 0 8px 20px var(--shadow);
        }
        .outline-hover-tint {
          transition: background-color 0.3s ease;
        }
        .outline-hover-tint:hover {
          background-color: color-mix(in srgb, var(--accent) 8%, transparent);
        }
        /* Color amber for the checkmark */
        #remember[data-state=checked] {
          background-color: var(--accent) !important;
          border-color: var(--accent) !important;
        }
        .vint-link {
          transition: color 0.3s ease;
        }
        .vint-link:hover {
          color: var(--accent) !important;
        }
      `}</style>
      
      {/* Texture Layer */}
      <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.04]" style={{ backgroundImage: "url('data:image/svg+xml;utf8,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

      <div 
        className="w-full max-w-[460px] p-8 sm:p-12 relative z-10"
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "20px",
          boxShadow: "0 20px 60px var(--shadow)",
        }}
      >
        <div className="mb-8 text-center flex flex-col items-center">
          <h1
            className="font-display text-4xl sm:text-[40px] mb-2 font-bold"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            ¡Hola de nuevo! ✨
          </h1>
          <p className="text-[15px]" style={{ color: "var(--text-secondary)" }}>
            Ingresa a tu cuenta para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[22px]">
          {error && (
            <div
              className="text-sm font-medium text-center rounded-xl py-3 px-4"
              style={{
                backgroundColor: "#fee2e2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
              }}
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-[22px]">
            <div className="flex flex-col gap-2 relative">
              <label
                htmlFor="email"
                className="uppercase font-semibold ml-1"
                style={{ 
                  fontSize: "11px", 
                  letterSpacing: "0.12em", 
                  color: "var(--accent)" 
                }}
              >
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <div className="flex flex-col gap-2 relative">
              <div className="flex items-center justify-between ml-1 w-full">
                <label
                  htmlFor="password"
                  className="uppercase font-semibold"
                  style={{ 
                    fontSize: "11px", 
                    letterSpacing: "0.12em", 
                    color: "var(--accent)" 
                  }}
                >
                  Contraseña
                </label>
                <Link
                  href="/forgot-password"
                  className="hover:underline transition-all"
                  style={{ fontSize: "11px", color: "var(--accent)", fontWeight: "600", letterSpacing: "0.05em" }}
                >
                  ¿La olvidaste?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <div className="flex items-center space-x-3 ml-1">
            <Checkbox 
              id="remember" 
              className="h-[18px] w-[18px] transition-colors" 
              style={{ borderRadius: "4px", border: '1.5px solid var(--accent)' }} 
            />
            <label
              htmlFor="remember"
              className="text-[13px] cursor-pointer select-none"
              style={{ color: "var(--text-secondary)", fontWeight: "500" }}
            >
              Mantener mi sesión iniciada
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] text-[15px] font-bold text-white mt-2 border-0 hover-scale flex items-center justify-center gap-2 relative overflow-hidden"
            style={{
              borderRadius: "14px",
              background: "linear-gradient(to right, var(--accent), var(--accent-hover))",
              boxShadow: "0 8px 20px var(--shadow)",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Ingresando...
              </>
            ) : "Ingresar a VINT"}
          </button>

          <div className="relative py-2 flex items-center justify-center w-full">
            <div className="flex-1 border-t" style={{ borderColor: "var(--border)" }}></div>
            <span
              className="px-4 uppercase font-semibold"
              style={{
                fontSize: "11px",
                letterSpacing: "0.1em",
                color: "var(--text-muted)",
              }}
            >
              ¿Eres nuevo?
            </span>
            <div className="flex-1 border-t" style={{ borderColor: "var(--border)" }}></div>
          </div>

          <button
            type="button"
            className="outline-hover-tint w-full h-[52px] text-[15px] font-bold flex items-center justify-center relative overflow-hidden transition-all duration-300"
            style={{
              borderRadius: "14px",
              border: "1.5px solid var(--accent)",
              backgroundColor: "transparent",
              color: "var(--accent)",
            }}
            onClick={() => router.push("/register")}
          >
            Crear una cuenta gratis
          </button>

          <div className="mt-2 text-center text-[13px]">
           <Link href="/" className="font-semibold vint-link" style={{ color: "var(--text-secondary)" }}>
              &larr; Volver al inicio
           </Link>
          </div>
        </form>
      </div>
    </div>
  );
}