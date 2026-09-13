import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, Grid as GridIcon } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import type { GameData, Reward, SessionData, Character } from '@/types/game'
import { submitSolution, ApiError } from '@/lib/api'
import { useGameState } from '@/hooks/useGameState'
import { sounds } from '@/lib/sounds'

import CampusMap from '@/components/Map/CampusMap'
import CharacterPanel from '@/components/Characters/CharacterPanel'
import DossierPanel from '@/components/Clues/DossierPanel'
import LivesDisplay from '@/components/UI/LivesDisplay'
import SubmitModal from '@/components/UI/SubmitModal'
import CharacterCardDragging from '@/components/Characters/CharacterCardDragging'
import SoundToggle from '@/components/UI/SoundToggle'
import DeductionGrid from '@/components/Grid/DeductionGrid'

interface GamePageProps {
  token: string
  sessionId: string
  sessionData: SessionData
  gameData: GameData
  onVictory: (reward: Reward) => void
  onGameOver: () => void
  onSessionExpired: () => void
  setSessionData: (data: Partial<SessionData>) => void
}

export default function GamePage({
  token,
  sessionId,
  sessionData,
  gameData,
  onVictory,
  onGameOver,
  onSessionExpired,
  setSessionData,
}: GamePageProps) {
  const {
    placement,
    markedClues,
    selectedCharId,
    placedCount,
    placeCharacter,
    removeCharacter,
    selectCharacter,
    handleLocationTap,
    toggleClue,
    getCharAtLocation,
    getLocationForChar,
  } = useGameState(token, sessionId)

  const [activeChar, setActiveChar] = useState<Character | null>(null)
  const [activeView, setActiveView] = useState<'map' | 'grid'>('map')
  const [submitModalState, setSubmitModalState] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(sessionData.attempts_remaining)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  const totalCharacters = gameData.characters.length

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const charId = event.active.id as string
    const char = gameData.characters.find(c => c.id === charId)
    if (char) {
      setActiveChar(char)
      sounds.click()
    }
  }, [gameData.characters])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveChar(null)
    const { active, over } = event
    if (over) {
      const charId = active.id as string
      const locationId = over.id as string
      const isLocation = gameData.locations.some(l => l.id === locationId)
      if (isLocation) {
        placeCharacter(charId, locationId)
        sounds.drop()
      }
    }
  }, [gameData.locations, placeCharacter])

  const handleSubmit = async () => {
    if (placedCount < totalCharacters) {
      setSubmitMessage(`Ainda faltam ${totalCharacters - placedCount} suspeitos por colocar.`)
      setShowSubmitModal(true)
      setSubmitModalState('error')
      return
    }

    setShowSubmitModal(true)
    setSubmitModalState('loading')

    try {
      const result = await submitSolution(token, sessionId, placement)
      setAttemptsLeft(result.attempts_remaining)
      setSessionData({ attempts_remaining: result.attempts_remaining })

      if (result.correct) {
        setSubmitModalState('success')
        setSubmitMessage(result.message)
        sounds.success()
        setTimeout(() => {
          setShowSubmitModal(false)
          if (result.reward) onVictory(result.reward)
        }, 1500)
      } else if (result.game_over || result.already_won) {
        setSubmitModalState('error')
        setSubmitMessage(result.message)
        sounds.error()
        setTimeout(() => {
          setShowSubmitModal(false)
          onGameOver()
        }, 2000)
      } else {
        setSubmitModalState('error')
        setSubmitMessage(result.message)
        sounds.error()
      }
    } catch (err) {
      setSubmitModalState('error')
      if (err instanceof ApiError && err.status === 401) {
        setSubmitMessage('Sessão expirada. Faz login novamente.')
        setTimeout(onSessionExpired, 2000)
      } else {
        setSubmitMessage('Erro de ligação. Tenta novamente.')
      }
    }
  }

  const handleCloseModal = () => {
    if (submitModalState !== 'loading') {
      setShowSubmitModal(false)
      setSubmitModalState('idle')
    }
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-base)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Top bar */}
      <header
        className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between flex-wrap gap-2"
        style={{
          background: 'rgba(8,12,24,0.95)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="font-display text-sm tracking-[0.15em]" style={{ color: 'var(--text-primary)' }}>
            MURDOKU
          </span>
          <span className="hidden sm:inline font-mono-custom text-xs" style={{ color: 'var(--text-muted)' }}>
            — Faina DETI UA
          </span>
        </div>

        {/* Navigation View Selector Tabs */}
        <div className="flex items-center bg-[#0D1428] border border-[var(--border)] rounded-md p-1 gap-1">
          <button
            onClick={() => { setActiveView('map'); sounds.click(); }}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono-custom rounded transition-colors ${
              activeView === 'map'
                ? 'bg-[var(--accent-gold)] text-[#080C18] font-bold'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <Map size={14} />
            Mapa
          </button>
          <button
            onClick={() => { setActiveView('grid'); sounds.click(); }}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono-custom rounded transition-colors ${
              activeView === 'grid'
                ? 'bg-[var(--accent-gold)] text-[#080C18] font-bold'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <GridIcon size={14} />
            Caderno Murdle
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs font-mono-custom" style={{ color: 'var(--text-muted)' }}>
            {placedCount}/{totalCharacters} colocados
          </div>
          <LivesDisplay current={attemptsLeft} max={sessionData.max_attempts} />
          <SoundToggle />
        </div>
      </header>

      {/* DnD Context wraps everything */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Main layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
          {/* Character Panel — left on desktop, top on mobile */}
          <aside
            className="lg:w-64 xl:w-72 flex-shrink-0 overflow-y-auto border-b lg:border-b-0 lg:border-r"
            style={{ borderColor: 'var(--border)' }}
          >
            <CharacterPanel
              characters={gameData.characters}
              placement={placement}
              selectedCharId={selectedCharId}
              onSelectChar={selectCharacter}
              onRemoveChar={removeCharacter}
              getLocationForChar={getLocationForChar}
              locations={gameData.locations}
            />
          </aside>

          {/* Center Main View (Map or Deduction Grid) */}
          <main className="flex-1 overflow-hidden flex flex-col">
            {activeView === 'map' ? (
              <CampusMap
                locations={gameData.locations}
                characters={gameData.characters}
                placement={placement}
                selectedCharId={selectedCharId}
                getCharAtLocation={getCharAtLocation}
                onLocationTap={handleLocationTap}
              />
            ) : (
              <DeductionGrid
                characters={gameData.characters}
                locations={gameData.locations}
                placement={placement}
                onPlaceCharacter={placeCharacter}
                onRemoveCharacter={removeCharacter}
              />
            )}

            {/* Submit button */}
            <div
              className="p-4 flex justify-center"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <motion.button
                onClick={handleSubmit}
                className="px-8 py-3 font-display text-sm tracking-[0.2em] transition-all duration-200"
                style={{
                  background: placedCount === totalCharacters
                    ? 'var(--accent-gold)'
                    : 'transparent',
                  color: placedCount === totalCharacters
                    ? '#080C18'
                    : 'var(--text-muted)',
                  border: placedCount === totalCharacters
                    ? 'none'
                    : '1px solid var(--border)',
                }}
                whileHover={placedCount === totalCharacters ? { scale: 1.02 } : {}}
                whileTap={placedCount === totalCharacters ? { scale: 0.98 } : {}}
              >
                ACUSAR — SUBMETER SOLUÇÃO
              </motion.button>
            </div>
          </main>

          {/* Clues panel — right on desktop, bottom on mobile */}
          <aside
            className="lg:w-72 xl:w-80 flex-shrink-0 overflow-y-auto border-t lg:border-t-0 lg:border-l"
            style={{ borderColor: 'var(--border)' }}
          >
            <DossierPanel
              clues={gameData.clues}
              markedClues={markedClues}
              onToggleClue={toggleClue}
            />
          </aside>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeChar && (
            <CharacterCardDragging character={activeChar} />
          )}
        </DragOverlay>
      </DndContext>

      {/* Submit modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <SubmitModal
            state={submitModalState}
            message={submitMessage}
            attemptsLeft={attemptsLeft}
            maxAttempts={sessionData.max_attempts}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
