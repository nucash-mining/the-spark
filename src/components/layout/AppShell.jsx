import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { useConversations } from '@/store/useConversations'
import { useAppStore } from '@/store/useAppStore'
import SettingsPanel from '@/components/settings/SettingsPanel'
import { Plus, MessageSquare, Settings, Menu, X, Flame } from 'lucide-react'

export default function AppShell() {
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const navigate   = useNavigate()
  const { id }     = useParams()
  const conversations      = useConversations(s => s.conversations)
  const createConversation = useConversations(s => s.createConversation)
  const deleteConversation = useConversations(s => s.deleteConversation)
  const userName   = useAppStore(s => s.userName)
  const [confirmId, setConfirmId] = useState(null)

  function handleNew() {
    const newId = createConversation()
    navigate('/chat/' + newId)
    setSidebarOpen(false)
  }

  function handleSelect(convId) {
    navigate('/chat/' + convId)
    setSidebarOpen(false)
  }

  function handleDelete(e, convId) {
    e.stopPropagation()
    if (confirmId === convId) {
      deleteConversation(convId)
      setConfirmId(null)
      if (id === convId) navigate('/')
    } else {
      setConfirmId(convId)
      setTimeout(() => setConfirmId(null), 3000)
    }
  }

  function formatDate(iso) {
    const d = new Date(iso)
    const diff = Date.now() - d
    if (diff < 60000)     return 'just now'
    if (diff < 3600000)   return Math.floor(diff/60000) + 'm ago'
    if (diff < 86400000)  return Math.floor(diff/3600000) + 'h ago'
    if (diff < 604800000) return Math.floor(diff/86400000) + 'd ago'
    return d.toLocaleDateString()
  }

  // Close sidebar on outside tap (mobile)
  useEffect(() => {
    if (!sidebarOpen) return
    function handler(e) {
      if (!e.target.closest('#spark-sidebar')) setSidebarOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [sidebarOpen])

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: 'var(--obsidian)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(58,54,40,0.35)', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="flame-animate" style={{ fontSize: '1.2rem' }}>🔥</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.15rem',
              letterSpacing: '0.08em',
              color: 'var(--parchment)',
            }}>The Spark</span>
          </div>
          <button
            className="btn-ghost no-tap"
            style={{ padding: '0.35rem' }}
            onClick={() => setSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* New chat button */}
      <div style={{ padding: '0.75rem' }}>
        <button className="btn-ember w-full" onClick={handleNew}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <Plus size={14} />
          New Conversation
        </button>
      </div>

      {/* Conversations */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.5rem 0.5rem' }}>
        {conversations.length === 0 ? (
          <div style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--stone)',
            fontStyle: 'italic',
            lineHeight: 1.6,
          }}>
            No conversations yet.
            Begin when ready.
          </div>
        ) : (
          conversations.map(convo => (
            <div
              key={convo.id}
              onClick={() => handleSelect(convo.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 0.75rem',
                borderRadius: '6px',
                marginBottom: '2px',
                cursor: 'pointer',
                borderLeft: id === convo.id ? '2px solid var(--ember)' : '2px solid transparent',
                background: id === convo.id ? 'rgba(26,24,20,0.9)' : 'transparent',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { if (id !== convo.id) e.currentTarget.style.background = 'rgba(26,24,20,0.6)' }}
              onMouseLeave={e => { if (id !== convo.id) e.currentTarget.style.background = 'transparent' }}
            >
              <MessageSquare size={11} style={{ color: 'var(--stone)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.73rem',
                  color: id === convo.id ? 'var(--parchment)' : 'var(--dust)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {convo.title}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  color: 'var(--stone)',
                  marginTop: '0.1rem',
                }}>
                  {formatDate(convo.updatedAt)}
                </div>
              </div>
              <button
                onClick={e => handleDelete(e, convo.id)}
                style={{
                  flexShrink: 0,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: confirmId === convo.id ? 'var(--ember)' : 'transparent',
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-mono)',
                  padding: '0.2rem 0.3rem',
                  borderRadius: '3px',
                  transition: 'all 150ms',
                }}
                className="group-hover-show"
                onMouseEnter={e => { if (confirmId !== convo.id) e.currentTarget.style.color = 'var(--stone)' }}
                onMouseLeave={e => { if (confirmId !== convo.id) e.currentTarget.style.color = 'transparent' }}
                title={confirmId === convo.id ? 'Click again to confirm delete' : 'Delete'}
              >
                {confirmId === convo.id ? 'del?' : '×'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(58,54,40,0.3)', padding: '0.75rem' }}>
        <button
          className="btn-ghost w-full no-tap"
          style={{ justifyContent: 'flex-start', gap: '0.5rem', padding: '0.5rem 0.75rem' }}
          onClick={() => { setSettingsOpen(true); setSidebarOpen(false) }}
        >
          <Settings size={13} />
          Settings
        </button>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          color: 'var(--stone)',
          padding: '0.4rem 0.75rem 0',
          opacity: 0.7,
        }}>
          {userName} · on-device · private
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', background: 'var(--void)' }}>

      {/* ── Desktop sidebar (always visible ≥768px) ── */}
      <div id="spark-sidebar" style={{
        width: '260px',
        flexShrink: 0,
        borderRight: '1px solid rgba(58,54,40,0.25)',
        display: 'none',
      }} className="md-sidebar">
        <SidebarContent />
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(10,9,5,0.75)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
        }}>
          <div
            id="spark-sidebar"
            className="animate-fade-in"
            style={{ width: '280px', height: '100%', flexShrink: 0 }}
          >
            <SidebarContent />
          </div>
          <div style={{ flex: 1 }} onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* ── Main area ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Top nav bar */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          height: '52px',
          flexShrink: 0,
          borderBottom: '1px solid rgba(58,54,40,0.25)',
          background: 'rgba(10,9,5,0.9)',
          backdropFilter: 'blur(8px)',
          gap: '0.75rem',
        }}>
          {/* Left: hamburger + brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="btn-ghost no-tap"
              style={{ padding: '0.4rem', flexShrink: 0 }}
              onClick={() => setSidebarOpen(v => !v)}
              title="Menu"
            >
              <Menu size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="flame-animate" style={{ fontSize: '1rem' }}>🔥</span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.05rem',
                letterSpacing: '0.1em',
                color: 'var(--parchment)',
              }}>
                The Spark
              </span>
            </div>
          </div>

          {/* Right: new chat + settings */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn-ember no-tap"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.72rem', gap: '0.35rem', whiteSpace: 'nowrap' }}
              onClick={handleNew}
            >
              <Plus size={13} />
              <span className="hide-xs">New Chat</span>
              <span className="show-xs">+</span>
            </button>
            <button
              className="btn-ghost no-tap"
              style={{ padding: '0.4rem' }}
              onClick={() => setSettingsOpen(true)}
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </nav>

        {/* Page content */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <Outlet />
        </div>
      </div>

      {/* Settings panel */}
      {settingsOpen && (
        <SettingsPanel onClose={() => setSettingsOpen(false)} />
      )}

      {/* Responsive CSS */}
      <style>{`
        @media (min-width: 768px) {
          .md-sidebar { display: flex !important; flex-direction: column; }
        }
        .hide-xs { display: inline; }
        .show-xs { display: none; }
        @media (max-width: 400px) {
          .hide-xs { display: none; }
          .show-xs { display: inline; }
        }
      `}</style>
    </div>
  )
}
