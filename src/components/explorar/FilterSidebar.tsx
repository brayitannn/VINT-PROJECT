'use client'

import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export interface Filters {
  search: string
  priceMin: number
  priceMax: number
  categorias: string[]
  tallas: string[]
  condiciones: string[]
  genero: string
}

interface FilterSidebarProps {
  filters: Filters
  onChange: (filters: Filters) => void
  totalResults: number
}

const CATEGORIAS = ['Camisetas', 'Pantalones', 'Chaquetas', 'Vestidos', 'Calzado', 'Suéteres', 'Faldas', 'Shorts', 'Accesorios']
const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44']
const CONDICIONES = ['Como Nuevo', 'Excelente', 'Muy Bueno', 'Bueno']
const GENEROS = ['Todos', 'Mujer', 'Hombre', 'Unisex']

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 20 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', background: 'none', border: 'none',
          cursor: 'pointer', padding: 0, marginBottom: open ? 14 : 0,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {title}
        </span>
        <ChevronDown size={14} style={{
          color: 'var(--text-muted)', transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }} />
      </button>
      {open && children}
    </div>
  )
}

function Chip({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.15s',
        backgroundColor: active ? 'var(--accent)' : 'var(--bg-secondary)',
        color: active ? 'white' : 'var(--text-secondary)',
        border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
      }}
    >
      {label}
    </button>
  )
}

export function FilterSidebar({ filters, onChange, totalResults }: FilterSidebarProps) {
  const hasActiveFilters =
    filters.categorias.length > 0 ||
    filters.tallas.length > 0 ||
    filters.condiciones.length > 0 ||
    filters.genero !== 'Todos' ||
    filters.priceMax < 300000

  const reset = () => onChange({
    search: filters.search,
    priceMin: 0,
    priceMax: 300000,
    categorias: [],
    tallas: [],
    condiciones: [],
    genero: 'Todos',
  })

  const toggle = (key: 'categorias' | 'tallas' | 'condiciones', val: string) => {
    const current = filters[key]
    onChange({
      ...filters,
      [key]: current.includes(val) ? current.filter(v => v !== val) : [...current, val],
    })
  }

  return (
    <aside style={{
      width: 260, flexShrink: 0,
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 20, padding: '24px 20px',
      position: 'sticky', top: 80,
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
      scrollbarWidth: 'thin',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SlidersHorizontal size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Filtros</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: 'var(--accent)',
            backgroundColor: 'var(--accent-light)', padding: '2px 8px', borderRadius: 999,
          }}>
            {totalResults}
          </span>
          {hasActiveFilters && (
            <button onClick={reset} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 600,
            }}>
              <X size={12} /> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Precio */}
      <Section title="Precio">
        <div style={{ padding: '0 4px' }}>
          <input
            type="range"
            min={0} max={300000} step={5000}
            value={filters.priceMax}
            onChange={e => onChange({ ...filters, priceMax: Number(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>$0</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
              ${filters.priceMax.toLocaleString('es-CO')}
            </span>
          </div>
        </div>
      </Section>

      {/* Género */}
      <Section title="Género">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {GENEROS.map(g => (
            <Chip key={g} label={g} active={filters.genero === g} onClick={() => onChange({ ...filters, genero: g })} />
          ))}
        </div>
      </Section>

      {/* Categoría */}
      <Section title="Categoría">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {CATEGORIAS.map(cat => {
            const active = filters.categorias.includes(cat)
            return (
              <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '5px 4px', borderRadius: 8 }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0, transition: 'all 0.15s',
                  backgroundColor: active ? 'var(--accent)' : 'transparent',
                  border: active ? '2px solid var(--accent)' : '2px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} onClick={() => toggle('categorias', cat)}>
                  {active && <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }} onClick={() => toggle('categorias', cat)}>{cat}</span>
              </label>
            )
          })}
        </div>
      </Section>

      {/* Talla */}
      <Section title="Talla">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {TALLAS.map(t => (
            <Chip key={t} label={t} active={filters.tallas.includes(t)} onClick={() => toggle('tallas', t)} />
          ))}
        </div>
      </Section>

      {/* Condición */}
      <Section title="Condición">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {CONDICIONES.map(c => {
            const active = filters.condiciones.includes(c)
            return (
              <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '5px 4px', borderRadius: 8 }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0, transition: 'all 0.15s',
                  backgroundColor: active ? 'var(--accent)' : 'transparent',
                  border: active ? '2px solid var(--accent)' : '2px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} onClick={() => toggle('condiciones', c)}>
                  {active && <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }} onClick={() => toggle('condiciones', c)}>{c}</span>
              </label>
            )
          })}
        </div>
      </Section>

    </aside>
  )
}
