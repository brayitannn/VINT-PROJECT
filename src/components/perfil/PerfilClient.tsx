'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/context/AuthContext'
import { useRole } from '@/context/RoleContext'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  User, Lock, Bell, Shield, Palette, HelpCircle,
  AlertTriangle, ChevronRight, Camera, Save, Check,
  Sun, Moon, Eye, EyeOff, MessageCircle, FileText, Trash2, Loader2, ArrowLeft
} from 'lucide-react'
import { VintSelect } from '@/components/ui/VintSelect'

const calcularEdad = (fechaNacimiento: string) => {
  if (!fechaNacimiento) return null
  const hoy = new Date()
  const nac = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nac.getFullYear()
  const m = hoy.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}

type Section = 'perfil' | 'cuenta' | 'notificaciones' | 'privacidad' | 'apariencia' | 'ayuda' | 'peligro'

interface SidebarItem {
  id: Section
  label: string
  icon: React.ElementType
  danger?: boolean
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'perfil', label: 'Mi Perfil', icon: User },
  { id: 'cuenta', label: 'Cuenta y Seguridad', icon: Lock },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { id: 'privacidad', label: 'Privacidad', icon: Shield },
  { id: 'apariencia', label: 'Apariencia', icon: Palette },
  { id: 'ayuda', label: 'Ayuda y Soporte', icon: HelpCircle },
  { id: 'peligro', label: 'Zona de Peligro', icon: AlertTriangle, danger: true },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
        backgroundColor: checked ? 'var(--accent)' : 'var(--bg-secondary)',
        position: 'relative', transition: 'background-color 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 2, left: checked ? 22 : 2, width: 20, height: 20,
        borderRadius: '50%', backgroundColor: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
      }} />
    </button>
  )
}

