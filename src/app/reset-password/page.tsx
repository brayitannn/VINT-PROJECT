"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "Mínimo 8 caracteres", ok: password.length >= 8 },
    { label: "Una letra mayúscula", ok: /[A-Z]/.test(password) },
    { label: "Un número", ok: /[0-9]/.test(password) },
  ];
  const passed = checks.filter(c => c.ok).length;

  return (
    <div style={{ marginTop: 12 }}>
      {/* Barra de progreso */}
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 99,
              backgroundColor: i < passed
                ? passed === 3 ? "#10B981" : passed === 2 ? "#F59E0B" : "#EF4444"
                : "var(--border)",
              transition: "background-color 0.3s",
            }}
          />
        ))}
      </div>
      {/* Checks */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {checks.map(check => (
          <div
            key={check.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: check.ok ? "#10B981" : "var(--text-muted)",
              fontWeight: check.ok ? 600 : 400,
              transition: "all 0.2s",
            }}
          >
            {check.ok ? <CheckCircle2 size={14} /> : <div style={{ width: 14, height: 14, borderRadius: "50%", border: "1.5px solid var(--border)" }} />}
            {check.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResetPasswordForm() {
  const supabase = createClient();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Escuchar el evento PASSWORD_RECOVERY de Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
        setCheckingSession(false);
      }
    });

    // También verificar si ya hay sesión activa
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      }
      setCheckingSession(false);
    };
    checkSession();

    return () => { subscription.unsubscribe(); };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError("La contraseña debe incluir al menos una letra mayúscula.");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError("La contraseña debe incluir al menos un número.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Error al restablecer la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="w-full max-w-[440px] relative z-10 flex flex-col items-center justify-center pt-12">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--accent)" }} />
        <p className="text-[14px] mt-4" style={{ color: "var(--text-muted)" }}>Verificando sesión de recuperación...</p>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="w-full max-w-[440px] relative z-10 flex flex-col pt-12">
        <div className="flex flex-col gap-6 mb-10">
          <Link href="/forgot-password" className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-70" style={{ color: "var(--accent)" }}>
            <ArrowLeft className="w-4 h-4" />
            Solicitar nuevo enlace
          </Link>
          <div className="flex flex-col gap-3">
            <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertCircle size={28} style={{ color: "#EF4444" }} />
            </div>
            <h2 className="text-[28px] font-bold tracking-tight leading-tight" style={{ color: "var(--text-primary)" }}>Enlace expirado</h2>
            <p className="text-[15px] font-medium" style={{ color: "var(--text-muted)" }}>
              Este enlace de recuperación ya no es válido. Solicita uno nuevo desde la página de recuperación de contraseña.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-[440px] relative z-10 flex flex-col pt-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div style={{ width: 72, height: 72, borderRadius: "50%", backgroundColor: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={36} style={{ color: "#10B981" }} />
          </div>
          <h2 className="text-[28px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>¡Contraseña actualizada!</h2>
          <p className="text-[15px]" style={{ color: "var(--text-muted)" }}>
            Tu contraseña ha sido restablecida correctamente. Serás redirigido al login en unos segundos...
          </p>
          <Link href="/login" className="text-sm font-bold mt-4 hover:underline" style={{ color: "var(--accent)" }}>
            Ir al login ahora →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[440px] relative z-10 flex flex-col pt-12">
      <div className="flex flex-col gap-6 mb-10">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-70" style={{ color: "var(--accent)" }}>
          <ArrowLeft className="w-4 h-4" />
          Volver al login
        </Link>
        <div className="flex flex-col gap-2">
          <h2 className="text-[32px] font-bold tracking-tight leading-tight" style={{ color: "var(--text-primary)" }}>Nueva Contraseña</h2>
          <p className="text-[15px] font-medium" style={{ color: "var(--text-muted)" }}>
            Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
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
              color: "#EF4444",
            }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold">Error</span>
              <span className="text-[13px] opacity-90 leading-relaxed mt-0.5">{error}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Nueva contraseña */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent)] z-20 pointer-events-none" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full h-[60px] text-[16px] transition-all duration-300 outline-none vint-input bg-[var(--bg-secondary)]"
              style={{
                borderRadius: "18px",
                border: "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
                color: "var(--text-primary)",
                paddingLeft: "52px",
                paddingRight: "52px",
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

          {newPassword && <PasswordStrength password={newPassword} />}

          {/* Confirmar contraseña */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent)] z-20 pointer-events-none" />
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirmar nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full h-[60px] text-[16px] transition-all duration-300 outline-none vint-input bg-[var(--bg-secondary)]"
              style={{
                borderRadius: "18px",
                border: "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
                color: "var(--text-primary)",
                paddingLeft: "52px",
                paddingRight: "52px",
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[60px] text-[17px] font-bold text-white rounded-[100px] flex items-center justify-center gap-2 relative overflow-hidden mt-2 vint-btn-primary"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Restablecer contraseña"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
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

      {/* Left - Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center relative z-10 min-h-screen overflow-y-auto">
        <div className="md:hidden flex flex-col items-center pt-12 mb-4 animate-fade-in-up">
          <Link href="/">
            <h1 className="text-[48px] font-bold tracking-tighter text-[var(--accent)] font-display">vint</h1>
          </Link>
        </div>
        <div className="animate-fade-in-up w-full flex flex-1 justify-center items-center pt-32 pb-12 px-6 sm:px-12" style={{ animationDelay: "0.1s" }}>
          <Suspense fallback={<div className="py-20"><Loader2 className="w-12 h-12 animate-spin text-[var(--accent)]" /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>

      {/* Right - Image */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ease-out sm:scale-105" style={{ backgroundImage: "url('/img/bg-forgot-password.jpg.jpeg')" }} />
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent" />
        <div className="absolute top-12 left-12 z-20">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-[48px] font-bold tracking-tighter leading-none font-display text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>vint</h1>
          </Link>
        </div>
        <div className="absolute bottom-20 left-12 z-20 max-w-md">
          <h2 className="text-4xl font-bold text-white leading-tight font-display mb-4">
            Nuevo comienzo,<br />mismo estilo.
          </h2>
          <p className="text-lg text-white/80 font-medium">
            Restablece tu contraseña y vuelve a explorar la moda circular en Vint.
          </p>
        </div>
      </div>
    </div>
  );
}
