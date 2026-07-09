import { useState, useRef, useEffect } from 'react'
import { Send, Square } from 'lucide-react'

export default function ChatInput({ onSend, disabled, isStreaming, onStop }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [text])

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
    textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{
      padding: '0.75rem 1rem',
      borderTop: '1px solid rgba(58,54,40,0.25)',
      background: 'rgba(10,9,5,0.8)',
      backdropFilter: 'blur(8px)',
    }}>
      <div className="max-w-2xl mx-auto">
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '0.5rem',
          background: 'rgba(26,24,20,0.8)',
          border: '1px solid rgba(58,54,40,0.5)',
          borderRadius: '10px',
          padding: '0.5rem 0.5rem 0.5rem 1rem',
          transition: 'border-color 200ms',
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(200,121,65,0.4)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'rgba(58,54,40,0.5)'}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Speak…"
            rows={1}
            disabled={disabled && !isStreaming}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              lineHeight: 1.6,
              color: 'var(--parchment)',
              caretColor: 'var(--ember)',
              minHeight: '28px',
              maxHeight: '160px',
              overflowY: 'auto',
            }}
          />

          {/* Send / Stop button */}
          {isStreaming ? (
            <button
              onClick={onStop}
              style={{
                flexShrink: 0,
                width: '34px', height: '34px',
                borderRadius: '7px',
                border: '1px solid rgba(200,121,65,0.4)',
                background: 'rgba(200,121,65,0.15)',
                color: 'var(--ember)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 150ms',
              }}
            >
              <Square size={13} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!text.trim() || disabled}
              style={{
                flexShrink: 0,
                width: '34px', height: '34px',
                borderRadius: '7px',
                border: '1px solid rgba(200,121,65,0.4)',
                background: text.trim() ? 'rgba(200,121,65,0.2)' : 'transparent',
                color: text.trim() ? 'var(--spark)' : 'var(--stone)',
                cursor: text.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 150ms',
              }}
            >
              <Send size={13} />
            </button>
          )}
        </div>

        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          color: 'var(--stone)',
          textAlign: 'center',
          marginTop: '0.4rem',
          opacity: 0.6,
        }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}