function SaveButton({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 24px', borderRadius: 12, border: 'none',
        backgroundColor: saved ? '#10B981' : 'var(--accent)',
        color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
        transition: 'all 0.3s',
      }}
    >
      {saved ? <Check size={16} /> : <Save size={16} />}
      {saved ? 'Guardado' : 'Guardar cambios'}
    </button>
  )
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 20, padding: 32, marginBottom: 20,
    }}>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
        {description && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>{description}</p>}
      </div>
      {children}
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text', max, disabled }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; max?: string; disabled?: boolean }) {
  return (
    <input
      type={type}
      value={value}
      max={max}
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 14,
        border: '1px solid var(--border)', backgroundColor: disabled ? 'var(--bg-secondary)' : 'var(--bg-primary)',
        color: value ? 'var(--text-primary)' : 'var(--text-muted)', outline: 'none',
        fontFamily: "'DM Sans', sans-serif",
        boxSizing: 'border-box',
        transition: 'all 0.2s',
        opacity: disabled ? 0.7 : 1
      }}
    />
  )
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{label}</p>
        {description && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

// ── Sections ────────────────────────────────────────────────────────────────

function PerfilSection() {
  const { user } = useAuth()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const realEmail = user?.email || ''
  const realUsername = user?.user_metadata?.username || realEmail.split('@')[0]
  const avatarUrl: string | null = user?.user_metadata?.avatar_url || null
  const realLocation = user?.user_metadata?.location || 'Colombia'
  const realBirthday = user?.user_metadata?.fecha_nacimiento || ''
  const realGender = user?.user_metadata?.genero || ''

  const [name, setName] = useState('')
  const [perfilData, setPerfilData] = useState<any>(null)

  useEffect(() => {
    if (user) {
      const fetchPerfil = async () => {
        let res = await supabase.from('usuarios').select('primer_nombre, segundo_nombre, primer_apellido, segundo_apellido').eq('id_auth_supabase', user.id).maybeSingle()
        if (res.error) {
          res = await supabase.schema('seguridad').from('usuarios').select('primer_nombre, segundo_nombre, primer_apellido, segundo_apellido').eq('id_auth_supabase', user.id).maybeSingle()
        }
        if (res.data) {
          setPerfilData(res.data)
          const nombreCompleto = `${res.data.primer_nombre} ${res.data.segundo_nombre || ''} ${res.data.primer_apellido} ${res.data.segundo_apellido || ''}`.replace(/\s+/g, ' ').trim()
          setName(nombreCompleto)
        } else {
          const fallbackName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'
          setName(fallbackName)
        }
      }
      fetchPerfil()
      
      window.addEventListener('updatePerfil', fetchPerfil)
      return () => window.removeEventListener('updatePerfil', fetchPerfil)
    }
  }, [user, supabase])
  const [username, setUsername] = useState(realUsername)
  const [email] = useState(realEmail)
  const [location, setLocation] = useState(realLocation)
  const [birthday, setBirthday] = useState(realBirthday)
  const [gender, setGender] = useState(realGender)
  const [saved, setSaved] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const edad = calcularEdad(birthday)
  const hoyStr = new Date().toISOString().split('T')[0]

  const initials = name ? name.trim().split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'US'

  const handleSave = async () => {
    if (!user) return
    setUpdating(true)
    setError(null)
    try {
      // Separar nombre completo en partes para la base de datos
      const parts = name.trim().split(/\s+/)
      let primer_nombre = parts[0] || ''
      let segundo_nombre = ''
      let primer_apellido = ''
      let segundo_apellido = ''

      if (parts.length === 2) {
        primer_apellido = parts[1]
      } else if (parts.length === 3) {
        segundo_nombre = parts[1]
        primer_apellido = parts[2]
      } else if (parts.length >= 4) {
        segundo_nombre = parts[1]
        primer_apellido = parts[2]
        segundo_apellido = parts.slice(3).join(' ')
      }

      const updatePayload = {
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        genero: gender,
        fecha_nacimiento: birthday
      }

      // 1. Actualizar Auth Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { name, username, location, fecha_nacimiento: birthday, genero: gender }
      })
      if (authError) throw authError

      // 2. Actualizar base de datos
      let { error: dbError } = await supabase.from('usuarios').update(updatePayload).eq('id_auth_supabase', user.id)
      if (dbError) console.log("Error en update usuarios (sin esquema):", dbError)

      if (dbError) {
        const fall = await supabase.schema('seguridad').from('usuarios').update(updatePayload).eq('id_auth_supabase', user.id)
        if (fall.error) console.log("Error en update usuarios (esquema seguridad):", fall.error)
        dbError = fall.error
      }
      if (dbError) throw dbError

      setSaved(true)
      window.dispatchEvent(new Event('updatePerfil'))
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil')
    } finally {
      setUpdating(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    setError(null)
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (error) throw error
      
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = urlData.publicUrl
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })
      setAvatarPreview(publicUrl)
    } catch (err: any) {
      setError('Error al subir avatar: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <SectionCard title="Foto de Perfil" description="Imagen que verán otros usuarios en el catálogo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              backgroundColor: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: 'white',
              boxShadow: '0 8px 24px rgba(139,94,60,0.3)',
              overflow: 'hidden',
            }}>
              {avatarPreview
                ? <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--bg-primary)',
                backgroundColor: 'var(--accent)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <Camera size={13} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>{name}</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px' }}>@{username || 'usuario'}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)',
                backgroundColor: 'transparent', color: uploading ? 'var(--text-muted)' : 'var(--text-primary)',
                fontSize: 13, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer',
              }}
            >
              {uploading ? 'Subiendo...' : 'Subir nueva foto'}
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Información Personal" description="Datos visibles en tu perfil público">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <FieldRow label="Nombre completo"><Input value={name} onChange={setName} /></FieldRow>
          <FieldRow label="Nombre de usuario"><Input value={username} onChange={setUsername} placeholder="@username" /></FieldRow>
          <FieldRow label="Email"><Input value={email} onChange={() => {}} type="email" disabled /></FieldRow>
          <FieldRow label="Ciudad"><Input value={location} onChange={setLocation} placeholder="Bogotá, Colombia" /></FieldRow>

          <FieldRow label={`Fecha de Nacimiento ${edad !== null ? `(${edad} años)` : ''}`}>
            <Input
              value={birthday}
              onChange={setBirthday}
              type="date"
              max={hoyStr}
            />
          </FieldRow>

          <FieldRow label="Género">
            <VintSelect
              value={gender}
              onChange={setGender}
              options={[
                { value: "Hombre", label: "Hombre" },
                { value: "Mujer", label: "Mujer" },
                { value: "Prefiero no decirlo", label: "Prefiero no decirlo" },
              ]}
              placeholder="Selecciona una opción"
            />
          </FieldRow>
        </div>
        
        {error && (
          <p style={{ fontSize: 13, color: '#EF4444', marginTop: 16, marginBottom: 0 }}>{error}</p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            onClick={handleSave}
            disabled={updating}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 12, border: 'none',
              backgroundColor: saved ? '#10B981' : 'var(--accent)',
              color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.3s',
              opacity: updating ? 0.7 : 1,
            }}
          >
            {updating ? <div style={{ width: 16, height: 16, border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : saved ? <Check size={16} /> : <Save size={16} />}
            {updating ? 'Actualizando...' : saved ? 'Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </SectionCard>
    </>
  )
}

function CuentaSection() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [saved, setSaved] = useState(false)
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  return (
    <>
      <SectionCard title="Cambiar Contraseña" description="Usa una contraseña fuerte con al menos 8 caracteres">
        <FieldRow label="Contraseña actual">
          <div style={{ position: 'relative' }}>
            <Input value={currentPass} onChange={setCurrentPass} type={showCurrent ? 'text' : 'password'} placeholder="••••••••" />
            <button onClick={() => setShowCurrent(!showCurrent)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </FieldRow>
        <FieldRow label="Nueva contraseña">
          <div style={{ position: 'relative' }}>
            <Input value={newPass} onChange={setNewPass} type={showNew ? 'text' : 'password'} placeholder="Mín. 8 caracteres" />
            <button onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </FieldRow>
        <FieldRow label="Confirmar nueva contraseña">
          <Input value={confirmPass} onChange={setConfirmPass} type="password" placeholder="Repite la nueva contraseña" />
        </FieldRow>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <SaveButton onClick={handleSave} saved={saved} />
        </div>
      </SectionCard>
    </>
  )
}

function NotificacionesSection() {
  const [notifs, setNotifs] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('vint_notif_prefs') : null
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      emailOfertas: true, emailNuevas: false, emailResumen: true,
      pushMensajes: true, pushVentas: true, pushFavoritos: false,
    }
  })
  const [saved, setSaved] = useState(false)
  const set = (key: keyof typeof notifs) => (v: boolean) => setNotifs((n: any) => ({ ...n, [key]: v }))
  const handleSave = () => {
    localStorage.setItem('vint_notif_prefs', JSON.stringify(notifs))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <SectionCard title="Preferencias de Notificaciones" description="Controla qué mensajes recibes y cómo">
      <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8 }}>Email</p>
      <ToggleRow label="Ofertas y descuentos" description="Recibe alertas cuando haya ofertas en prendas de tus categorías" checked={notifs.emailOfertas} onChange={set('emailOfertas')} />
      <ToggleRow label="Nuevas prendas" description="Notificaciones cuando se publiquen prendas según tus intereses" checked={notifs.emailNuevas} onChange={set('emailNuevas')} />
      <ToggleRow label="Resumen semanal" description="Un resumen de la actividad de tu cuenta cada semana" checked={notifs.emailResumen} onChange={set('emailResumen')} />

      <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', margin: '24px 0 8px' }}>Push</p>
      <ToggleRow label="Mensajes nuevos" description="Cuando un vendedor o comprador te escribe" checked={notifs.pushMensajes} onChange={set('pushMensajes')} />
      <ToggleRow label="Ventas realizadas" description="Cuando alguien compra una de tus prendas" checked={notifs.pushVentas} onChange={set('pushVentas')} />
      <ToggleRow label="Favoritos" description="Cuando alguien guarda una de tus prendas en favoritos" checked={notifs.pushFavoritos} onChange={set('pushFavoritos')} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <SaveButton onClick={handleSave} saved={saved} />
      </div>
    </SectionCard>
  )
}

