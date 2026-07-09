import { useNavigate, useParams } from 'react-router-dom'
import { useConversations } from '@/store/useConversations'
import { useAppStore } from '@/store/useAppStore'
import { Plus, Trash2, Settings, X } from 'lucide-react'
import { useState } from 'react'

export default function Sidebar({ onClose, onSettingsOpen }) {
  const navigate           = useNavigate()
  const { id }             = useParams()
  const conversations      = useConversations(s => s.conversations)
  const createConversation = useConversations(s => s.createConversation)
  const deleteConversation = useConversations(s => s.deleteConversation)
  const userName           = useAppStore(s => s.userName)
  const [confirmId, setConfirmId] = useState(null)

  function handleNew() {
    const newId = createConversation()
    navigate(`/chat/${newId}`)
    onClose?.()
  }

  function handleSelect(convId) {
    navigate(`/chat/${convId}`)
    onClose?.()
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
    const d = new Date(iso), now = new Date(), diff = now - d
    if (diff < 60000)     return 'just now'
    if (diff < 3600000)   return `${Math.floor(diff/60000)}m ago`
    if (diff < 86400000)  return `${Math.floor(diff/3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff/86400000)}d ago`
    return d.toLocaleDateString()
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'linear-gradient(180deg, #0d0c09 0%, #0a0905 100%)',
      borderRight: '1px solid rgba(200,121,65,0.1)',
    }}>

      {/* Header */}
      <div style={{
        padding: '1.25rem 1rem 1rem',
        borderBottom: '1px solid rgba(200,121,65,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="flame-animate" style={{ fontSize: '1.1rem' }}>🔥</span>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem', fontWeight: 400,
              letterSpacing: '0.14em',
              color: 'var(--parchment)',
              lineHeight: 1,
            }}>
              THE SPARK
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.58rem',
              color: 'var(--stone)',
              letterSpacing: '0.08em',
              marginTop: '0.2rem',
            }}>
              private · on-device
            </div>
          </div>
        </div>
        <button className="btn-ghost" style={{ padding: '0.3rem' }} onClick={onClose}>
          <X size={14} />
        </button>
      </div>

      {/* New conversation */}
      <div style={{ padding: '0.75rem' }}>
        <button
          className="btn-ember w-full"
          onClick={handleNew}
          style={{ fontSize: '0.68rem', letterSpacing: '0.12em', padding: '0.6rem 1rem' }}
        >
          <Plus size={12} />
          NEW CONVERSATION
        </button>
      </div>

      {/* Section label */}
      {conversations.length > 0 && (
        <div style={{
          padding: '0.25rem 1rem 0.5rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.58rem',
          letterSpacing: '0.12em',
          color: 'var(--stone)',
          textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(200,121,65,0.1)' }} />
          Archive
          <div style={{ flex: 1, height: '1px', background: 'rgba(200,121,65,0.1)' }} />
        </div>
      )}

      {/* Conversations */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.5rem 0.5rem' }}>
        {conversations.length === 0 ? (
          <div style={{
            padding: '2rem 1rem', textAlign: 'center',
            fontFamily: 'var(--font-body)', fontStyle: 'italic',
            fontSize: '0.85rem', color: 'var(--stone)', lineHeight: 1.7,
          }}>
            No threads yet.<br />Begin when ready.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {conversations.map(convo => (
              <div
                key={convo.id}
                onClick={() => handleSelect(convo.id)}
                className="group"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 150ms',
                  borderLeft: id === convo.id ? '2px solid var(--ember)' : '2px solid transparent',
                  background: id === convo.id
                    ? 'rgba(200,121,65,0.08)'
                    : 'transparent',
                }}
                onMouseEnter={e => {
                  if (id !== convo.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                }}
                onMouseLeave={e => {
                  if (id !== convo.id) e.currentTarget.style.background = 'transparent'
                }}
              >
                {/* Ember dot */}
                <div style={{
                  width: '4px', height: '4px', borderRadius: '50%', flexShrink: 0,
                  background: id === convo.id ? 'var(--ember)' : 'var(--stone)',
                  boxShadow: id === convo.id ? '0 0 6px rgba(200,121,65,0.6)' : 'none',
                  transition: 'all 150ms',
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                    color: id === convo.id ? 'var(--parchment)' : 'var(--dust)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    lineHeight: 1.3,
                  }}>
                    {convo.title}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                    color: 'var(--stone)', marginTop: '0.15rem',
                  }}>
                    {formatDate(convo.updatedAt)}
                  </div>
                </div>

                <button
                  onClick={e => handleDelete(e, convo.id)}
                  style={{
                    flexShrink: 0, padding: '0.2rem', borderRadius: '4px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: confirmId === convo.id ? 'var(--ember)' : 'var(--stone)',
                    opacity: 0, transition: 'all 150ms',
                  }}
                  className="group-hover:opacity-100"
                  title={confirmId === convo.id ? 'Confirm delete' : 'Delete'}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(200,121,65,0.1)', padding: '0.75rem' }}>
        <button
          className="btn-ghost w-full"
          onClick={onSettingsOpen}
          style={{ justifyContent: 'flex-start', gap: '0.6rem', fontSize: '0.7rem' }}
        >
          <Settings size={13} />
          Settings
        </button>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
          color: 'var(--stone)', padding: '0.5rem 0.5rem 0',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
        }}>
          <div style={{
            width: '4px', height: '4px', borderRadius: '50%',
            background: 'var(--ember)',
            boxShadow: '0 0 4px rgba(200,121,65,0.8)',
          }} />
          {userName}
        </div>
      </div>
    </div>
  )
}