import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

export default function MessageList({ messages }) {
  const bottomRef = useRef(null)
  const containerRef = useRef(null)

  // Auto-scroll to bottom on new messages / streaming chunks
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, messages[messages.length - 1]?.content])

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full"
           style={{ padding: '2rem' }}>
        <div className="flame-animate" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
          🔥
        </div>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.4rem',
          fontWeight: 300,
          color: 'var(--parchment)',
          letterSpacing: '0.06em',
          textAlign: 'center',
          marginBottom: '0.75rem',
        }}>
          The Spark is listening
        </p>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem',
          color: 'var(--stone)',
          fontStyle: 'italic',
          textAlign: 'center',
          maxWidth: '280px',
          lineHeight: 1.7,
        }}>
          Speak what is present for you, or simply begin.
        </p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto"
      style={{ padding: '1.5rem 1rem 1rem' }}
    >
      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} style={{ height: '1px' }} />
      </div>
    </div>
  )
}