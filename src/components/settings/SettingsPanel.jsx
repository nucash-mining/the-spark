import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useConversations } from '@/store/useConversations'
import { fetchIdentityProfile, checkSecondMeConnection } from '@/lib/secondme'
import { X, Eye, EyeOff, Cpu, Cloud, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

export default function SettingsPanel({ onClose }) {
  const {
    apiKey, setApiKey, userName, setUserName,
    model, setModel, systemPromptOverride, setSystemPromptOverride,
    provider, setProvider,
    secondMeUrl, setSecondMeUrl,
    secondMeContext, setSecondMeContext,
    secondMeL0Retrieval, setSecondMeL0Retrieval,
    memoryEnabled, setMemoryEnabled,
    clearAll,
  } = useAppStore()
  const clearAllConversations = useConversations(s => s.clearAllConversations)

  const [keyVal,      setKeyVal]      = useState(apiKey)
  const [nameVal,     setNameVal]     = useState(userName)
  const [promptVal,   setPromptVal]   = useState(systemPromptOverride ?? '')
  const [smUrlVal,    setSmUrlVal]    = useState(secondMeUrl)
  const [showKey,     setShowKey]     = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [danger,      setDanger]      = useState(false)
  const [smStatus,    setSmStatus]    = useState(null)   // null | 'checking' | 'ok' | 'fail'
  const [smSyncing,   setSmSyncing]   = useState(false)
  const [smSyncDone,  setSmSyncDone]  = useState(false)

  function save() {
    if (keyVal.trim())  setApiKey(keyVal.trim())
    if (nameVal.trim()) setUserName(nameVal.trim())
    setSystemPromptOverride(promptVal.trim() || null)
    setSecondMeUrl(smUrlVal.trim() || 'http://localhost:8002')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleCheckConnection() {
    setSmStatus('checking')
    const ok = await checkSecondMeConnection(smUrlVal.trim() || secondMeUrl)
    setSmStatus(ok ? 'ok' : 'fail')
  }

  async function handleSyncProfile() {
    setSmSyncing(true)
    const ctx = await fetchIdentityProfile(smUrlVal.trim() || secondMeUrl)
    setSecondMeContext(ctx)
    setSmSyncing(false)
    setSmSyncDone(true)
    setTimeout(() => setSmSyncDone(false), 3000)
  }

  function nukeEverything() {
    clearAll()
    clearAllConversations()
    window.location.href = '/welcome'
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'flex-end',
      background: 'rgba(10,9,5,0.85)',
      backdropFilter: 'blur(4px)',
    }}
      onClick={onClose}
    >
      <div
        className="panel-sacred w-full animate-fade-in"
        style={{ maxHeight: '85vh', overflowY: 'auto', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
             style={{ borderBottom: '1px solid rgba(58,54,40,0.3)' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.3rem',
            color: 'var(--parchment)',
            letterSpacing: '0.06em',
          }}>
            Settings
          </h2>
          <button className="btn-ghost p-1.5" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-6 px-5 py-5">

          {/* API Key */}
          <div className="flex flex-col gap-2">
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                            letterSpacing: '0.1em', color: 'var(--dust)',
                            textTransform: 'uppercase' }}>
              API Key
            </label>
            <div className="relative">
              <input
                className="input-parchment pr-10"
                type={showKey ? 'text' : 'password'}
                value={keyVal}
                onChange={e => setKeyVal(e.target.value)}
                spellCheck="false"
                autoComplete="off"
              />
              <button
                onClick={() => setShowKey(v => !v)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%',
                         transform: 'translateY(-50%)', background: 'none',
                         border: 'none', cursor: 'pointer', color: 'var(--stone)' }}
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                            letterSpacing: '0.1em', color: 'var(--dust)',
                            textTransform: 'uppercase' }}>
              Your Name
            </label>
            <input
              className="input-parchment"
              type="text"
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              maxLength={32}
              placeholder="Seeker"
            />
          </div>

          {/* Model */}
          <div className="flex flex-col gap-2">
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                            letterSpacing: '0.1em', color: 'var(--dust)',
                            textTransform: 'uppercase' }}>
              Model
            </label>
            <select
              className="input-parchment"
              value={model}
              onChange={e => setModel(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (recommended)</option>
              <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (faster)</option>
            </select>
          </div>

          {/* System prompt override */}
          <div className="flex flex-col gap-2">
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                            letterSpacing: '0.1em', color: 'var(--dust)',
                            textTransform: 'uppercase' }}>
              Custom Persona <span style={{ color: 'var(--stone)' }}>(optional)</span>
            </label>
            <textarea
              className="input-parchment"
              rows={5}
              placeholder="Leave blank to use The Spark's default persona…"
              value={promptVal}
              onChange={e => setPromptVal(e.target.value)}
              style={{ resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {/* ── Second-Me ─────────────────────────────────────── */}
          <div style={{ borderTop: '1px solid rgba(58,54,40,0.3)', paddingTop: '1.25rem' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                        color: 'var(--dust)', marginBottom: '1rem',
                        letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Second-Me
            </p>

            {/* Provider toggle */}
            <div className="flex flex-col gap-2 mb-4">
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                              letterSpacing: '0.1em', color: 'var(--dust)',
                              textTransform: 'uppercase' }}>
                Provider
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setProvider('claude')}
                  className="flex-1 flex items-center justify-center gap-2"
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: provider === 'claude' ? '1px solid rgba(200,121,65,0.5)' : '1px solid rgba(58,54,40,0.3)',
                    background: provider === 'claude' ? 'rgba(200,121,65,0.08)' : 'transparent',
                    color: provider === 'claude' ? 'var(--ember)' : 'var(--stone)',
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', cursor: 'pointer',
                  }}
                >
                  <Cloud size={13} /> Claude API
                </button>
                <button
                  onClick={() => setProvider('secondme')}
                  className="flex-1 flex items-center justify-center gap-2"
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: provider === 'secondme' ? '1px solid rgba(200,121,65,0.5)' : '1px solid rgba(58,54,40,0.3)',
                    background: provider === 'secondme' ? 'rgba(200,121,65,0.08)' : 'transparent',
                    color: provider === 'secondme' ? 'var(--ember)' : 'var(--stone)',
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', cursor: 'pointer',
                  }}
                >
                  <Cpu size={13} /> Second-Me Local
                </button>
              </div>
            </div>

            {/* Second-Me URL */}
            <div className="flex flex-col gap-2 mb-3">
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                              letterSpacing: '0.1em', color: 'var(--dust)',
                              textTransform: 'uppercase' }}>
                Local endpoint
              </label>
              <div className="flex gap-2">
                <input
                  className="input-parchment flex-1"
                  type="text"
                  value={smUrlVal}
                  onChange={e => setSmUrlVal(e.target.value)}
                  placeholder="http://localhost:8002"
                  spellCheck="false"
                />
                <button
                  className="btn-ghost"
                  style={{ padding: '0 0.75rem', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                  onClick={handleCheckConnection}
                  disabled={smStatus === 'checking'}
                >
                  {smStatus === 'checking' ? '…'
                    : smStatus === 'ok'   ? <CheckCircle size={14} style={{ color: '#7ec8a0' }} />
                    : smStatus === 'fail' ? <XCircle size={14} style={{ color: 'var(--ember)' }} />
                    : 'Test'}
                </button>
              </div>
              {smStatus === 'fail' && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ember)' }}>
                  Could not reach Second-Me. Is it running?
                </p>
              )}
            </div>

            {/* L0 Retrieval toggle */}
            <div className="flex items-center justify-between mb-3">
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                              letterSpacing: '0.08em', color: 'var(--dust)',
                              textTransform: 'uppercase' }}>
                L0 Knowledge Retrieval
              </label>
              <button
                onClick={() => setSecondMeL0Retrieval(!secondMeL0Retrieval)}
                style={{
                  width: '38px', height: '20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: secondMeL0Retrieval ? 'rgba(200,121,65,0.6)' : 'rgba(58,54,40,0.5)',
                  position: 'relative', transition: 'background 200ms',
                }}
              >
                <span style={{
                  position: 'absolute', top: '2px',
                  left: secondMeL0Retrieval ? '20px' : '2px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: 'var(--parchment)', transition: 'left 200ms',
                }} />
              </button>
            </div>

            {/* Sync identity profile (injects into Claude prompt) */}
            <div className="flex flex-col gap-2 mb-3">
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                              letterSpacing: '0.1em', color: 'var(--dust)',
                              textTransform: 'uppercase' }}>
                Identity Context <span style={{ color: 'var(--stone)' }}>(for Claude mode)</span>
              </label>
              <button
                className="btn-ghost w-full flex items-center justify-center gap-2"
                onClick={handleSyncProfile}
                disabled={smSyncing}
              >
                <RefreshCw size={13} style={{ animation: smSyncing ? 'spin 1s linear infinite' : 'none' }} />
                {smSyncDone ? '✓ Profile synced' : smSyncing ? 'Fetching from Second-Me…' : 'Sync profile from Second-Me'}
              </button>
              {secondMeContext && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem',
                            color: 'var(--stone)', fontStyle: 'italic', lineHeight: 1.6 }}>
                  {secondMeContext.slice(0, 120)}{secondMeContext.length > 120 ? '…' : ''}
                </p>
              )}
            </div>

            {/* Memory persistence toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                                letterSpacing: '0.08em', color: 'var(--dust)',
                                textTransform: 'uppercase', display: 'block' }}>
                  Memory Persistence
                </label>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                            color: 'var(--stone)', marginTop: '0.2rem' }}>
                  Summarize sessions, inject into future ones
                </p>
              </div>
              <button
                onClick={() => setMemoryEnabled(!memoryEnabled)}
                style={{
                  width: '38px', height: '20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: memoryEnabled ? 'rgba(200,121,65,0.6)' : 'rgba(58,54,40,0.5)',
                  position: 'relative', transition: 'background 200ms', flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: '2px',
                  left: memoryEnabled ? '20px' : '2px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: 'var(--parchment)', transition: 'left 200ms',
                }} />
              </button>
            </div>
          </div>

          {/* Save */}
          <button className="btn-ember w-full" onClick={save}>
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>

          {/* Danger zone */}
          <div style={{ borderTop: '1px solid rgba(58,54,40,0.3)', paddingTop: '1.25rem' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                        color: 'var(--stone)', marginBottom: '0.75rem',
                        letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Danger Zone
            </p>
            {!danger ? (
              <button
                className="btn-ghost w-full"
                style={{ color: 'var(--ember)', borderColor: 'rgba(200,121,65,0.2)' }}
                onClick={() => setDanger(true)}
              >
                Erase All Data
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                            color: 'var(--parchment)', textAlign: 'center' }}>
                  This will erase all conversations and settings. Are you certain?
                </p>
                <div className="flex gap-2">
                  <button className="btn-ghost flex-1" onClick={() => setDanger(false)}>
                    Cancel
                  </button>
                  <button
                    className="btn-ember flex-1"
                    style={{ color: 'var(--ember)' }}
                    onClick={nukeEverything}
                  >
                    Yes, erase everything
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}