"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, Mail, AlertCircle, CheckCircle2, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

function VerifyContent() {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";
  const supabase = createClient();

  const [email, setEmail] = useState(emailFromUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    setLoading(true);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (resendError) throw resendError;
      setSent(true);
    } catch (err: any) {
      setError(err.message || "No se pudo reenviar el correo. Intenta de nuevo.");
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
          Volver al login
        </Link>

        <div className="flex flex-col items-center text-center gap-4">
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: sent ? "rgba(16, 185, 129, 0.1)" : "rgba(139, 94, 60, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s",
            }}
          >
            {sent ? (
              <MailCheck size={40} style={{ color: "#10B981" }} />
            ) : (
              <Mail size={40} style={{ color: "var(--accent)" }} />
            )}
          </div>

          <h2
            className="text-[28px] font-bold tracking-tight leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {sent ? "¡Correo reenviado!" : "Verifica tu cuenta"}
          </h2>

          <p className="text-[15px] font-medium leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {sent ? (
              <>
                Hemos enviado un nuevo enlace de verificación a{" "}
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>{email}</span>.
                Revisa tu bandeja de entrada y la carpeta de spam.
              </>
            ) : (
              <>
                Te hemos enviado un correo de verificación.
                Haz clic en el enlace del correo para activar tu cuenta en Vint.
              </>
            )}
          </p>
        </div>
      </div>

      {!sent && (
        <form onSubmit={handleResend} className="flex flex-col gap-5">
          {error && (
            <div
              className="flex items-start gap-3 p-4 rounded-2xl mb-2 animate-fade-in-up"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#EF4444",
              }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-[13px] leading-relaxed">{error}</span>
            </div>
          )}

          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "20px",
            }}
          >
            <p className="text-[13px] font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
              ¿No recibiste el correo?
            </p>
            <p className="text-[12px] mb-4" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Ingresa tu correo electrónico y te enviaremos un nuevo enlace de verificación. También revisa la carpeta de spam.
            </p>

            <div className="relative group mb-4">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent)] z-20 pointer-events-none" />
              <Input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-[52px] text-[15px] transition-all duration-300 outline-none vint-input bg-[var(--bg-primary)]"
                style={{
                  borderRadius: "14px",
                  border: "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
                  color: "var(--text-primary)",
                  paddingLeft: "48px",
                  paddingRight: "16px",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] text-[15px] font-bold text-white rounded-[100px] flex items-center justify-center gap-2 vint-btn-primary"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reenviar correo de verificación"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
              ¿Ya verificaste tu cuenta?{" "}
              <Link href="/login" className="font-bold hover:underline" style={{ color: "var(--accent)" }}>
                Inicia sesión
              </Link>
            </p>
          </div>
        </form>
      )}

      {sent && (
        <div className="flex flex-col gap-4 mt-4">
          <button
            onClick={() => setSent(false)}
            className="w-full h-[48px] text-[15px] font-bold rounded-[100px] flex items-center justify-center gap-2"
            style={{
              border: "1.5px solid var(--accent)",
              color: "var(--accent)",
              backgroundColor: "transparent",
            }}
          >
            Enviar otro correo
          </button>
          <div className="text-center">
            <Link href="/login" className="text-sm font-bold hover:underline" style={{ color: "var(--accent)" }}>
              Ir al login →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
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
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Left - Content */}
      <div className="w-full md:w-1/2 flex flex-col items-center relative z-10 min-h-screen overflow-y-auto">
        <div className="md:hidden flex flex-col items-center pt-12 mb-4 animate-fade-in-up">
          <Link href="/">
            <h1 className="text-[48px] font-bold tracking-tighter text-[var(--accent)] font-display">vint</h1>
          </Link>
        </div>
        <div className="animate-fade-in-up w-full flex flex-1 justify-center items-center pt-32 pb-12 px-6 sm:px-12" style={{ animationDelay: "0.1s" }}>
          <Suspense fallback={<div className="py-20"><Loader2 className="w-12 h-12 animate-spin text-[var(--accent)]" /></div>}>
            <VerifyContent />
          </Suspense>
        </div>
      </div>

      {/* Right - Image */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ease-out sm:scale-105" style={{ backgroundImage: "url('/img/bg-register.jpg')" }} />
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent" />
        <div className="absolute top-12 left-12 z-20">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-[48px] font-bold tracking-tighter leading-none font-display text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>vint</h1>
          </Link>
        </div>
        <div className="absolute bottom-20 left-12 z-20 max-w-md">
          <h2 className="text-4xl font-bold text-white leading-tight font-display mb-4">
            Un paso más<br />para tu estilo.
          </h2>
          <p className="text-lg text-white/80 font-medium">
            Verifica tu cuenta y comienza a comprar y vender moda con propósito.
          </p>
        </div>
      </div>
    </div>
  );
}
