import React, { useState, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSession } from '@/hooks/useSession'
import type { AppPage, GameData, Reward } from '@/types/game'
import { startGame, getGameState } from '@/lib/api'

import LandingPage from '@/pages/LandingPage'
import AccessPage from '@/pages/AccessPage'
import IntroPage from '@/pages/IntroPage'
import GamePage from '@/pages/GamePage'
import VictoryPage from '@/pages/VictoryPage'
import GameOverPage from '@/pages/GameOverPage'

export default function App() {
  const { token, sessionData, setToken, setSessionData, clearSession, isAuthenticated } = useSession()
  const [page, setPage] = useState<AppPage>('landing')
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [reward, setReward] = useState<Reward | null>(null)
  const [isRestoringSession, setIsRestoringSession] = useState(false)

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      if (!token || !sessionData.session_id) {
        if (token) setPage('intro')
        return
      }
      setIsRestoringSession(true)
      try {
        const state = await getGameState(token, sessionData.session_id)
        setSessionData({
          state: state.state,
          attempts_remaining: state.attempts_remaining,
          max_attempts: state.max_attempts,
        })
        if (state.state === 'won') {
          setPage('victory')
        } else if (state.state === 'lost') {
          setPage('gameover')
        } else {
          // Need to also fetch game data if going back to game
          setPage('game')
        }
      } catch {
        // Session expired or invalid
        if (token) {
          // Token valid but no session — go to intro to start fresh
          setPage('intro')
        }
      } finally {
        setIsRestoringSession(false)
      }
    }
    restore()
  }, []) // Only run on mount

  const handleAuth = useCallback(async (newToken: string) => {
    setToken(newToken)
    setPage('intro')
  }, [setToken])

  const handleGameStart = useCallback(async () => {
    if (!token) return
    try {
      const data = await startGame(token)
      setGameData({
        characters: data.characters,
        locations: data.locations,
        clues: data.clues,
      })
      setSessionData({
        session_id: data.session_id,
        state: data.state,
        attempts_remaining: data.attempts_remaining,
        max_attempts: data.max_attempts,
      })
      setPage('game')
    } catch (err) {
      console.error('Failed to start game:', err)
    }
  }, [token, setSessionData])

  const handleVictory = useCallback((r: Reward) => {
    setReward(r)
    setPage('victory')
    setSessionData({ state: 'won' })
  }, [setSessionData])

  const handleGameOver = useCallback(() => {
    setPage('gameover')
    setSessionData({ state: 'lost' })
  }, [setSessionData])

  const handleRestart = useCallback(() => {
    clearSession()
    setGameData(null)
    setReward(null)
    setPage('landing')
  }, [clearSession])

  if (isRestoringSession) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[var(--text-secondary)] font-mono-custom text-sm tracking-widest">
            A RECUPERAR SESSÃO...
          </p>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {page === 'landing' && (
        <LandingPage key="landing" onEnter={() => setPage('access')} />
      )}
      {page === 'access' && (
        <AccessPage key="access" onAuth={handleAuth} />
      )}
      {page === 'intro' && (
        <IntroPage key="intro" onStart={handleGameStart} />
      )}
      {page === 'game' && gameData && (
        <GamePage
          key="game"
          token={token}
          sessionId={sessionData.session_id!}
          sessionData={sessionData}
          gameData={gameData}
          onVictory={handleVictory}
          onGameOver={handleGameOver}
          onSessionExpired={() => setPage('access')}
          setSessionData={setSessionData}
        />
      )}
      {page === 'game' && !gameData && (
        <div key="game-loading" className="min-h-screen bg-base flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {page === 'victory' && (
        <VictoryPage key="victory" reward={reward} onRestart={handleRestart} />
      )}
      {page === 'gameover' && (
        <GameOverPage key="gameover" onRestart={handleRestart} />
      )}
    </AnimatePresence>
  )
}
