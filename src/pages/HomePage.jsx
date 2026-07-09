import { useNavigate } from 'react-router-dom'
import { useConversations } from '@/store/useConversations'
import { useAppStore } from '@/store/useAppStore'
import { Plus, MessageSquare, Clock } from 'lucide-react'

function formatDate(iso) {
  const d = new Date(iso)
  const diff = Date.now() - d
  if (diff < 60000)     return 'just now'
  if (diff < 3600000)   return Math.floor(diff/60000) + 'm ago'
  if (diff < 86400000)  return Math.floor(diff/3600000) + 'h ago'
  if (diff < 604800000) return Math.floor(diff/86400000) + 'd ago'
  return d.toLocaleDateString()
}

export default function HomePage() {
  const navigate           = useNavigate()
  const createConversation = useConversations(s => s.createConversation)
  const conversations      = useConversations(s => s.conversations)
  const userName           = useAppStore(s => s.userName)

  function handleNew() {
    const newId = createConversation()
    navigate('/chat/' + newId)
  }

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '640px',
        padding: '3rem 1.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>

        {/* Hero */}
        <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="flame-animate" style={{ fontSize: '3rem', marginBottom: '1.25rem' }}>🔥</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 5vw, 2.4rem)',
            fontWeight: 300,
            letterSpacing: '0.08em',
            color: 'var(--parchment)',
            marginBottom: '0.6rem',
          }}>
            Welcome back, {userName}
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            color: 'var(--stone)',
            fontStyle: 'italic',
            lineHeight: 1.7,
          }}>
            {conversations.length === 0
              ? 'The first conversation awaits you.'
              : `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''} held in this space.`}
          </p>
        </div>

        {/* New chat CTA */}
        <button
          className="btn-ember animate-fade-in"
          style={{ marginBottom: '3rem', padding: '0.75rem 2rem', fontSize: '0.85rem', gap: '0.5rem' }}
          onClick={handleNew}
        >
          <Plus size={15} />
          Begin a new conversation
        </button>

        {/* Recent conversations */}
        {conversations.length > 0 && (
          <div className="w-full animate-fade-in">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}>
              <Clock size={12} style={{ color: 'var(--stone)' }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.12em',
                color: 'var(--stone)',
                textTransform: 'uppercase',
              }}>
                Recent
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {conversations.slice(0, 8).map((convo, i) => (
                <div
                  key={convo.id}
                  onClick={() => navigate('/chat/' + convo.id)}
                  className="panel-sacred"
                  style={{
                    padding: '0.9rem 1.1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 200ms',
                    animationDelay: i * 0.05 + 's',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(200,121,65,0.3)'
                    e.currentTarget.style.background = 'rgba(26,24,20,0.95)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(58,54,40,0.3)'
                    e.currentTarget.style.background = 'rgba(15,14,11,0.9)'
                  }}
                >
                  <MessageSquare size={14} style={{ color: 'var(--stone)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.95rem',
                      color: 'var(--parchment)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {convo.title}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.62rem',
                      color: 'var(--stone)',
                      marginTop: '0.2rem',
                    }}>
                      {convo.messages.length} message{convo.messages.length !== 1 ? 's' : ''} · {formatDate(convo.updatedAt)}
                    </div>
                  </div>
                  <span style={{ color: 'var(--stone)', fontSize: '1rem', flexShrink: 0 }}>›</span>
                </div>
              ))}
            </div>

            {conversations.length > 8 && (
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'var(--stone)',
                textAlign: 'center',
                marginTop: '1rem',
              }}>
                + {conversations.length - 8} more in the sidebar
              </p>
            )}
          </div>
        )}

        {/* Empty state */}
        {conversations.length === 0 && (
          <div className="animate-fade-in" style={{
            textAlign: 'center',
            padding: '2rem',
            maxWidth: '320px',
          }}>
            <div style={{
              width: '1px',
              height: '60px',
              background: 'linear-gradient(to bottom, transparent, var(--slate))',
              margin: '0 auto 2rem',
            }} />
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              color: 'var(--stone)',
              fontStyle: 'italic',
              lineHeight: 1.8,
            }}>
              This space holds what you bring to it.
              Nothing is stored anywhere but here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
