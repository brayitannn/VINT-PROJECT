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

      // Validation
      if (pathname === "/dashboard") {
        router.push(`/dashboard/${role}`);
      } else if (pathname.includes("/dashboard/comprador") && role !== "comprador") {
        router.push("/dashboard/vendedor");
      } else if (pathname.includes("/dashboard/vendedor") && role !== "vendedor") {
        router.push("/dashboard/comprador");
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

  // Aquí el children ya renderiza el page.tsx de comprador o vendedor
  return <>{children}</>;
}