function PrivacidadSection() {
  const [priv, setPriv] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('vint_privacy_prefs') : null
      if (saved) return JSON.parse(saved)
    } catch {}
    return { perfilPublico: true, mostrarUbicacion: true, mostrarCompras: false }
  })
  const [saved, setSaved] = useState(false)
  const set = (key: keyof typeof priv) => (v: boolean) => setPriv((p: any) => ({ ...p, [key]: v }))
  const handleSave = () => {
    localStorage.setItem('vint_privacy_prefs', JSON.stringify(priv))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <SectionCard title="Configuración de Privacidad" description="Controla qué información está disponible para otros usuarios">
      <ToggleRow label="Perfil público" description="Cualquier usuario puede ver tu perfil y publicaciones" checked={priv.perfilPublico} onChange={set('perfilPublico')} />
      <ToggleRow label="Mostrar ubicación" description="Tu ciudad aparece en tu perfil y en las prendas que publicas" checked={priv.mostrarUbicacion} onChange={set('mostrarUbicacion')} />
      <ToggleRow label="Historial de compras visible" description="Otros usuarios podrán ver cuántas compras has realizado" checked={priv.mostrarCompras} onChange={set('mostrarCompras')} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <SaveButton onClick={handleSave} saved={saved} />
      </div>
    </SectionCard>
  )
}

