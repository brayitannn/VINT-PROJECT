"use client";

import { useAuth } from "@/context/AuthContext";
import { CompradorDashboard } from "@/components/dashboard/CompradorDashboard";
import { Loader2 } from "lucide-react";
import { MOCK_USER } from "@/lib/supabase/mock-user";

export default function CompradorPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  // Mapa adaptativo al MockUser temporal
  const mockUserPayload = {
    ...MOCK_USER,
    id: user.id,
    name: user.user_metadata?.name || user.email?.split("@")[0] || "Comprador",
    email: user.email || "",
    role: "comprador" as const,
  };

  return <CompradorDashboard user={mockUserPayload} />;
}
