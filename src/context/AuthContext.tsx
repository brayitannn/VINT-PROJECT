"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

type UserRole = 'comprador' | 'vendedor' | 'admin'

type AuthContextType = {
  user: User | null;
  loading: boolean;
  role: UserRole;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

function getRoleFromUser(user: User | null): UserRole {
  if (!user) return 'comprador'
  let role = user.user_metadata?.role || 'comprador'
  if (role === 'buyer') role = 'comprador'
  if (role === 'seller') role = 'vendedor'
  if (role !== 'admin' && role !== 'comprador' && role !== 'vendedor') {
    role = 'comprador'
  }
  return role as UserRole
}

export function AuthProvider({ children }: Props) {
  const supabase = createClient(); // ✅ cliente correcto

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔥 obtener usuario inicial
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user ?? null);
      setLoading(false);
    };

    getUser();

    // 🔥 escuchar cambios de sesión
   const {
  data: { subscription },
} = supabase.auth.onAuthStateChange(
  (_event: AuthChangeEvent, session: Session | null) => {
    setUser(session?.user ?? null);
  }
);

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // 🔥 LOGIN
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  // 🔥 LOGOUT
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const role = getRoleFromUser(user)

  return (
    <AuthContext.Provider value={{ user, loading, role, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}