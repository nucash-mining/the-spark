import StreamingDot from './StreamingDot'

function parseContent(text) {
  // Split into paragraphs, handle bold and italic inline
  return text.split('\n\n').filter(Boolean)
}

function renderInline(text) {
  // Handle **bold** and *italic*
  const parts = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
  let last = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index))
    }
    if (match[0].startsWith('**')) {
      parts.push(<strong key={match.index} style={{ color: 'var(--spark)', fontWeight: 500 }}>{match[2]}</strong>)
    } else {
      parts.push(<em key={match.index} style={{ color: 'var(--vellum)', fontStyle: 'italic' }}>{match[3]}</em>)
    }
    last = match.index + match[0].length
  }

  if (last < text.length) parts.push(text.slice(last))
  return parts
}

export default function MessageBubble({ message }) {
  const isUser      = message.role === 'user'
  const isStreaming = message.streaming && !message.content

  return (
    <div
      className="flex animate-fade-in"
      style={{ justifyContent: isUser ? 'flex-end' : 'flex-start' }}
    >
      {/* Spark avatar dot */}
      {!isUser && (
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'var(--ember)',
          marginTop: '1rem',
          marginRight: '0.6rem',
          flexShrink: 0,
          boxShadow: '0 0 6px rgba(200,121,65,0.6)',
        }} />
      )}

      <div style={{ maxWidth: '80%' }}>
        {/* Streaming dots only (empty assistant message) */}
        {isStreaming ? (
          <div className="bubble-spark">
            <StreamingDot />
          </div>
        ) : (
          <div className={isUser ? 'bubble-user' : 'bubble-spark'}>
            {isUser ? (
              // User messages: plain text, preserve line breaks
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}>
                {message.content}
              </div>
            ) : (
              // Spark messages: prose with inline formatting
              <div className="prose-spark">
                {parseContent(message.content).map((para, i) => (
                  <p key={i} style={{ marginTop: i > 0 ? '0.75em' : 0 }}>
                    {renderInline(para)}
                    {/* Blinking cursor on last paragraph while streaming */}
                    {message.streaming && i === parseContent(message.content).length - 1 && (
                      <span className="cursor-blink" />
                    )}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          color: 'var(--stone)',
          marginTop: '0.3rem',
          textAlign: isUser ? 'right' : 'left',
          paddingLeft: isUser ? 0 : '0.25rem',
          paddingRight: isUser ? '0.25rem' : 0,
        }}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit'
          })}
        </div>
      </div>

      {/* User avatar dot */}
      {isUser && (
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'var(--dust)',
          marginTop: '1rem',
          marginLeft: '0.6rem',
          flexShrink: 0,
        }} />
      )}
    </div>
  )
}