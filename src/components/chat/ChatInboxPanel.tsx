'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, X, Loader2, Trash2, Search } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { createPortal } from 'react-dom'

export interface Conversation {
  partnerId: string
  partnerEmail: string
  partnerName: string
  lastMessage: string
  lastMessageDate: string
  unreadCount: number
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelectConversation: (email: string, name: string, id: string) => void
}

function formatTime(dateStr: string): string {
  try {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
    const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
    if (diff < 60) return 'Ahora mismo'
    if (diff < 3600) return rtf.format(-Math.floor(diff / 60), 'minute')
    if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), 'hour')
    return rtf.format(-Math.floor(diff / 86400), 'day')
  } catch {
    return ''
  }
}

export function ChatInboxPanel({ isOpen, onClose, onSelectConversation }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchingDb, setSearchingDb] = useState(false)


  // Database search debounce effect
  useEffect(() => {
    if (!searchQuery.trim() || !user) {
      setSearchResults([])
      return
    }

    const delayDebounce = setTimeout(async () => {
      setSearchingDb(true)
      try {
        const { data, error } = await supabase
          .from('v_usuarios_publico')
          .select('id_auth_supabase, correo, primer_nombre, primer_apellido')
          .or(`primer_nombre.ilike.%${searchQuery}%,primer_apellido.ilike.%${searchQuery}%,correo.ilike.%${searchQuery}%`)
          .neq('id_auth_supabase', user.id)
          .limit(5)

        if (!error && data) {
          setSearchResults(data)
        }
      } catch (e) {
        console.error('Error searching users in DB:', e)
      } finally {
        setSearchingDb(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery, user])



  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [isOpen, onClose])



  const fetchConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    try {
      // 1. Fetch all messages involving the current user
      const { data: messages, error } = await supabase
        .from('mensajes')
        .select('*')
        .or(`remitente_id.eq.${user.id},destinatario_id.eq.${user.id}`)
        .order('fecha', { ascending: false })

      if (error) throw error

      if (!messages || messages.length === 0) {
        setConversations([])
        setLoading(false)
        return
      }

      // 2. Group messages by partner
      const groups: Record<string, { lastMsg: any; unread: number }> = {}
      const partnerIdsSet = new Set<string>()

      messages.forEach((msg: any) => {
        const partnerId = msg.remitente_id === user.id ? msg.destinatario_id : msg.remitente_id
        if (!partnerId) return

        if (!groups[partnerId]) {
          groups[partnerId] = { lastMsg: msg, unread: 0 }
          partnerIdsSet.add(partnerId)
        }
        if (msg.destinatario_id === user.id && !msg.leido) {
          groups[partnerId].unread += 1
        }
      })

      const partnerIds = Array.from(partnerIdsSet)
      const uuids = partnerIds.filter(id => id.length === 36)

      // 3. Resolve profile details for partners from the public view
      let resolvedProfiles: Record<string, { email: string; name: string }> = {}
      
      if (uuids.length > 0) {
        const { data: profiles } = await supabase
          .from('v_usuarios_publico')
          .select('id_auth_supabase, correo, primer_nombre, primer_apellido')
          .in('id_auth_supabase', uuids)

        if (profiles) {
          profiles.forEach((p: any) => {
            const fullName = `${p.primer_nombre || ''} ${p.primer_apellido || ''}`.trim() || p.correo.split('@')[0]
            resolvedProfiles[p.id_auth_supabase] = {
              email: p.correo,
              name: fullName
            }
          })
        }
      }

      // 4. Construct conversations array
      const list: Conversation[] = partnerIds.map((partnerId) => {
        const group = groups[partnerId]
        const profile = resolvedProfiles[partnerId]
        
        return {
          partnerId,
          partnerEmail: profile?.email || (partnerId.includes('@') ? partnerId : `${partnerId}@vint.co`),
          partnerName: profile?.name || (partnerId.length === 36 && partnerId.includes('-') ? 'Usuario Vint' : partnerId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())),
          lastMessage: group.lastMsg.contenido,
          lastMessageDate: group.lastMsg.fecha,
          unreadCount: group.unread
        }
      })

      // 5. Merge duplicate entries with same case-insensitive name (e.g. legacy slug and new UUID profiles)
      const mergedMap: Record<string, Conversation> = {}
      list.forEach((conv) => {
        const cleanName = conv.partnerName.toLowerCase().trim()
        const existing = mergedMap[cleanName]
        if (!existing) {
          mergedMap[cleanName] = conv
        } else {
          const isCurrentNewer = new Date(conv.lastMessageDate).getTime() > new Date(existing.lastMessageDate).getTime()
          
          mergedMap[cleanName] = {
            partnerId: conv.partnerId.length === 36 ? conv.partnerId : existing.partnerId,
            partnerEmail: !conv.partnerEmail.includes('@vint.co') ? conv.partnerEmail : existing.partnerEmail,
            partnerName: isCurrentNewer ? conv.partnerName : existing.partnerName,
            lastMessage: isCurrentNewer ? conv.lastMessage : existing.lastMessage,
            lastMessageDate: isCurrentNewer ? conv.lastMessageDate : existing.lastMessageDate,
            unreadCount: existing.unreadCount + conv.unreadCount
          }
        }
      })

      const finalConversations = Object.values(mergedMap)

      // Sort by last message date descending
      finalConversations.sort((a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime())
      setConversations(finalConversations)

    } catch (e) {
      console.error('Error fetching chat inbox:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && user) {
      fetchConversations()

      const channelId = `inbox-${user.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      const channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'mensajes' },
          () => {
            fetchConversations()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [isOpen, user])

  if (!isOpen) return null

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 10px)',
        right: 0,
        width: 360,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        zIndex: 1000,
        overflow: 'hidden',
        animation: 'chatPanelSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <style>{`
        @keyframes chatPanelSlide {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .chat-item:hover { background-color: var(--bg-secondary) !important; }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-secondary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MessageSquare size={18} style={{ color: 'var(--accent)' }} />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
            Mensajes
          </h3>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 8, display: 'flex' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Buscador */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px 8px 34px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <Search size={14} style={{ position: 'absolute', left: 32, top: 21, color: 'var(--text-muted)' }} />
      </div>

      {/* Conversations List */}
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)', opacity: 0.5, margin: '0 auto' }} />
          </div>
        ) : (
          <>
            {/* 1. Conversaciones Activas Filtradas */}
            {searchQuery && conversations.filter(c =>
              c.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.partnerEmail.toLowerCase().includes(searchQuery.toLowerCase())
            ).length > 0 && (
              <div style={{ padding: '8px 20px 4px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                Conversaciones existentes
              </div>
            )}

            {conversations.filter(c => {
              if (!searchQuery) return true
              return c.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     c.partnerEmail.toLowerCase().includes(searchQuery.toLowerCase())
            }).map((conv) => (
              <div
                key={conv.partnerId}
                className="chat-item"
                onClick={() => {
                  onSelectConversation(conv.partnerEmail, conv.partnerName, conv.partnerId)
                  setSearchQuery('')
                  onClose()
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                  backgroundColor: conv.unreadCount > 0 ? 'rgba(139, 94, 60, 0.05)' : 'transparent'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 15, flexShrink: 0
                }}>
                  {conv.partnerName.charAt(0).toUpperCase()}
                </div>

                {/* Chat details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                    <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.partnerName}
                    </h4>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                      {formatTime(conv.lastMessageDate)}
                    </span>
                  </div>
                  <p style={{
                    margin: 0, fontSize: 12,
                    color: conv.unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: conv.unreadCount > 0 ? 600 : 400,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {conv.lastMessage}
                  </p>
                </div>

                {/* Unread indicator */}
                {conv.unreadCount > 0 && (
                  <div style={{
                    minWidth: 16, height: 16, borderRadius: 8,
                    backgroundColor: 'var(--accent)',
                    color: 'white', fontSize: 9, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 4px',
                    flexShrink: 0
                  }}>
                    {conv.unreadCount}
                  </div>
                )}
              </div>
            ))}

            {/* Si no hay chats activos y no hay búsqueda */}
            {!searchQuery && conversations.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <MessageSquare size={36} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: 12, margin: '0 auto' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
                  No tienes chats activos.<br />
                  <span style={{ fontSize: 12 }}>Busca un usuario arriba para iniciar un chat.</span>
                </p>
              </div>
            )}

            {/* 2. Resultados de búsqueda en base de datos para nuevos chats */}
            {searchQuery && (
              <>
                <div style={{ padding: '8px 20px 4px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', marginTop: 8 }}>
                  Iniciar nuevo chat
                </div>

                {searchingDb ? (
                  <div style={{ padding: '25px 20px', textAlign: 'center' }}>
                    <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent)', opacity: 0.5, margin: '0 auto' }} />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div style={{ padding: '25px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    No se encontraron usuarios nuevos
                  </div>
                ) : (
                  searchResults.map((u) => {
                    const fullName = `${u.primer_nombre || ''} ${u.primer_apellido || ''}`.trim() || u.correo.split('@')[0]
                    return (
                      <div
                        key={u.id_auth_supabase}
                        className="chat-item"
                        onClick={() => {
                          onSelectConversation(u.correo, fullName, u.id_auth_supabase)
                          setSearchQuery('')
                          onClose()
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 20px',
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s',
                        }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 13, flexShrink: 0
                        }}>
                          {fullName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {fullName}
                          </h4>
                          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.correo}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
