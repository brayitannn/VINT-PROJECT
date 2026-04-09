"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/components/layout/ThemeProvider";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { theme } = useTheme();

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
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-md">

          <Card
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
            className="border"
          >
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-[var(--text-primary)]">
                Iniciar Sesión
              </CardTitle>
              <CardDescription className="text-center text-[var(--text-secondary)]">
                Ingresa a tu cuenta para continuar
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">

                {error && (
                  <div className="text-red-500 text-sm text-center">
                    {error}
                  </div>
                )}

                {/* EMAIL */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[var(--text-primary)]">
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
                  />
                </div>

                {/* PASSWORD */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[var(--text-primary)]">
                      Contraseña
                    </Label>
                    <Link 
                      href="/forgot-password"
                      className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400"
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
                  />
                </div>

                {/* REMEMBER */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="text-sm text-[var(--text-secondary)] cursor-pointer"
                  >
                    Recordar mi sesión
                  </label>
                </div>

                {/* SUBMIT */}
                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600"
                >
                  {loading ? "Ingresando..." : "Ingresar"}
                </Button>

                {/* DIVIDER */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>

                  <div className="relative flex justify-center text-sm">
                    <span
                      style={{ backgroundColor: "var(--bg-card)" }}
                      className="px-2 text-[var(--text-secondary)]"
                    >
                      ¿No tienes una cuenta?
                    </span>
                  </div>
                </div>

                {/* REGISTER */}
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full border-amber-600 text-amber-600 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-500 dark:hover:bg-amber-950/20"
                  onClick={() => router.push("/register")}
                >
                  Crear cuenta nueva
                </Button>

              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}