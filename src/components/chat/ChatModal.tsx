'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Send, MessageCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  sellerName: string
  sellerSlug?: string
  sellerId?: string
}

export function ChatModal({ isOpen, onClose, sellerName, sellerSlug, sellerId }: ChatModalProps) {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()
  
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const chatId = sellerId || sellerSlug || 'general_seller'
  const userId = user?.id || 'guest_user'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      fetchMessages()
      // Simular que el vendedor está activo (online)
      setIsOnline(Math.random() > 0.3)
    }
  }, [isOpen, chatId, userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    if (!user) return
    setLoading(true)
    try {
      // Intentar cargar de Supabase
      const { data, error } = await supabase
        .from('mensajes')
        .select('*')
        .or(`and(remitente_id.eq.${userId},destinatario_id.eq.${chatId}),and(remitente_id.eq.${chatId},destinatario_id.eq.${userId})`)
        .order('fecha', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        setMessages(data)
      } else {
        loadFromLocalStorage()
      }
    } catch (e) {
      console.log('Error cargando mensajes de Supabase, usando localStorage:', e)
      loadFromLocalStorage()
    } finally {
      setLoading(false)
    }
  }

  const loadFromLocalStorage = () => {
    const key = `vint_chat_${userId}_${chatId}`
    const local = localStorage.getItem(key)
    if (local) {
      setMessages(JSON.parse(local))
    } else {
      // Mensaje de bienvenida del vendedor
      const welcomeMessage = {
        id: 'welcome-' + Date.now(),
        remitente_id: chatId,
        destinatario_id: userId,
        contenido: `¡Hola! Gracias por contactarme. ¿Te interesa alguna de mis prendas en venta?`,
        fecha: new Date().toISOString()
      }
      localStorage.setItem(key, JSON.stringify([welcomeMessage]))
      setMessages([welcomeMessage])
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const messageText = newMessage.trim()
    setNewMessage('')
    setSending(true)

    const userMessage = {
      remitente_id: userId,
      destinatario_id: chatId,
      contenido: messageText,
      fecha: new Date().toISOString()
    }

    // Guardar localmente de inmediato para respuesta rápida
    const key = `vint_chat_${userId}_${chatId}`
    const localList = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)!) : []
    const messageWithId = { ...userMessage, id: 'user-' + Date.now() }
    const updatedList = [...localList, messageWithId]
    localStorage.setItem(key, JSON.stringify(updatedList))
    setMessages(updatedList)

    try {
      // Intentar insertar en Supabase
      const { error } = await supabase
        .from('mensajes')
        .insert([userMessage])

      if (error) throw error
    } catch (e) {
      console.log('Sincronizado solo en local:', e)
    } finally {
      setSending(false)
    }

    // Simular respuesta del vendedor tras 1.5 segundos
    setTimeout(() => {
      const respuestsVendedor = [
        "¡Hola! Sí, claro. Esa prenda está disponible y en perfecto estado. Hago el envío hoy mismo si compras antes de las 3 PM.",
        "Hola, un gusto saludarte. Te puedo dejar el precio mínimo publicado. Si te interesa me avisas para despachar.",
        "Hola. Las medidas aproximadas son de hombro a hombro 42cm y largo de manga 60cm. Avísame si tienes otra pregunta.",
        "Hola, ¡sí claro! Está en excelente estado, casi nueva. ¿En qué ciudad te encuentras para calcular el envío?",
        "¡Hola! Hago envíos a todo el país por Servientrega. El envío suele tardar de 1 a 2 días hábiles."
      ]
      
      const randomResponse = respuestsVendedor[Math.floor(Math.random() * respuestsVendedor.length)]
      
      const sellerReply = {
        id: 'reply-' + Date.now(),
        remitente_id: chatId,
        destinatario_id: userId,
        contenido: randomResponse,
        fecha: new Date().toISOString()
      }

      const currentList = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)!) : []
      const finalUpdatedList = [...currentList, sellerReply]
      localStorage.setItem(key, JSON.stringify(finalUpdatedList))
      setMessages(finalUpdatedList)

      // Guardar respuesta también en la DB si es posible
      try {
        supabase
          .from('mensajes')
          .insert([{ remitente_id: chatId, destinatario_id: userId, contenido: randomResponse }])
          .then(({ error }: { error: any }) => { if (error) console.log(error) })
      } catch (err) {}
    }, 1500)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 2000,
          animation: 'fadeOverlay 0.2s ease forwards'
        }}
      />

      {/* Ventana de Chat */}
      <div style={{
        position: 'fixed',
        right: 24,
        bottom: 24,
        width: '400px',
        maxWidth: 'calc(100vw - 48px)',
        height: '600px',
        maxHeight: 'calc(100vh - 48px)',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 24,
        border: '1px solid var(--border)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 2001,
        animation: 'slideUpChat 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
      }}>
        {/* Cabecera del Chat */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 16
              }}>
                {sellerName.charAt(0).toUpperCase()}
              </div>
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: isOnline ? '#10B981' : '#9CA3AF',
                border: '2px solid var(--accent)'
              }} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{sellerName}</h4>
              <p style={{ margin: 0, fontSize: 11, opacity: 0.8, fontWeight: 500 }}>
                {isOnline ? 'En línea' : 'Desconectado'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            className="hover:scale-105"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cuerpo del Chat */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          {authLoading || loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 className="animate-spin" size={24} style={{ color: 'var(--accent)' }} />
            </div>
          ) : !user ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: 20,
              gap: 16
            }}>
              <MessageCircle size={40} style={{ color: 'var(--text-muted)' }} />
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                  Chat no disponible
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                  Debes iniciar sesión para poder chatear con los vendedores de Vint.
                </p>
              </div>
              <Link 
                href="/login"
                onClick={onClose}
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  borderRadius: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: 13,
                  transition: 'all 0.2s'
                }}
                className="hover:scale-105"
              >
                Iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isSentByMe = msg.remitente_id === userId
                const msgTime = new Date(msg.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                
                return (
                  <div
                    key={msg.id || msg.fecha}
                    style={{
                      display: 'flex',
                      justifyContent: isSentByMe ? 'flex-end' : 'flex-start',
                      width: '100%',
                      animation: 'fadeMessage 0.2s ease forwards'
                    }}
                  >
                    <div style={{
                      maxWidth: '75%',
                      padding: '10px 14px',
                      borderRadius: isSentByMe ? '18px 18px 0px 18px' : '18px 18px 18px 0px',
                      backgroundColor: isSentByMe ? 'var(--accent)' : 'var(--bg-card)',
                      color: isSentByMe ? 'white' : 'var(--text-primary)',
                      border: isSentByMe ? 'none' : '1px solid var(--border)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      position: 'relative'
                    }}>
                      <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.4, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                        {msg.contenido}
                      </p>
                      <span style={{
                        display: 'block',
                        textAlign: 'right',
                        fontSize: 9,
                        opacity: 0.7,
                        marginTop: 4,
                        fontWeight: 600
                      }}>
                        {msgTime}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input de Mensaje */}
        {user && (
          <form 
            onSubmit={handleSendMessage}
            style={{
              padding: '16px 20px',
              backgroundColor: 'var(--bg-card)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 10
            }}
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              disabled={sending}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 14,
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: 13.5
              }}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              className="hover:scale-105"
            >
              <Send size={15} style={{ marginLeft: 2 }} />
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes fadeOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpChat {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeMessage {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
