const DEFAULT_URL = 'http://localhost:8002'

// Stream a chat response from Second-Me's local API (OpenAI-compatible SSE)
export async function streamSecondMe({
  secondMeUrl = DEFAULT_URL,
  messages = [],
  enableL0Retrieval = true,
  onChunk = () => {},
  onDone  = () => {},
  onError = () => {},
}) {
  const controller = new AbortController()

  try {
    const response = await fetch(`${secondMeUrl}/api/kernel2/chat`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1024,
        metadata: { enable_l0_retrieval: enableL0Retrieval },
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      onError(err?.message ?? `Second-Me error ${response.status}`)
      return () => {}
    }

    const reader  = response.body.getReader()
    const decoder = new TextDecoder()
    let   buffer  = ''

    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read()
        if (done) { onDone(); break }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') { onDone(); return }

          try {
            const json = JSON.parse(data)
            const text = json.choices?.[0]?.delta?.content
            if (text) onChunk(text)
            if (json.choices?.[0]?.finish_reason === 'stop') { onDone(); return }
          } catch {
            // skip malformed
          }
        }
      }
    }

    pump().catch(err => {
      if (err.name !== 'AbortError') onError('Second-Me connection lost.')
    })

  } catch (err) {
    if (err.name !== 'AbortError') {
      onError('Could not reach Second-Me. Is it running at ' + secondMeUrl + '?')
    }
  }

  return () => controller.abort()
}

// Fetch an identity profile summary from Second-Me's L1 knowledge graph.
// Asks Second-Me to describe the user in a few sentences for context injection.
export async function fetchIdentityProfile(secondMeUrl = DEFAULT_URL) {
  let profile = ''

  await new Promise((resolve) => {
    streamSecondMe({
      secondMeUrl,
      enableL0Retrieval: true,
      messages: [
        {
          role: 'user',
          content: 'In 4–6 sentences, describe who I am based on everything you know about me — my values, interests, patterns, and how I tend to think. Write in second person ("You are…"). Be specific, not generic.',
        },
      ],
      onChunk: (c) => { profile += c },
      onDone:  resolve,
      onError: resolve,
    })
  })

  return profile.trim() || null
}

// Check if Second-Me is reachable at the given URL.
export async function checkSecondMeConnection(secondMeUrl = DEFAULT_URL) {
  try {
    const res = await fetch(`${secondMeUrl}/api/health`, { method: 'GET' })
    return res.ok
  } catch {
    // Some builds don't have /api/health — try a minimal chat ping
    try {
      const res = await fetch(`${secondMeUrl}/api/kernel2/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'ping' }], max_tokens: 1, stream: false }),
      })
      return res.status < 500
    } catch {
      return false
    }
  }
}
