import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import SacredBackground from '@/components/ui/SacredBackground'

export default function WelcomePage() {
  const navigate    = useNavigate()
  const setApiKey   = useAppStore(s => s.setApiKey)
  const setUserName = useAppStore(s => s.setUserName)

  const [key,     setKey]     = useState('')
  const [name,    setName]    = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [phase,   setPhase]   = useState('enter')

  async function validateKey() {
    setError('')
    if (!key.trim().startsWith('sk-ant-')) {
      setError("That doesn't look like an Anthropic key. It should start with sk-ant-")
      return
    }
    setLoading(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type':      'application/json',
          'x-api-key':         key.trim(),
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      })
      if (res.status === 401) { setError('Key rejected. Double-check and try again.'); return }
      setPhase('naming')
    } catch {
      setError('Could not reach Anthropic. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  function enter() {
    setApiKey(key.trim())
    setUserName(name.trim() || 'Seeker')
    navigate('/')
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      background: 'var(--void)',
    }}>
      <SacredBackground intensity={1} />

      {/* Main card */}
      <div className="animate-fade-in" style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '420px',
        margin: '0 auto', padding: '0 1.5rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>

        {/* Flame with halo */}
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80px', height: '80px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,121,65,0.3) 0%, transparent 70%)',
            filter: 'blur(8px)',
            animation: 'pulse-glow 3s ease-in-out infinite',
          }} />
          <div className="flame-animate" style={{ fontSize: '3.5rem', lineHeight: 1, position: 'relative' }}>
            🔥
          </div>
        </div>

        {/* Title block */}
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '3.2rem',
            fontWeight: 300,
            letterSpacing: '0.18em',
            color: 'var(--parchment)',
            lineHeight: 1,
            textShadow: '0 0 40px rgba(200,121,65,0.3)',
          }}>
            THE SPARK
          </h1>
          {/* Decorative rule */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            margin: '0.75rem 0',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(200,121,65,0.4))' }} />
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--ember)' }} />
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(200,121,65,0.4))' }} />
          </div>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            color: 'var(--stone)',
            fontStyle: 'italic',
            letterSpacing: '0.08em',
          }}>
            know thyself
          </p>
        </div>

        {/* Panel */}
        <div style={{
          width: '100%',
          marginTop: '2rem',
          background: 'rgba(15,14,11,0.85)',
          border: '1px solid rgba(200,121,65,0.15)',
          borderRadius: '12px',
          padding: '1.75rem',
          boxShadow: '0 0 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(200,121,65,0.08)',
          backdropFilter: 'blur(12px)',
        }}>

          {phase === 'enter' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.14em',
                  color: 'var(--ember)',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}>
                  ⬡ Anthropic API Key
                </label>
                <input
                  className="input-parchment"
                  type="password"
                  placeholder="sk-ant-..."
                  value={key}
                  onChange={e => { setKey(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && validateKey()}
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>

              {error && (
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                  color: 'var(--ember)', lineHeight: 1.5,
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(200,121,65,0.08)',
                  borderRadius: '6px',
                  border: '1px solid rgba(200,121,65,0.2)',
                }}>
                  {error}
                </p>
              )}

              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.63rem',
                color: 'var(--stone)', lineHeight: 1.7,
              }}>
                Your key is stored only in this browser. It never touches any server other than Anthropic.
              </p>

              <button
                className="btn-ember w-full"
                onClick={validateKey}
                disabled={loading || !key.trim()}
                style={{
                  opacity: loading || !key.trim() ? 0.4 : 1,
                  letterSpacing: '0.14em',
                  fontSize: '0.75rem',
                }}
              >
                {loading ? '· · ·' : '⬡  ENTER THE THRESHOLD'}
              </button>

              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.63rem',
                color: 'var(--stone)', textAlign: 'center',
              }}>
                console.anthropic.com/keys
              </p>
            </div>
          )}

          {phase === 'naming' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.4rem', fontWeight: 300,
                  color: 'var(--parchment)', letterSpacing: '0.04em',
                  marginBottom: '0.25rem',
                }}>
                  The threshold opens.
                </p>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '1rem',
                  color: 'var(--dust)', fontStyle: 'italic',
                }}>
                  What name do you carry?
                </p>
              </div>

              <input
                className="input-parchment text-center"
                type="text"
                placeholder="Seeker"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && enter()}
                maxLength={32}
                autoFocus
                style={{ textAlign: 'center', letterSpacing: '0.1em' }}
              />

              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.63rem',
                color: 'var(--stone)', textAlign: 'center',
              }}>
                Leave empty to walk as Seeker
              </p>

              <button
                className="btn-ember w-full"
                onClick={enter}
                style={{ letterSpacing: '0.14em', fontSize: '0.75rem' }}
              >
                ⬡  BEGIN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}