function AparienciaSection() {
  const { theme, setTheme } = useTheme()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <>
      <SectionCard title="Tema de la Aplicación" description="Elige cómo quieres ver Vint">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { id: 'light', label: 'Claro', icon: Sun, desc: 'Fondo crema, colores cálidos' },
            { id: 'dark', label: 'Oscuro', icon: Moon, desc: 'Fondo dark, elegante y moderno' },
          ].map(opt => {
            const Icon = opt.icon
            const active = theme === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                style={{
                  padding: 20, borderRadius: 16, cursor: 'pointer',
                  border: active ? '2px solid var(--accent)' : '2px solid var(--border)',
                  backgroundColor: active ? 'rgba(139,94,60,0.06)' : 'var(--bg-primary)',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: active ? 'var(--accent)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? 'white' : 'var(--text-muted)' }}>
                  <Icon size={20} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{opt.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>{opt.desc}</p>
                </div>
                {active && <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: 999 }}>Activo</span>}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <SaveButton onClick={handleSave} saved={saved} />
        </div>
      </SectionCard>
    </>
  )
}

function AyudaSection() {
  const faqs = [
    { q: '¿Cómo publico una prenda?', a: 'Ve a tu dashboard de vendedor → Publicar Prenda. Completa el formulario con fotos, precio y condición.' },
    { q: '¿Cómo agrego prendas a favoritos?', a: 'Haz clic en el ícono de corazón en cualquier prenda desde Explorar o el Dashboard.' },
    { q: '¿Cuánto tarda un envío?', a: 'Depende del vendedor. Puedes ver los tiempos de envío estimados en cada prenda.' },
    { q: '¿Puedo devolver una prenda?', a: 'Tienes 7 días para solicitar una devolución si la prenda no coincide con la descripción.' },
  ]
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      <SectionCard title="Preguntas Frecuentes">
        {faqs.map((faq, i) => (
          <div key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{faq.q}</span>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)', transform: openFaq === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>
            {openFaq === i && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.6 }}>{faq.a}</p>
            )}
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Contacto y Soporte" description="Nuestro equipo está disponible de lunes a viernes, 9am–6pm">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { icon: MessageCircle, label: 'Chat en Vivo', desc: 'Respuesta en minutos', btn: 'Iniciar chat', color: '#8B5E3C' },
            { icon: FileText, label: 'Reportar un Problema', desc: 'Te respondemos en 24h', btn: 'Enviar reporte', color: '#8B5E3C' },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} style={{ padding: 20, borderRadius: 16, border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, marginBottom: 12 }}>
                  <Icon size={20} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>{item.label}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 14px' }}>{item.desc}</p>
                <button style={{ padding: '9px 18px', borderRadius: 10, border: `1px solid ${item.color}`, backgroundColor: 'transparent', color: item.color, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {item.btn}
                </button>
              </div>
            )
          })}
        </div>
      </SectionCard>
    </>
  )
}

