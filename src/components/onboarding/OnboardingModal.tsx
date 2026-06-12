'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { X, Check } from 'lucide-react'

const CATEGORIAS = [
  { id: 'Camisetas', emoji: '👕' },
  { id: 'Jeans', emoji: '👖' },
  { id: 'Chaquetas', emoji: '🧥' },
  { id: 'Vestidos', emoji: '👗' },
  { id: 'Zapatos', emoji: '👟' },
  { id: 'Accesorios', emoji: '👜' },
  { id: 'Ropa Deportiva', emoji: '🏃' },
  { id: 'Ropa Formal', emoji: '👔' },
]

const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const ESTILOS = [
  { id: 'casual', label: 'Casual', desc: 'Cómodo y relajado' },
  { id: 'streetwear', label: 'Streetwear', desc: 'Urban y moderno' },
  { id: 'vintage', label: 'Vintage', desc: 'Clásico con historia' },
  { id: 'formal', label: 'Formal', desc: 'Elegante y profesional' },
  { id: 'deportivo', label: 'Deportivo', desc: 'Activo y funcional' },
]

export function OnboardingModal() {
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Paso 1
  const [categorias, setCategorias] = useState<string[]>([])
  // Paso 2
  const [tallas, setTallas] = useState<string[]>([])
  const [presupuesto, setPresupuesto] = useState(150000)
  // Paso 3
  const [estilos, setEstilos] = useState<string[]>([])

  useEffect(() => {
    if (!user) return
    let role = user.user_metadata?.role || (user.user_metadata?.id_rol === 2 ? 'vendedor' : 'comprador')
    if (role === 'buyer') role = 'comprador'
    if (role === 'seller') role = 'vendedor'
    
    const prefs = user.user_metadata?.preferencias
    // Solo mostrar para compradores sin preferencias guardadas
    if (role === 'comprador' && !prefs) {
      // Pequeño delay para que no aparezca bruscamente al cargar
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [user])

  useEffect(() => {
    const handleReset = () => {
      setStep(1)
      setVisible(true)
    }
    window.addEventListener('vint-reset-onboarding', handleReset)
    return () => window.removeEventListener('vint-reset-onboarding', handleReset)
  }, [])

  const toggleItem = (item: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter(x => x !== item) : [...list, item])
  }

  const canAdvance = () => {
    if (step === 1) return categorias.length > 0
    if (step === 2) return tallas.length > 0
    if (step === 3) return estilos.length > 0
    return false
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const supabase = createClient()
      await supabase.auth.updateUser({
        data: {
          preferencias: {
            categorias,
            tallas,
            presupuesto_max: presupuesto,
            estilos,
          },
        },
      })
      setVisible(false)
      window.location.reload()
    } catch (e) {
      console.error('[OnboardingModal] Error guardando preferencias:', e)
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = async () => {
    if (!user) return
    // Guardar preferencias mínimas para no volver a mostrar el modal
    const supabase = createClient()
    await supabase.auth.updateUser({
      data: {
        preferencias: {
          categorias: [],
          tallas: [],
          presupuesto_max: 500000,
          estilos: ['casual'],
        },
      },
    })
    setVisible(false)
    window.location.reload()
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .onboarding-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 999px;
          border: 1.5px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: 'DM Sans', sans-serif;
          user-select: none;
        }
        .onboarding-chip:hover {
          border-color: var(--accent);
          color: var(--accent);
          transform: translateY(-1px);
        }
        .onboarding-chip.selected {
          background: var(--accent);
          border-color: var(--accent);
          color: white;
          box-shadow: 0 4px 12px rgba(139, 94, 60, 0.3);
        }
        .onboarding-talla {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          border: 1.5px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: 'DM Sans', sans-serif;
          user-select: none;
        }
        .onboarding-talla:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        .onboarding-talla.selected {
          background: var(--accent);
          border-color: var(--accent);
          color: white;
          transform: scale(1.08);
          box-shadow: 0 4px 12px rgba(139, 94, 60, 0.3);
        }
        .onboarding-estilo {
          flex: 1;
          min-width: 140px;
          padding: 20px;
          border-radius: 16px;
          border: 1.5px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-primary);
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: left;
          user-select: none;
        }
        .onboarding-estilo:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
        }
        .onboarding-estilo.selected {
          border-color: var(--accent);
          background: rgba(139, 94, 60, 0.08);
          box-shadow: 0 4px 16px rgba(139, 94, 60, 0.15);
        }
        .onboarding-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(139, 94, 60, 0.4);
        }
        .onboarding-range::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: 2px;
          background: var(--border);
        }
        .onboarding-range {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
      `}</style>

      {/* Overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeInOverlay 0.3s ease',
      }}>
        {/* Modal */}
        <div style={{
          width: '100%', maxWidth: 540,
          background: 'var(--bg-card)',
          borderRadius: 28,
          border: '1px solid var(--border)',
          padding: '36px 40px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
          animation: 'slideUpModal 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}>
          {/* Skip button */}
          <button
            onClick={handleSkip}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
              gap: 4, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
              transition: 'color 0.2s',
            }}
          >
            <X size={14} /> Omitir
          </button>

          {/* Progress */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: i <= step ? 'var(--accent)' : 'var(--border)',
                transition: 'background 0.3s ease',
              }} />
            ))}
          </div>

          {/* PASO 1 — Categorías */}
          {step === 1 && (
            <>
              <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--accent)', marginBottom: 8 }}>
                Paso 1 de 3
              </p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
                ¿Qué te gusta vestir?
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
                Selecciona las categorías que más te interesan. Puedes elegir varias.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {CATEGORIAS.map(cat => (
                  <button
                    key={cat.id}
                    className={`onboarding-chip ${categorias.includes(cat.id) ? 'selected' : ''}`}
                    onClick={() => toggleItem(cat.id, categorias, setCategorias)}
                  >
                    <span>{cat.emoji}</span> {cat.id}
                    {categorias.includes(cat.id) && <Check size={14} />}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* PASO 2 — Talla + Presupuesto */}
          {step === 2 && (
            <>
              <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--accent)', marginBottom: 8 }}>
                Paso 2 de 3
              </p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
                Tu talla y presupuesto
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
                Así filtraremos solo lo que te queda y se ajusta a tu bolsillo.
              </p>

              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                Talla(s)
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
                {TALLAS.map(t => (
                  <button
                    key={t}
                    className={`onboarding-talla ${tallas.includes(t) ? 'selected' : ''}`}
                    onClick={() => toggleItem(t, tallas, setTallas)}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                Presupuesto máximo
              </p>
              <div style={{
                background: 'var(--bg-secondary)', borderRadius: 16, padding: '20px 24px',
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Hasta</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>
                    ${presupuesto.toLocaleString('es-CO')} <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>COP</span>
                  </span>
                </div>
                <input
                  type="range"
                  min={20000}
                  max={600000}
                  step={10000}
                  value={presupuesto}
                  onChange={e => setPresupuesto(Number(e.target.value))}
                  className="onboarding-range"
                  style={{
                    background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((presupuesto - 20000) / (600000 - 20000)) * 100}%, var(--border) ${((presupuesto - 20000) / (600000 - 20000)) * 100}%, var(--border) 100%)`
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                  <span>$20.000</span>
                  <span>$600.000</span>
                </div>
              </div>
            </>
          )}

          {/* PASO 3 — Estilo de vida */}
          {step === 3 && (
            <>
              <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--accent)', marginBottom: 8 }}>
                Paso 3 de 3
              </p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
                Tu estilo de vida
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
                ¿Cómo describes tu forma de vestir? Elige uno o más.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {ESTILOS.map(est => (
                  <button
                    key={est.id}
                    className={`onboarding-estilo ${estilos.includes(est.id) ? 'selected' : ''}`}
                    onClick={() => toggleItem(est.id, estilos, setEstilos)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: estilos.includes(est.id) ? 'var(--accent)' : 'var(--text-primary)' }}>
                        {est.label}
                      </span>
                      {estilos.includes(est.id) && (
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'var(--accent)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Check size={12} color="white" />
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{est.desc}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 36 }}>
            {step > 1 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{
                  background: 'none', border: '1.5px solid var(--border)',
                  borderRadius: 999, padding: '12px 24px',
                  fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.2s',
                }}
              >
                ← Atrás
              </button>
            ) : <div />}

            <button
              onClick={step < 3 ? () => setStep(s => s + 1) : handleSave}
              disabled={!canAdvance() || saving}
              style={{
                background: canAdvance() ? 'var(--accent)' : 'var(--border)',
                color: canAdvance() ? 'white' : 'var(--text-muted)',
                border: 'none', borderRadius: 999,
                padding: '14px 32px', fontSize: 15, fontWeight: 700,
                cursor: canAdvance() ? 'pointer' : 'not-allowed',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.2s',
                boxShadow: canAdvance() ? '0 4px 16px rgba(139, 94, 60, 0.35)' : 'none',
              }}
            >
              {saving ? 'Guardando...' : step < 3 ? 'Siguiente →' : '✦ Ver mis recomendaciones'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
