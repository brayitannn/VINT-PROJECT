"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Toast } from "@/components/forgot-password/Toast";

function ForgotPasswordForm() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [lastSubmittedEmail, setLastSubmittedEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      
      setLastSubmittedEmail(email);
      setShowToast(true);
      setEmail("");
    } catch (err: any) {
      console.error("Supabase Reset Error:", err);
      setError(err?.message || "No pudimos enviar el enlace. Verifica el correo e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] relative z-10 flex flex-col pt-12">
      <Toast show={showToast} email={lastSubmittedEmail} onClose={() => setShowToast(false)} />

      <div className="flex flex-col gap-6 mb-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-70"
          style={{ color: "var(--accent)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </Link>
        <div className="flex flex-col gap-2">
          <h2
            className="text-[32px] font-bold tracking-tight leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Recuperar Contraseña
          </h2>
          <p className="text-[15px] font-medium" style={{ color: "var(--text-muted)" }}>
            Te enviaremos un enlace para restablecer tu contraseña.
          </p><br />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div 
            className="flex items-start gap-3 p-4 rounded-2xl mb-2 animate-fade-in-up"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#EF4444"
            }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold">No se pudo enviar</span>
              <span className="text-[13px] opacity-90 leading-relaxed mt-0.5">{error}</span>
            </div>
          </div>
        )}

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
              paddingRight: "20px",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[60px] text-[17px] font-bold text-white rounded-[100px] flex items-center justify-center gap-2 relative overflow-hidden mt-2 vint-btn-primary"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar enlace de recuperación"}
        </button>
      </form>
    </div>
  );
}

export default function ForgotPasswordPage() {
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

      {/* LEFT — Formulario */}
      <div className="w-full md:w-1/2 flex flex-col items-center relative z-10 min-h-screen overflow-y-auto">

        {/* Mobile Logo */}
        <div className="md:hidden flex flex-col items-center pt-12 mb-4 animate-fade-in-up">
          <Link href="/">
            <h1 className="text-[48px] font-bold tracking-tighter text-[var(--accent)] font-display">vint</h1>
          </Link>
        </div>

        <div
          className="animate-fade-in-up w-full flex flex-1 justify-center items-center pt-32 pb-12 px-6 sm:px-12"
          style={{ animationDelay: "0.1s" }}
        >
          <Suspense fallback={<div className="py-20"><Loader2 className="w-12 h-12 animate-spin text-[var(--accent)]" /></div>}>
            <ForgotPasswordForm />
          </Suspense>
        </div>
      </div>

      {/* RIGHT — Imagen */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ease-out sm:scale-105"
          style={{ backgroundImage: "url('/bg-login.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent" />

        {/* Logo */}
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

        {/* TEXTO DE LA IMAGEN — reemplaza este bloque con el que quieras */}
        <div className="absolute bottom-20 left-12 z-20 max-w-md">
          <h2 className="text-4xl font-bold text-white leading-tight font-display mb-4">
            Tu contraseña,<br />tu seguridad.
          </h2>
          <p className="text-lg text-white/80 font-medium">
            En Vint protegemos tu cuenta para que puedas comprar y vender moda con total tranquilidad.
          </p>
        </div>

      </div>

    </div>
  );
}
