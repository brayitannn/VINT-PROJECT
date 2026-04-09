import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, AlertCircle } from 'lucide-react';
import { ProductoRecomendado } from '@/types/dashboard';

interface RecomendacionesGridProps {
  loading: boolean;
  error: string | null;
  recomendaciones: ProductoRecomendado[];
}

export function RecomendacionesGrid({ loading, error, recomendaciones }: RecomendacionesGridProps) {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  return (
    <div style={{ animation: 'fadeIn 0.8s ease forwards 0.4s', opacity: 0 }}>
      <div className="dash-section-header">
        <div className="dash-section-icon" style={{ background: 'var(--accent)', boxShadow: '0 8px 20px rgba(139, 94, 60, 0.25)' }}>
          <Heart size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>Recomendado para ti</h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0 }}>
            Una selección basada en tus intereses y favoritos recientes.
          </p>
        </div>
      </div>

      {loading && (
        <div className="dash-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="dash-skeleton">
              <div className="dash-skeleton-img" />
              <div className="dash-skeleton-line" style={{ width: '80%' }} />
              <div className="dash-skeleton-line" style={{ width: '50%', height: 20, margin: '16px 0' }} />
              <div className="dash-skeleton-line" style={{ width: '100%', height: 8 }} />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="dash-error">
          <div style={{ padding: 16, background: 'rgba(181, 101, 77, 0.15)', borderRadius: '50%' }}>
            <AlertCircle size={36} color="#B5654D" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#A85741', margin: 0 }}>Algo salió mal</h3>
          <p style={{ color: '#C86A58', margin: 0, maxWidth: 400 }}>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="dash-grid">
          {recomendaciones.map((prenda) => (
            <Link 
              key={prenda.id_prenda} 
              href={`/explorar`}
              className="dash-card"
              onMouseEnter={() => setHoveredProduct(prenda.id_prenda)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <div className="dash-card-image-wrapper">
                {prenda.imagen_principal ? (
                  <img src={prenda.imagen_principal} alt={prenda.titulo} className="dash-card-image" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Sin imagen</div>
                )}
                <div className="dash-card-overlay" />
              </div>
              
              <div style={{ padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: hoveredProduct === prenda.id_prenda ? 'var(--accent)' : 'var(--text-primary)', margin: '0 0 12px', transition: 'color 0.3s' }}>
                  {prenda.titulo}
                </h3>
                <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                  ${Number(prenda.precio).toLocaleString('es-CO')} <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>COP</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
