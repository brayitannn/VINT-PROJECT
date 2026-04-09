"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { CheckCircle2, ArrowLeft } from "lucide-react";

export default function PasswordRecoveryPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
                Recuperar Contraseña
              </CardTitle>
              <CardDescription className="text-center text-[var(--text-secondary)]">
                Te enviaremos un enlace para restablecer tu contraseña
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">

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

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600"
                  >
                    Enviar enlace de recuperación
                  </Button>

                  <div className="pt-4">
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Volver al inicio de sesión
                    </Link>
                  </div>

                </form>
              ) : (
                <div className="space-y-4">

                  <Alert
                    style={{
                      backgroundColor: "rgba(34,197,94,0.1)",
                      borderColor: "rgba(34,197,94,0.3)",
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-[var(--text-primary)]">
                      Hemos enviado un enlace de recuperación a{" "}
                      <strong>{email}</strong>.
                      <br />
                      Revisa tu bandeja de entrada.
                    </AlertDescription>
                  </Alert>

                  <p className="text-sm text-[var(--text-secondary)] text-center">
                    ¿No recibiste el correo? Revisa spam o intenta nuevamente.
                  </p>

                  <Button
                    variant="outline"
                    className="w-full border-amber-600 text-amber-600 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-500 dark:hover:bg-amber-950/20"
                    onClick={() => setSubmitted(false)}
                  >
                    Enviar de nuevo
                  </Button>

                  <div className="pt-4">
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Volver al inicio de sesión
                    </Link>
                  </div>

                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}