function PeligroSection() {
  return (
    <SectionCard title="Zona de Peligro" description="Estas acciones son irreversibles. Procede con cuidado.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { label: 'Desactivar cuenta temporalmente', desc: 'Tu perfil y prendas no serán visibles hasta que la reactives.', btn: 'Desactivar', level: 'warn' },
          { label: 'Eliminar cuenta permanentemente', desc: 'Se borrarán todos tus datos, prendas y transacciones. Esta acción no se puede deshacer.', btn: 'Eliminar cuenta', level: 'danger' },
        ].map((action, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
            padding: 20, borderRadius: 16,
            border: `1px solid ${action.level === 'danger' ? '#FCA5A5' : 'var(--border)'}`,
            backgroundColor: action.level === 'danger' ? 'rgba(239,68,68,0.04)' : 'var(--bg-primary)',
          }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: action.level === 'danger' ? '#EF4444' : 'var(--text-primary)', margin: 0 }}>{action.label}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>{action.desc}</p>
            </div>
            <button style={{
              padding: '10px 20px', borderRadius: 10, cursor: 'pointer', flexShrink: 0,
              backgroundColor: action.level === 'danger' ? '#EF4444' : 'transparent',
              color: action.level === 'danger' ? 'white' : '#EF4444',
              border: action.level === 'warn' ? '1px solid #EF4444' : 'none',
              fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s',
            }}>
              <Trash2 size={14} /> {action.btn}
            </button>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function PerfilClient() {
  const { user, loading } = useAuth()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get('tab') as Section | null
  const VALID_TABS: Section[] = ['perfil', 'cuenta', 'notificaciones', 'privacidad', 'apariencia', 'ayuda', 'peligro']
  const [active, setActive] = useState<Section>(
    tabFromUrl && VALID_TABS.includes(tabFromUrl) ? tabFromUrl : 'perfil'
  )

  const supabase = createClient()
  const [perfilData, setPerfilData] = useState<any>(null)

  useEffect(() => {
    if (user) {
      const fetchSidebarPerfil = async () => {
        let res = await supabase.from('usuarios').select('primer_nombre, segundo_nombre, primer_apellido, segundo_apellido').eq('id_auth_supabase', user.id).maybeSingle()
        if (res.error) {
          res = await supabase.schema('seguridad').from('usuarios').select('primer_nombre, segundo_nombre, primer_apellido, segundo_apellido').eq('id_auth_supabase', user.id).maybeSingle()
        }
        if (res.data) setPerfilData(res.data)
      }
      fetchSidebarPerfil()
      
      window.addEventListener('updatePerfil', fetchSidebarPerfil)
      return () => window.removeEventListener('updatePerfil', fetchSidebarPerfil)
    }
  }, [user, supabase])

  useEffect(() => {
    if (tabFromUrl && VALID_TABS.includes(tabFromUrl)) {
      setActive(tabFromUrl)
    }
  }, [tabFromUrl])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--accent)' }} />
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', gap: 16 }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Debes iniciar sesión para ver esta página</p>
        <a href="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Ir al Login →</a>
      </div>
    )
  }

  const SECTION_CONTENT: Record<Section, React.ReactNode> = {
    perfil: <PerfilSection />,
    cuenta: <CuentaSection />,
    notificaciones: <NotificacionesSection />,
    privacidad: <PrivacidadSection />,
    apariencia: <AparienciaSection />,
    ayuda: <AyudaSection />,
    peligro: <PeligroSection />,
  }

  const activeItem = SIDEBAR_ITEMS.find(i => i.id === active)!
  
  const fallbackName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'
  const nombreCompleto = perfilData 
    ? `${perfilData.primer_nombre} ${perfilData.segundo_nombre || ''} ${perfilData.primer_apellido} ${perfilData.segundo_apellido || ''}`.replace(/\s+/g, ' ').trim()
    : fallbackName

  const initials = nombreCompleto.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const avatarUrl = user?.user_metadata?.avatar_url || null

  return (
    <>
      <style>{`
        .perfil-sidebar-item:hover { background-color: var(--bg-secondary) !important; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .volver-link { color: var(--text-muted); }
        .volver-link:hover { color: var(--accent) !important; }
      `}</style>
      <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        {/* Page header */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '28px 2rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Link
              href="/dashboard"
              className="volver-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 16,
                transition: 'color 0.2s'
              }}
            >
              <ArrowLeft size={16} />
              Volver
            </Link>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Configuración
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
              Administra tu cuenta, privacidad y preferencias
            </p>
          </div>
        </div>

        {/* Layout */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 2rem', display: 'flex', gap: 32, alignItems: 'flex-start' }}>

          {/* Sidebar */}
          <nav style={{ width: 240, flexShrink: 0, position: 'sticky', top: 88 }}>
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', padding: 8 }}>
              {/* User pill */}
              <div style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)', marginBottom: 8, paddingBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white', overflow: 'hidden', flexShrink: 0 }}>
                  {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{nombreCompleto.split(' ')[0]}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>@{user?.user_metadata?.username || user?.email?.split('@')[0] || 'usuario'}</p>
                </div>
              </div>

              {/* Sidebar Items */}
              {SIDEBAR_ITEMS.map(item => {
                const Icon = item.icon
                const isActive = active === item.id
                return (
                  <button
                    key={item.id}
                    className="perfil-sidebar-item"
                    onClick={() => setActive(item.id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '11px 14px', border: 'none', cursor: 'pointer',
                      backgroundColor: isActive ? (item.danger ? 'rgba(239,68,68,0.1)' : 'rgba(139,94,60,0.1)') : 'transparent',
                      color: item.danger ? '#EF4444' : isActive ? 'var(--accent)' : 'var(--text-secondary)',
                      fontSize: 13, fontWeight: isActive ? 700 : 500, textAlign: 'left',
                      marginBottom: item.danger ? 0 : 2,
                      marginTop: item.danger ? 8 : 0,
                      borderTop: item.danger ? '1px solid var(--border)' : 'none',
                      borderRadius: item.danger ? '0 0 10px 10px' : 12,
                    }}
                  >
                    <Icon size={16} />
                    {item.label}
                    {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {(() => { const Icon = activeItem.icon; return <Icon size={22} style={{ color: activeItem.danger ? '#EF4444' : 'var(--accent)' }} />})()}
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {activeItem.label}
                </h2>
              </div>
            </div>
            {SECTION_CONTENT[active]}
          </div>

        </div>
      </main>
    </>
  )
}