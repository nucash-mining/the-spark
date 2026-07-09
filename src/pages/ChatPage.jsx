import { useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useConversations } from '@/store/useConversations'
import { useAppStore } from '@/store/useAppStore'
import { streamMessage, generateTitle } from '@/lib/anthropic'
import { streamSecondMe } from '@/lib/secondme'
import { persistConversationMemory, getLocalMemories, buildMemoryContext } from '@/lib/secondmeMemory'
import MessageList from '@/components/chat/MessageList'
import ChatInput from '@/components/chat/ChatInput'

export default function ChatPage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const abortRef     = useRef(null)
  const streamingRef = useRef(false)

  const {
    apiKey, model, userName, systemPromptOverride, persona,
    provider, secondMeUrl, secondMeContext, secondMeL0Retrieval, memoryEnabled,
  } = useAppStore()

  const {
    getById,
    addMessage,
    startAssistantMessage,
    appendToLastMessage,
    finalizeAssistantMessage,
    updateTitle,
  } = useConversations()

  const conversation = getById(id)

  useEffect(() => {
    if (!conversation) navigate('/')
  }, [id, conversation, navigate])

  useEffect(() => {
    return () => { abortRef.current?.() }
  }, [id])

  const isStreaming = conversation?.messages?.some(m => m.streaming) ?? false

  const handleSend = useCallback(async (text) => {
    if (!text.trim() || streamingRef.current) return
    streamingRef.current = true

    addMessage(id, 'user', text)
    startAssistantMessage(id)

    const convo = useConversations.getState().getById(id)
    const history = convo.messages
      .filter(m => !m.streaming)
      .map(m => ({ role: m.role, content: m.content }))

    // Build memory context block for injection (Claude mode only — Second-Me handles it via L0)
    const memoryContext = (memoryEnabled && provider === 'claude')
      ? buildMemoryContext(getLocalMemories(6))
      : null

    const handleDone = async () => {
      finalizeAssistantMessage(id)
      streamingRef.current = false

      const updated = useConversations.getState().getById(id)

      // Auto-title on second message (Claude only — Second-Me responses may not suit it)
      if (updated && updated.messages.length === 2 && provider === 'claude') {
        const title = await generateTitle({
          apiKey, model,
          messages: updated.messages.slice(0, 2).map(m => ({ role: m.role, content: m.content })),
        })
        if (title) updateTitle(id, title)
      }

      // Memory persistence: summarize and store after conversation grows
      if (memoryEnabled && updated && updated.messages.length >= 4) {
        await persistConversationMemory({
          apiKey,
          model,
          messages: updated.messages,
          conversationTitle: updated.title,
        })
      }
    }

    const handleError = (err) => {
      finalizeAssistantMessage(id)
      addMessage(id, 'assistant', '⚠ ' + err)
      streamingRef.current = false
    }

    let abort

    if (provider === 'secondme') {
      abort = await streamSecondMe({
        secondMeUrl,
        enableL0Retrieval: secondMeL0Retrieval,
        messages: history,
        onChunk: (chunk) => appendToLastMessage(id, chunk),
        onDone:  handleDone,
        onError: handleError,
      })
    } else {
      abort = await streamMessage({
        apiKey, model, userName, systemPromptOverride, persona,
        secondMeContext,
        memoryContext,
        messages: history,
        onChunk: (chunk) => appendToLastMessage(id, chunk),
        onDone:  handleDone,
        onError: handleError,
      })
    }

    abortRef.current = abort
  }, [
    id, apiKey, model, userName, systemPromptOverride, persona,
    provider, secondMeUrl, secondMeContext, secondMeL0Retrieval, memoryEnabled,
    addMessage, startAssistantMessage, appendToLastMessage,
    finalizeAssistantMessage, updateTitle,
  ])

  function handleStop() {
    abortRef.current?.()
    finalizeAssistantMessage(id)
    streamingRef.current = false
  }

  if (!conversation) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <MessageList messages={conversation.messages} />
      <ChatInput
        onSend={handleSend}
        disabled={isStreaming}
        isStreaming={isStreaming}
        onStop={handleStop}
      />
    </div>
  )
}
