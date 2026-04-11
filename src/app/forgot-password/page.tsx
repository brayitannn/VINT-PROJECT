"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

function ForgotPasswordForm() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      setError("No pudimos enviar el enlace. Verifica el correo e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] relative z-10 flex flex-col pt-12">
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
          </p>
        </div>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="text-[14px] text-center p-4 rounded-2xl mb-2 font-medium bg-red-50 text-red-600 border border-red-100">
              {error}
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
            className="w-full h-[60px] text-[17px] font-bold text-white rounded-[100px] shadow-soft flex items-center justify-center gap-2 relative overflow-hidden mt-2"
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
              opacity: loading ? 0.7 : 1,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar enlace de recuperación"}
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-5">
          <div
            className="p-5 rounded-2xl flex items-start gap-4"
            style={{
              backgroundColor: "rgba(34,197,94,0.08)",
              border: "1.5px solid rgba(34,197,94,0.25)",
            }}
          >
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <p className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
                ¡Enlace enviado!
              </p>
              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                Hemos enviado el enlace de recuperación a{" "}
                <strong style={{ color: "var(--text-primary)" }}>{email}</strong>.
                Revisa tu bandeja de entrada y la carpeta de spam.
              </p>
            </div>
          </div>

          <button
            onClick={() => { setSubmitted(false); setEmail(""); }}
            className="w-full h-[60px] text-[17px] font-bold rounded-[100px] flex items-center justify-center gap-2 mt-2"
            style={{
              border: "1.5px solid var(--accent)",
              color: "var(--accent)",
              background: "transparent",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Enviar de nuevo
          </button>

          <div className="mt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity"
              style={{ color: "var(--accent)" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      )}
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