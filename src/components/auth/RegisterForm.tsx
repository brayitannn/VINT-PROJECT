"use client";

import Link from "next/link";
import { Loader2, Check, ShoppingBag, Store, ArrowLeft, User, Mail, Lock, Eye, EyeOff, Phone, Calendar, AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { VintSelect } from "@/components/ui/VintSelect";
import { useRegister } from "@/hooks/useRegister";

export function RegisterForm() {
  const {
    formData,
    setFormData,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    error,
    handleSubmit
  } = useRegister();

  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full max-w-[480px] relative z-10 flex flex-col pt-24">
      <br /><div className="flex flex-col gap-6 mb-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-70" 
          style={{ color: "var(--accent)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Vint
        </Link>
        <div className="flex flex-col gap-2">
          <h2 className="text-[32px] font-bold tracking-tight leading-tight" style={{ color: "var(--text-primary)" }}>Únete a VINT</h2>
          <p className="text-[15px] font-medium" style={{ color: "var(--text-muted)" }}>Ingresa tus datos y comencemos a ver tu estilo</p><br></br>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div 
            className="flex items-start gap-3 p-4 rounded-2xl mb-2 animate-fade-in-up"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#EF4444"
            }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold">Problema con el registro</span>
              <span className="text-[13px] opacity-90 leading-relaxed mt-0.5">{error}</span>
            </div>
          </div>
        )}


        {/* Formulario de registro */}
        <div className="flex flex-col gap-4">

          {/* Primer Nombre */}
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent)] z-20 pointer-events-none" />
            <Input
              type="text"
              placeholder="Primer Nombre"
              value={formData.primerNombre}
              onChange={(e) => setFormData({ ...formData, primerNombre: e.target.value })}
              required
              className="w-full h-[60px] text-[16px] transition-all duration-300 outline-none vint-input bg-[var(--bg-secondary)]"
              style={{
                 borderRadius: "18px",
                 border: "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
                 color: "var(--text-primary)",
                 paddingLeft: "52px",
                 paddingRight: "20px"
              }}
            />
          </div>

          {/* Segundo Nombre */}
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent)] z-20 pointer-events-none" />
            <Input
              type="text"
              placeholder="Segundo Nombre (Opcional)"
              value={formData.segundoNombre}
              onChange={(e) => setFormData({ ...formData, segundoNombre: e.target.value })}
              className="w-full h-[60px] text-[16px] transition-all duration-300 outline-none vint-input bg-[var(--bg-secondary)]"
              style={{
                 borderRadius: "18px",
                 border: "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
                 color: "var(--text-primary)",
                 paddingLeft: "52px",
                 paddingRight: "20px"
              }}
            />
          </div>

          {/* Primer Apellido */}
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent)] z-20 pointer-events-none" />
            <Input
              type="text"
              placeholder="Primer Apellido"
              value={formData.primerApellido}
              onChange={(e) => setFormData({ ...formData, primerApellido: e.target.value })}
              required
              className="w-full h-[60px] text-[16px] transition-all duration-300 outline-none vint-input bg-[var(--bg-secondary)]"
              style={{
                 borderRadius: "18px",
                 border: "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
                 color: "var(--text-primary)",
                 paddingLeft: "52px",
                 paddingRight: "20px"
              }}
            />
          </div>

          {/* Segundo Apellido */}
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent)] z-20 pointer-events-none" />
            <Input
              type="text"
              placeholder="Segundo Apellido"
              value={formData.segundoApellido}
              onChange={(e) => setFormData({ ...formData, segundoApellido: e.target.value })}
              required
              className="w-full h-[60px] text-[16px] transition-all duration-300 outline-none vint-input bg-[var(--bg-secondary)]"
              style={{
                 borderRadius: "18px",
                 border: "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
                 color: "var(--text-primary)",
                 paddingLeft: "52px",
                 paddingRight: "20px"
              }}
            />
          </div>

          {/* Email */}
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent)] z-20 pointer-events-none" />
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full h-[60px] text-[16px] transition-all duration-300 outline-none vint-input bg-[var(--bg-secondary)]"
              style={{
                 borderRadius: "18px",
                 border: "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
                 color: "var(--text-primary)",
                 paddingLeft: "52px",
                 paddingRight: "20px"
              }}
            />
          </div>
          
          {/* Telefono */}
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent)] z-20 pointer-events-none" />
            <Input
              type="tel"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="w-full h-[60px] text-[16px] transition-all duration-300 outline-none vint-input bg-[var(--bg-secondary)]"
              style={{
                 borderRadius: "18px",
                 border: "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
                 color: "var(--text-primary)",
                 paddingLeft: "52px",
                 paddingRight: "20px"
              }}
            />
          </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fecha de Nacimiento */}
            <div className="flex flex-col gap-2">
               <label className="text-[12px] font-bold uppercase tracking-wider ml-1" style={{ color: "var(--text-muted)" }}>Fecha de Nacimiento</label>
               <div className="relative group">
                 <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent)] z-20 pointer-events-none" />
                 <Input
                   type="date"
                   max={hoy}
                   value={formData.fechaNacimiento}
                   onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                   required
                   className="w-full h-[60px] text-[16px] transition-all duration-300 outline-none vint-input bg-[var(--bg-secondary)] hide-calendar-icon"
                   style={{
                      borderRadius: "18px",
                      border: "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
                      color: formData.fechaNacimiento ? "var(--text-primary)" : "var(--text-muted)",
                      paddingLeft: "52px",
                      paddingRight: "20px"
                   }}
                 />
                 <style>{`
                   .hide-calendar-icon::-webkit-calendar-picker-indicator {
                     position: absolute;
                     left: 0;
                     top: 0;
                     width: 100%;
                     height: 100%;
                     opacity: 0;
                     cursor: pointer;
                     color: transparent;
                     background: transparent;
                   }
                 `}</style>
               </div>
            </div>

            {/* Género */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold uppercase tracking-wider ml-1" style={{ color: "var(--text-muted)" }}>Género</label>
              <VintSelect
                value={formData.genero}
                onChange={(val) => setFormData({ ...formData, genero: val })}
                options={[
                  { value: "Hombre", label: "Hombre" },
                  { value: "Mujer", label: "Mujer" },
                  { value: "Prefiero no decirlo", label: "Prefiero no decirlo" },
                ]}
                placeholder="Selecciona una opción"
              />
            </div>
          </div>
        </div>

          {/* Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent)] z-20 pointer-events-none" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full h-[60px] text-[16px] transition-all duration-300 outline-none vint-input bg-[var(--bg-secondary)]"
                style={{
                   borderRadius: "18px",
                   border: "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
                   color: "var(--text-primary)",
                   paddingLeft: "52px",
                   paddingRight: "45px"
                }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors z-30"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirmar Password */}
            <div className="relative group">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full h-[60px] text-[16px] transition-all duration-300 outline-none vint-input bg-[var(--bg-secondary)]"
                style={{
                   borderRadius: "18px",
                   border: "1.5px solid color-mix(in srgb, var(--border) 60%, transparent)",
                   color: "var(--text-primary)",
                   paddingLeft: "20px",
                   paddingRight: "45px"
                }}
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors z-30"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

        <div className="mt-8 flex flex-col gap-6">
          <label
            className="text-[11px] font-bold uppercase tracking-widest block text-center"
            style={{ color: "var(--text-muted)" }}
          >
            ¿A qué vienes a Vint?
          </label>

          <RadioGroup
            value={formData.userType}
            onValueChange={(value) => setFormData({ ...formData, userType: value })}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { value: "comprador", label: "Solo Comprar", sub: "Explorar el catálogo", icon: ShoppingBag },
              { value: "vendedor", label: "Quiero Vender", sub: "Publicar mis prendas", icon: Store },
            ].map((type) => {
              const isSelected = formData.userType === type.value;
              const Icon = type.icon;
              return (
                <label
                  key={type.value}
                  className="relative flex flex-col items-center justify-center p-5 cursor-pointer transition-all duration-300 overflow-hidden"
                  style={{
                    borderRadius: "20px",
                    border: isSelected
                      ? "2px solid var(--accent)"
                      : "1.5px solid var(--border)",
                    backgroundColor: isSelected ? "var(--bg-card)" : "var(--bg-secondary)",
                    transform: isSelected ? "translateY(-3px)" : "translateY(0)",
                    boxShadow: isSelected
                      ? "0 8px 20px -4px color-mix(in srgb, var(--accent) 18%, transparent)"
                      : "none",
                  }}
                >
                  <RadioGroupItem value={type.value} id={type.value} className="sr-only" />

                  {/* glow de fondo */}
                  {isSelected && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(ellipse at 50% 90%, color-mix(in srgb, var(--accent) 12%, transparent) 0%, transparent 70%)",
                      }}
                    />
                  )}

                  {/* checkmark */}
                  <div
                    className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 rounded-full text-white transition-all duration-200"
                    style={{
                      backgroundColor: "var(--accent)",
                      opacity: isSelected ? 1 : 0,
                      transform: isSelected ? "scale(1)" : "scale(0.5)",
                    }}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>

                  {/* ícono en contenedor */}
                  <div
                    className="flex items-center justify-center mb-2.5 transition-colors duration-200 relative z-10"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: isSelected
                        ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                        : "color-mix(in srgb, var(--accent) 8%, transparent)",
                    }}
                  >
                    <Icon
                      className="w-6 h-6 transition-colors duration-200"
                      style={{ color: isSelected ? "var(--accent)" : "var(--text-muted)" }}
                    />
                  </div>

                  <span
                    className="text-[14px] font-bold text-center leading-tight relative z-10"
                    style={{ color: isSelected ? "var(--accent)" : "var(--text-primary)" }}
                  >
                    {type.label}
                  </span>

                  {/* subtítulo opcional */}
                  <span
                    className="text-[11px] mt-0.5 text-center relative z-10"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {type.sub}
                  </span>
                </label>
              );
            })}
          </RadioGroup>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[64px] text-[17px] font-bold text-white rounded-[100px] flex items-center justify-center gap-2 relative overflow-hidden mt-2 vint-btn-primary"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Crear mi cuenta"}
        </button>
        
        <div className="mt-4 text-center">
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Al registrarte, aceptas nuestras{" "}
              <span className="font-semibold cursor-pointer hover:underline" style={{ color: "var(--text-secondary)" }}>Condiciones</span>
              {" "}y la{" "}
              <span className="font-semibold cursor-pointer hover:underline" style={{ color: "var(--text-secondary)" }}>Política de Privacidad</span>.
            </p>
        </div>

        <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-[15px] text-[var(--text-muted)]">
                ¿Ya tienes una cuenta?{" "}
                <Link 
                    href="/login" 
                    className="font-bold hover:underline"
                    style={{ color: "var(--accent)" }}
                >
                    Inicia sesión
                </Link>
            </p>
        </div><br />

      </form>
    </div>
  );
}
