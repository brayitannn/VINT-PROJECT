'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Send, MessageCircle, Loader2, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { createPortal } from 'react-dom'

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  sellerName: string
  sellerSlug?: string
  sellerId?: string
  sellerEmail?: string
}

export function ChatModal({ isOpen, onClose, sellerName, sellerSlug, sellerId, sellerEmail }: ChatModalProps) {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()
  
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [resolvedSellerId, setResolvedSellerId] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const userId = user?.id || 'guest_user'
  const chatId = resolvedSellerId || sellerSlug || 'general_seller'
  
  const myEmail = user?.email || ''
  const mySlug = user?.user_metadata?.name 
    ? user.user_metadata.name.toLowerCase().replace(/\s+/g, '-')
    : (user?.email ? user.email.split('@')[0] : '')

  const myIdentifiers = [userId, myEmail, mySlug].filter(Boolean)
  const partnerIdentifiers = [chatId, sellerSlug, sellerEmail].filter(Boolean)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Resolve Seller's real Supabase UUID from email
  useEffect(() => {
    if (isOpen && sellerId && sellerId.length === 36 && sellerId.includes('-')) {
      setResolvedSellerId(sellerId)
    } else if (isOpen && sellerEmail) {
      const resolveSeller = async () => {
        try {
          const { data, error } = await supabase
            .from('v_usuarios_publico')
            .select('id_auth_supabase')
            .eq('correo', sellerEmail)
            .single()
          
          if (!error && data?.id_auth_supabase) {
            setResolvedSellerId(data.id_auth_supabase)
          } else {
            setResolvedSellerId(sellerId || sellerSlug || null)
          }
        } catch {
          setResolvedSellerId(sellerId || sellerSlug || null)
        }
      }
      resolveSeller()
    } else if (isOpen) {
      setResolvedSellerId(sellerId || sellerSlug || null)
    }
  }, [isOpen, sellerEmail, sellerId, sellerSlug, supabase])

  const markMessagesAsRead = async () => {
    if (!user || !resolvedSellerId) return
    try {
      // 1. Mark messages as read
      await supabase
        .from('mensajes')
        .update({ leido: true })
        .in('remitente_id', partnerIdentifiers)
        .in('destinatario_id', myIdentifiers)
        .eq('leido', false)

      // 2. Mark corresponding notifications in the bell as read
      if (sellerEmail) {
        await supabase
          .from('notificaciones')
          .update({ leida: true })
          .eq('usuario_id', userId)
          .eq('tipo', 'mensaje')
          .ilike('titulo', `%${sellerEmail}%`)
          .eq('leida', false)
      }
    } catch (e) {
      console.error('Error marking messages/notifications as read:', e)
    }
  }

  // Reset confirmation state when modal is closed or conversation changes
  useEffect(() => {
    if (!isOpen) {
      setDeleteConfirmOpen(false)
    }
  }, [isOpen])

  // Fetch messages & subscribe to Supabase Realtime
  useEffect(() => {
    if (!isOpen || !user || !resolvedSellerId) return

    fetchMessages()
    setIsOnline(Math.random() > 0.3)

    // Subscribe to realtime database changes for the 'mensajes' table
    const channel = supabase
      .channel(`chat_${userId}_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
        },
        (payload: any) => {
          const newMsg = payload.new
          
          // Verify if the inserted message belongs to this specific conversation
          const isFromPartner = partnerIdentifiers.includes(newMsg.remitente_id) && myIdentifiers.includes(newMsg.destinatario_id)
          const isFromMe = myIdentifiers.includes(newMsg.remitente_id) && partnerIdentifiers.includes(newMsg.destinatario_id)

          if (isFromPartner || isFromMe) {
            setMessages((prev) => {
              const exists = prev.some((m) => 
                m.id === newMsg.id || 
                (m.remitente_id === newMsg.remitente_id && 
                 m.contenido === newMsg.contenido && 
                 Math.abs(new Date(m.fecha).getTime() - new Date(newMsg.fecha).getTime()) < 10000)
              )
              if (exists) {
                return prev.map((m) => 
                  (m.remitente_id === newMsg.remitente_id && 
                   m.contenido === newMsg.contenido && 
                   String(m.id).startsWith('user-')) ? newMsg : m
                )
              }
              return [...prev, newMsg]
            })

            if (isFromPartner) {
              markMessagesAsRead()
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isOpen, resolvedSellerId, userId, chatId, supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    if (!user || !resolvedSellerId) return
    setLoading(true)
    try {
      const filter1 = `and(remitente_id.in.(${myIdentifiers.join(',')}),destinatario_id.in.(${partnerIdentifiers.join(',')}))`
      const filter2 = `and(remitente_id.in.(${partnerIdentifiers.join(',')}),destinatario_id.in.(${myIdentifiers.join(',')}))`
      const combinedFilter = `${filter1},${filter2}`

      const { data, error } = await supabase
        .from('mensajes')
        .select('*')
        .or(combinedFilter)
        .order('fecha', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        setMessages(data)
        markMessagesAsRead()
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
    if (!newMessage.trim() || !user || !resolvedSellerId) return

    const messageText = newMessage.trim()
    setNewMessage('')
    setSending(true)

    const userMessage = {
      remitente_id: userId,
      destinatario_id: chatId,
      contenido: messageText,
      fecha: new Date().toISOString()
    }

    const messageWithId = { ...userMessage, id: 'user-' + Date.now(), leido: false }
    setMessages((prev) => [...prev, messageWithId])

    const key = `vint_chat_${userId}_${chatId}`
    try {
      const localList = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)!) : []
      localStorage.setItem(key, JSON.stringify([...localList, messageWithId]))
    } catch (err) {
      console.error('Error saving message to local storage:', err)
    }

    try {
      const { error } = await supabase
        .from('mensajes')
        .insert([userMessage])

      if (error) throw error
    } catch (e) {
      console.log('Sincronizado solo en local:', e)
    } finally {
      setSending(false)
    }

  }

  const displayName = sellerName && sellerName.length === 36 && sellerName.includes('-')
    ? 'Usuario Vint'
    : sellerName;

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
                {displayName.charAt(0).toUpperCase()}
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
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{displayName}</h4>
              <p style={{ margin: 0, fontSize: 11, opacity: 0.8, fontWeight: 500 }}>
                {isOnline ? 'En línea' : 'Desconectado'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              title="Borrar historial de chat"
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
              className="hover:scale-105 hover:bg-red-600/30"
            >
              <Trash2 size={15} />
            </button>
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
                const isSentByMe = 
                  msg.remitente_id === userId || 
                  msg.remitente_id === myEmail || 
                  (mySlug && msg.remitente_id === mySlug)
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

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmOpen && typeof window !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 24,
          animation: 'fadeOverlay 0.2s ease forwards'
        }}>
          <div style={{
            backgroundColor: '#1E1B18', // Sleek dark card matching the Vint theme palette
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.08)',
            padding: 28,
            maxWidth: 360,
            width: '100%',
            boxShadow: '0 25px 60px rgba(0,0,0,0.45)',
            textAlign: 'center',
            animation: 'modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
          }}>
            <style>{`
              @keyframes fadeOverlay { from { opacity: 0; } to { opacity: 1; } }
              @keyframes modalSlideUp { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
              .vint-cancel-btn:hover { background-color: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.2) !important; }
              .vint-delete-btn:hover { background-color: #DC2626 !important; transform: scale(1.02); }
              .vint-delete-btn:active { transform: scale(0.98); }
            `}</style>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
            }}>
              <Trash2 size={26} />
            </div>
            <h4 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 800, color: 'white', fontFamily: 'var(--font-serif)' }}>
              ¿Borrar conversación?
            </h4>
            <p style={{ margin: '0 0 24px', fontSize: 13.5, color: '#A39E99', lineHeight: 1.5 }}>
              ¿Estás seguro de que deseas borrar toda la conversación con <strong>{displayName}</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="vint-cancel-btn"
                onClick={() => setDeleteConfirmOpen(false)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'transparent',
                  color: 'white',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancelar
              </button>
              <button
                className="vint-delete-btn"
                onClick={async () => {
                  setDeleteConfirmOpen(false)
                  try {
                    // 1. Delete messages sent by me to partner
                    await supabase
                      .from('mensajes')
                      .delete()
                      .in('remitente_id', myIdentifiers)
                      .in('destinatario_id', partnerIdentifiers)

                    // 2. Delete messages sent by partner to me
                    await supabase
                      .from('mensajes')
                      .delete()
                      .in('remitente_id', partnerIdentifiers)
                      .in('destinatario_id', myIdentifiers)

                    // 3. Delete notifications about messages from this partner
                    if (sellerEmail) {
                      await supabase
                        .from('notificaciones')
                        .delete()
                        .eq('usuario_id', userId)
                        .eq('tipo', 'mensaje')
                        .ilike('titulo', `%${sellerEmail}%`)
                    }

                    onClose()
                  } catch (e) {
                    console.error('Error clearing chat history:', e)
                  }
                }}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
