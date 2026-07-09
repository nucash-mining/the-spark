import { buildSystemPrompt } from './systemPrompt'

const API_URL = 'https://api.anthropic.com/v1/messages'

/**
 * Send a streaming message to Claude.
 *
 * @param {object} opts
 * @param {string}   opts.apiKey
 * @param {string}   opts.model
 * @param {string}   opts.userName
 * @param {string|null} opts.systemPromptOverride
 * @param {Array}    opts.messages        — full conversation history
 * @param {function} opts.onChunk         — called with each text delta string
 * @param {function} opts.onDone          — called when stream completes
 * @param {function} opts.onError         — called with error message string
 * @returns {function}                    — call to abort the stream
 */
export async function streamMessage({
  apiKey,
  model = 'claude-sonnet-4-20250514',
  userName = 'Seeker',
  systemPromptOverride = null,
  secondMeContext = null,
  memoryContext = null,
  messages = [],
  onChunk = () => {},
  onDone  = () => {},
  onError = () => {},
}) {
  const controller = new AbortController()

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type':            'application/json',
        'x-api-key':               apiKey,
        'anthropic-version':       '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: buildSystemPrompt(userName, systemPromptOverride, { secondMeContext, memoryContext }),
        stream: true,
        messages: messages.map(m => ({
          role:    m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      const msg = err?.error?.message ?? `API error ${response.status}`

      // Friendly messages for common errors
      if (response.status === 401) onError('Invalid API key. Check your key in Settings.')
      else if (response.status === 429) onError('Rate limit reached. Please wait a moment.')
      else if (response.status === 529) onError('Claude is overloaded. Try again shortly.')
      else onError(msg)
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
        buffer = lines.pop() // keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') { onDone(); return }

          try {
            const json = JSON.parse(data)
            if (json.type === 'content_block_delta' &&
                json.delta?.type === 'text_delta') {
              onChunk(json.delta.text)
            }
            // Handle stop reasons
            if (json.type === 'message_stop') {
              onDone()
              return
            }
          } catch {
            // Malformed JSON line — skip
          }
        }
      }
    }

    pump().catch((err) => {
      if (err.name !== 'AbortError') {
        onError('Connection lost. Please try again.')
      }
    })

  } catch (err) {
    if (err.name !== 'AbortError') {
      onError('Could not reach the API. Check your connection.')
    }
  }

  // Return abort function
  return () => controller.abort()
}

/**
 * Quick one-shot (non-streaming) call — used for auto-generating titles.
 */
export async function generateTitle({ apiKey, model, messages }) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type':            'application/json',
        'x-api-key':               apiKey,
        'anthropic-version':       '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 16,
        system: 'Generate a 2-5 word title for this conversation. Return only the title, no punctuation, no quotes.',
        messages,
      }),
    })

    if (!response.ok) return null
    const data = await response.json()
    return data?.content?.[0]?.text?.trim() ?? null
  } catch {
    return null
  }
}