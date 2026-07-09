import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

const MAX_CONVERSATIONS = 50

function makeConversation(firstMessage = '') {
  const now = new Date().toISOString()
  return {
    id:        uuidv4(),
    title:     firstMessage
                 ? firstMessage.slice(0, 40) + (firstMessage.length > 40 ? '…' : '')
                 : 'New conversation',
    createdAt: now,
    updatedAt: now,
    messages:  [],
  }
}

export const useConversations = create(
  persist(
    (set, get) => ({
      conversations: [],
      activeId: null,

      // ── Selectors ──────────────────────────────────────────
      getActive() {
        const { conversations, activeId } = get()
        return conversations.find(c => c.id === activeId) ?? null
      },

      getById(id) {
        return get().conversations.find(c => c.id === id) ?? null
      },

      // ── Conversation CRUD ──────────────────────────────────
      createConversation(firstMessage = '') {
        const convo = makeConversation(firstMessage)
        set((s) => ({
          conversations: [convo, ...s.conversations].slice(0, MAX_CONVERSATIONS),
          activeId: convo.id,
        }))
        return convo.id
      },

      deleteConversation(id) {
        set((s) => {
          const conversations = s.conversations.filter(c => c.id !== id)
          const activeId = s.activeId === id
            ? (conversations[0]?.id ?? null)
            : s.activeId
          return { conversations, activeId }
        })
      },

      setActiveId(id) {
        set({ activeId: id })
      },

      updateTitle(id, title) {
        set((s) => ({
          conversations: s.conversations.map(c =>
            c.id === id ? { ...c, title } : c
          ),
        }))
      },

      // ── Message actions ────────────────────────────────────
      addMessage(conversationId, role, content) {
        const message = {
          id:        uuidv4(),
          role,
          content,
          timestamp: new Date().toISOString(),
        }
        set((s) => ({
          conversations: s.conversations.map(c => {
            if (c.id !== conversationId) return c
            // Auto-title from first user message
            const isFirst = c.messages.length === 0 && role === 'user'
            return {
              ...c,
              title: isFirst
                ? content.slice(0, 40) + (content.length > 40 ? '…' : '')
                : c.title,
              updatedAt: new Date().toISOString(),
              messages: [...c.messages, message],
            }
          }),
        }))
        return message.id
      },

      // For streaming: append text to the last assistant message
      appendToLastMessage(conversationId, chunk) {
        set((s) => ({
          conversations: s.conversations.map(c => {
            if (c.id !== conversationId) return c
            const messages = [...c.messages]
            const last = messages[messages.length - 1]
            if (!last || last.role !== 'assistant') return c
            messages[messages.length - 1] = {
              ...last,
              content: last.content + chunk,
            }
            return { ...c, messages, updatedAt: new Date().toISOString() }
          }),
        }))
      },

      // Start a streaming assistant message (empty, will be appended to)
      startAssistantMessage(conversationId) {
        const message = {
          id:        uuidv4(),
          role:      'assistant',
          content:   '',
          timestamp: new Date().toISOString(),
          streaming: true,
        }
        set((s) => ({
          conversations: s.conversations.map(c => {
            if (c.id !== conversationId) return c
            return { ...c, messages: [...c.messages, message] }
          }),
        }))
        return message.id
      },

      // Mark streaming complete
      finalizeAssistantMessage(conversationId) {
        set((s) => ({
          conversations: s.conversations.map(c => {
            if (c.id !== conversationId) return c
            const messages = c.messages.map(m =>
              m.streaming ? { ...m, streaming: false } : m
            )
            return { ...c, messages }
          }),
        }))
      },

      // ── Nuclear option ─────────────────────────────────────
      clearAllConversations() {
        set({ conversations: [], activeId: null })
      },
    }),
    {
      name: 'spark_conversations',
    }
  )
)