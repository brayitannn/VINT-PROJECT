"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [roleValidated, setRoleValidated] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const checkRoleAndRoute = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      let role = currentUser?.user_metadata?.role || "comprador";
      if (role === "buyer") role = "comprador";
      if (role === "seller") role = "vendedor";

      // Normalizar: si el id_rol es de admin, asignar el rol correspondiente
      const idRol = currentUser?.user_metadata?.id_rol;
      if (idRol) {
        // Verificar si el rol en la BD es ADMIN consultando la metadata
        // Si el role name no coincide, intentar derivar del id_rol
        if (role !== 'admin' && role !== 'comprador' && role !== 'vendedor') {
          role = 'comprador'; // fallback
        }
      }

      // Validation
      if (pathname === "/dashboard") {
        router.push(`/dashboard/${role}`);
      } else if (pathname.includes("/dashboard/admin") && role !== "admin") {
        router.push(`/dashboard/${role}`);
      } else if (pathname.includes("/dashboard/comprador") && role !== "comprador") {
        if (role === "admin") router.push("/dashboard/admin");
        else router.push("/dashboard/vendedor");
      } else if (pathname.includes("/dashboard/vendedor") && role !== "vendedor") {
        if (role === "admin") router.push("/dashboard/admin");
        else router.push("/dashboard/comprador");
      } else {
        setRoleValidated(true);
      }
    };

    checkRoleAndRoute();
  }, [user, loading, pathname, router, supabase]);

  if (loading || (!user && !roleValidated) || !roleValidated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  // Aquí el children ya renderiza el page.tsx de comprador, vendedor o admin
  return <>{children}</>;
}