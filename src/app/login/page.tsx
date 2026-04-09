"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

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
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-md animate-fade-in-up">

        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
            Vint
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Ropa de segunda mano
          </p>
        </div>

        <Card
          className="border shadow-lg"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border)",
            boxShadow: "0 8px 32px var(--shadow)",
          }}
        >
          <CardHeader className="px-8 pt-8 pb-2 space-y-1">
            <CardTitle
              className="text-2xl font-bold text-center font-display"
              style={{ color: "var(--text-primary)" }}
            >
              Iniciar Sesión
            </CardTitle>
            <CardDescription
              className="text-center text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Ingresa a tu cuenta para continuar
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 rounded-lg py-2 px-3">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  className="h-11 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Contraseña
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs hover:underline"
                    style={{ color: "var(--accent)" }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  className="h-11 rounded-lg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm cursor-pointer"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Recordar mi sesión
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg font-medium text-white transition-all"
                style={{
                  background: "linear-gradient(to right, var(--accent), #c2763a)",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: "var(--border)" }} />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span
                    className="px-3"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      color: "var(--text-muted)",
                    }}
                  >
                    ¿No tienes una cuenta?
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-lg font-medium transition-all"
                style={{
                  borderColor: "var(--accent)",
                  color: "var(--accent)",
                  backgroundColor: "transparent",
                }}
                onClick={() => router.push("/register")}
              >
                Crear cuenta nueva
              </Button>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}