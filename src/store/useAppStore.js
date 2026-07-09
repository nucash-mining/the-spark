import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set, get) => ({
      // API & model
      apiKey: '',
      model: 'claude-sonnet-4-20250514',

      // User identity
      userName: 'Seeker',

      // System prompt override (null = use default)
      systemPromptOverride: null,

      // Persona: 'mirror' (wise reflection) | 'companion' (warm emotional support)
      persona: 'companion',

      // UI state
      sidebarOpen: false,

      // ── Second-Me integration ────────────────────────────────
      // provider: which backend to use for chat
      provider: 'claude',            // 'claude' | 'secondme'

      // Second-Me local API endpoint
      secondMeUrl: 'http://localhost:8002',

      // Cached L1 identity profile fetched from Second-Me (injected into Claude prompt)
      secondMeContext: null,

      // Enable L0 knowledge retrieval when using Second-Me provider
      secondMeL0Retrieval: true,

      // Memory: persist conversation summaries and inject into future sessions
      memoryEnabled: false,

      // Actions
      setApiKey: (key) => set({ apiKey: key.trim() }),
      setModel: (model) => set({ model }),
      setUserName: (name) => set({ userName: name }),
      setSystemPromptOverride: (prompt) => set({ systemPromptOverride: prompt }),
      setPersona: (p) => set({ persona: p }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (val) => set({ sidebarOpen: val }),

      setProvider: (p) => set({ provider: p }),
      setSecondMeUrl: (url) => set({ secondMeUrl: url }),
      setSecondMeContext: (ctx) => set({ secondMeContext: ctx }),
      setSecondMeL0Retrieval: (v) => set({ secondMeL0Retrieval: v }),
      setMemoryEnabled: (v) => set({ memoryEnabled: v }),

      clearAll: () => set({
        apiKey: '',
        userName: 'Seeker',
        systemPromptOverride: null,
        persona: 'companion',
        sidebarOpen: false,
        provider: 'claude',
        secondMeContext: null,
        memoryEnabled: false,
      }),
    }),
    {
      name: 'spark_settings',
      partialize: (s) => ({
        apiKey:               s.apiKey,
        model:                s.model,
        userName:             s.userName,
        systemPromptOverride: s.systemPromptOverride,
        persona:              s.persona,
        provider:             s.provider,
        secondMeUrl:          s.secondMeUrl,
        secondMeContext:      s.secondMeContext,
        secondMeL0Retrieval:  s.secondMeL0Retrieval,
        memoryEnabled:        s.memoryEnabled,
      }),
    }
  )
)