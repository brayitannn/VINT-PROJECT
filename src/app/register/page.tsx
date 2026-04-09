"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { getSupabaseClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const supabase = getSupabaseClient();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "buyer",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.userType,
          },
        },
      });

      if (signUpError) throw signUpError;

      await signIn(formData.email, formData.password);
      router.push("/");

    } catch (err: any) {
      if (err.message?.includes("User already registered")) {
        setError("Este correo ya está registrado");
      } else {
        setError("Error al crear la cuenta");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-md">

          {/* CARD */}
          <Card
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
            className="border"
          >
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-[var(--text-primary)]">
                Crear Cuenta
              </CardTitle>
              <CardDescription className="text-center text-[var(--text-secondary)]">
                Únete a la comunidad de Ropa S.H.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">

                {error && (
                  <div className="text-red-500 text-sm text-center">
                    {error}
                  </div>
                )}

                {/* INPUT BASE STYLE */}
                {[
                  { id: "name", type: "text", placeholder: "María Fernanda Gómez", key: "name" },
                  { id: "email", type: "email", placeholder: "tu@email.com", key: "email" },
                  { id: "password", type: "password", placeholder: "••••••••", key: "password" },
                  { id: "confirmPassword", type: "password", placeholder: "••••••••", key: "confirmPassword" },
                ].map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label className="text-[var(--text-primary)]">
                      {field.id === "name"
                        ? "Nombre completo"
                        : field.id === "email"
                        ? "Correo electrónico"
                        : field.id === "password"
                        ? "Contraseña"
                        : "Confirmar contraseña"}
                    </Label>

                    <Input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={(formData as any)[field.key]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.key]: e.target.value,
                        })
                      }
                      required
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                ))}

                {/* RADIO */}
                <div className="space-y-3">
                  <Label className="text-[var(--text-primary)]">
                    Tipo de cuenta
                  </Label>

                  <RadioGroup
                    value={formData.userType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, userType: value })
                    }
                  >
                    {["buyer", "seller"].map((type) => (
                      <div
                        key={type}
                        style={{ borderColor: "var(--border)" }}
                        className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:opacity-80"
                      >
                        <RadioGroupItem value={type} id={type} />
                        <Label
                          htmlFor={type}
                          className="flex-1 cursor-pointer text-[var(--text-primary)]"
                        >
                          <div className="font-medium">
                            {type === "buyer" ? "Comprador" : "Vendedor"}
                          </div>
                          <div className="text-sm text-[var(--text-secondary)]">
                            {type === "buyer"
                              ? "Busco comprar ropa de segunda mano"
                              : "Quiero vender mi ropa"}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* BUTTON */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-500"
                >
                  {loading ? "Creando..." : "Crear Cuenta"}
                </Button>

                {/* DIVIDER */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div
                      style={{ borderColor: "var(--border)" }}
                      className="w-full border-t"
                    />
                  </div>

                  <div className="relative flex justify-center text-sm">
                    <span
                      style={{ backgroundColor: "var(--bg-card)" }}
                      className="px-2 text-[var(--text-secondary)]"
                    >
                      ¿Ya tienes cuenta?
                    </span>
                  </div>
                </div>

                {/* LOGIN */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-amber-600 text-amber-600 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-500 dark:hover:bg-amber-950/20"
                  onClick={() => router.push("/login")}
                >
                  Iniciar sesión
                </Button>

              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}