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

  const fields = [
    { id: "name", type: "text", placeholder: "María Fernanda Gómez", label: "Nombre completo" },
    { id: "email", type: "email", placeholder: "tu@email.com", label: "Correo electrónico" },
    { id: "password", type: "password", placeholder: "••••••••", label: "Contraseña" },
    { id: "confirmPassword", type: "password", placeholder: "••••••••", label: "Confirmar contraseña" },
  ];

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
              Crear Cuenta
            </CardTitle>
            <CardDescription
              className="text-center text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Únete a la comunidad de Ropa S.H.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 rounded-lg py-2 px-3">
                  {error}
                </div>
              )}

              {fields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <Label
                    htmlFor={field.id}
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {field.label}
                  </Label>
                  <Input
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={(formData as any)[field.id]}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    required
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                    }}
                    className="h-11 rounded-lg"
                  />
                </div>
              ))}

              <div className="space-y-3">
                <Label
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Tipo de cuenta
                </Label>

                <RadioGroup
                  value={formData.userType}
                  onValueChange={(value) => setFormData({ ...formData, userType: value })}
                  className="space-y-2"
                >
                  {[
                    { value: "buyer", label: "Comprador", desc: "Busco comprar ropa de segunda mano" },
                    { value: "seller", label: "Vendedor", desc: "Quiero vender mi ropa" },
                  ].map((type) => (
                    <div
                      key={type.value}
                      className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer transition-all hover:opacity-80"
                      style={{
                        borderColor: formData.userType === type.value ? "var(--accent)" : "var(--border)",
                        backgroundColor: formData.userType === type.value ? "var(--accent-light)" : "transparent",
                      }}
                    >
                      <RadioGroupItem value={type.value} id={type.value} />
                      <Label
                        htmlFor={type.value}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                          {type.label}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                          {type.desc}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
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
                {loading ? "Creando..." : "Crear Cuenta"}
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
                    ¿Ya tienes cuenta?
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
                onClick={() => router.push("/login")}
              >
                Iniciar sesión
              </Button>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}