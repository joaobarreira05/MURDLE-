import { useState, useEffect, useCallback } from 'react'
import type { SessionData, AppPage } from '@/types/game'

const TOKEN_KEY = 'murdoku_token'
const SESSION_KEY = 'murdoku_session'

const DEFAULT_SESSION: SessionData = {
  token: '',
  session_id: null,
  state: 'playing',
  attempts_remaining: 3,
  max_attempts: 3,
}

export function useSession() {
  const [token, setTokenState] = useState<string>(() => {
    return localStorage.getItem(TOKEN_KEY) || ''
  })

  const [sessionData, setSessionDataState] = useState<SessionData>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (stored) return { ...DEFAULT_SESSION, ...JSON.parse(stored) }
    } catch {
      // ignore
    }
    return DEFAULT_SESSION
  })

  const setToken = useCallback((t: string) => {
    setTokenState(t)
    if (t) localStorage.setItem(TOKEN_KEY, t)
    else localStorage.removeItem(TOKEN_KEY)
  }, [])

  const setSessionData = useCallback((data: Partial<SessionData>) => {
    setSessionDataState(prev => {
      const next = { ...prev, ...data }
      localStorage.setItem(SESSION_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearSession = useCallback(() => {
    setTokenState('')
    setSessionDataState(DEFAULT_SESSION)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(SESSION_KEY)
  }, [])

  const isAuthenticated = !!token

  return {
    token,
    sessionData,
    setToken,
    setSessionData,
    clearSession,
    isAuthenticated,
  }
}
