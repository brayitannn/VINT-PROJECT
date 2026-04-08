import { useState, useEffect } from 'react';
import { type MockUser } from '@/lib/supabase/mock-user';
import { ProductoRecomendado } from '@/types/dashboard';

export function useRecomendaciones(user: MockUser) {
  const [recomendaciones, setRecomendaciones] = useState<ProductoRecomendado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarRecomendaciones() {
      try {
        setLoading(true);
        const res = await fetch('/api/recomendaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user }),
        });
        if (!res.ok) throw new Error('Error al obtener recomendaciones');
        const data = await res.json();
        setRecomendaciones(data.recomendaciones ?? []);
      } catch (e) {
        setError('No se pudieron cargar las recomendaciones');
      } finally {
        setLoading(false);
      }
    }
    cargarRecomendaciones();
  }, [user]);

  return { recomendaciones, loading, error };
}
