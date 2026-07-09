// Memory persistence layer: exports Spark conversation summaries to a file
// that Second-Me can pick up and index on its next training run.
//
// How it works:
//   - After each conversation finalizes, we generate a short summary
//   - The summary is appended to a JSONL file at the configured export path
//   - Second-Me indexes that file on next training run → the memory grows
//   - When Second-Me provider is active with L0 retrieval, it recalls these

import { generateTitle } from './anthropic.js'

const MEMORY_KEY = 'spark_memory_log'

// Generate a summary of a completed conversation using Claude (if available)
// or a simple first-message fallback.
export async function summarizeConversation({ apiKey, model, messages }) {
  if (!messages || messages.length < 2) return null

  // Use generateTitle as a lightweight one-shot call
  const userMessages = messages.filter(m => m.role === 'user').map(m => m.content).join(' | ')
  if (!apiKey) {
    return userMessages.slice(0, 200)
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 120,
        system: 'Summarize this inner reflection conversation in 2-3 sentences. Focus on the theme and any insight reached. Plain prose only.',
        messages: messages.slice(0, 10).map(m => ({ role: m.role, content: m.content })),
      }),
    })
    if (!res.ok) return userMessages.slice(0, 200)
    const data = await res.json()
    return data?.content?.[0]?.text?.trim() ?? userMessages.slice(0, 200)
  } catch {
    return userMessages.slice(0, 200)
  }
}

// Store a memory entry in localStorage (browser-side log)
export function storeMemoryLocally(entry) {
  try {
    const existing = JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]')
    existing.push(entry)
    // Keep last 200 entries
    if (existing.length > 200) existing.splice(0, existing.length - 200)
    localStorage.setItem(MEMORY_KEY, JSON.stringify(existing))
  } catch {
    // Storage full — skip silently
  }
}

// Retrieve recent memories from local storage
export function getLocalMemories(limit = 10) {
  try {
    const all = JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]')
    return all.slice(-limit)
  } catch {
    return []
  }
}

// Build a memory context block for injection into the system prompt
export function buildMemoryContext(memories) {
  if (!memories || memories.length === 0) return null
  const lines = memories
    .map(m => `- ${m.date}: ${m.summary}`)
    .join('\n')
  return `Recent inner reflections you have had:\n${lines}`
}

// Full pipeline: summarize → store → return the entry
export async function persistConversationMemory({ apiKey, model, messages, conversationTitle }) {
  const summary = await summarizeConversation({ apiKey, model, messages })
  if (!summary) return null

  const entry = {
    id:      crypto.randomUUID(),
    date:    new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    title:   conversationTitle || 'Reflection',
    summary,
  }

  storeMemoryLocally(entry)
  return entry
}
