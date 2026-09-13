import { useState, useCallback, useEffect, useRef } from 'react'
import type { Character, Location, Clue, PlacementMap, SubmitState } from '@/types/game'
import { saveGameState } from '@/lib/api'

const PLACEMENT_KEY = 'murdoku_placement'
const MARKED_KEY = 'murdoku_marked'

export function useGameState(
  token: string,
  sessionId: string | null,
  initialPlacement?: Record<string, string>,
  initialMarked?: string[],
) {
  const [placement, setPlacementState] = useState<PlacementMap>(() => {
    if (initialPlacement && Object.keys(initialPlacement).length > 0) {
      return initialPlacement
    }
    try {
      const s = localStorage.getItem(PLACEMENT_KEY)
      return s ? JSON.parse(s) : {}
    } catch {
      return {}
    }
  })

  const [markedClues, setMarkedCluesState] = useState<string[]>(() => {
    if (initialMarked && initialMarked.length > 0) return initialMarked
    try {
      const s = localStorage.getItem(MARKED_KEY)
      return s ? JSON.parse(s) : []
    } catch {
      return []
    }
  })

  const [selectedCharId, setSelectedCharId] = useState<string | null>(null)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [lastMessage, setLastMessage] = useState<string>('')

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-save with debounce
  const triggerSave = useCallback(() => {
    if (!token || !sessionId) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        await saveGameState(token, sessionId, placement, markedClues)
      } catch {
        // Fail silently for auto-saves
      }
    }, 1500)
  }, [token, sessionId, placement, markedClues])

  // Place a character in a location
  const placeCharacter = useCallback((charId: string, locationId: string) => {
    setPlacementState(prev => {
      // Remove char from previous location
      const next: PlacementMap = {}
      for (const [cId, lId] of Object.entries(prev)) {
        if (cId !== charId && lId !== locationId) {
          next[cId] = lId
        }
      }
      next[charId] = locationId
      localStorage.setItem(PLACEMENT_KEY, JSON.stringify(next))
      return next
    })
    setSelectedCharId(null)
  }, [])

  // Remove a character from a location
  const removeCharacter = useCallback((charId: string) => {
    setPlacementState(prev => {
      const next = { ...prev }
      delete next[charId]
      localStorage.setItem(PLACEMENT_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  // Handle tap-select flow
  const selectCharacter = useCallback((charId: string | null) => {
    setSelectedCharId(charId)
  }, [])

  // Handle location tap (for mobile tap-select flow)
  const handleLocationTap = useCallback((locationId: string) => {
    if (selectedCharId) {
      placeCharacter(selectedCharId, locationId)
    }
  }, [selectedCharId, placeCharacter])

  // Toggle clue marked status
  const toggleClue = useCallback((clueId: string) => {
    setMarkedCluesState(prev => {
      const next = prev.includes(clueId)
        ? prev.filter(id => id !== clueId)
        : [...prev, clueId]
      localStorage.setItem(MARKED_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  // Get character at a location
  const getCharAtLocation = useCallback((locationId: string): string | null => {
    for (const [cId, lId] of Object.entries(placement)) {
      if (lId === locationId) return cId
    }
    return null
  }, [placement])

  // Get location for a character
  const getLocationForChar = useCallback((charId: string): string | null => {
    return placement[charId] || null
  }, [placement])

  // Count placed characters
  const placedCount = Object.keys(placement).length

  // Trigger auto-save when placement changes
  useEffect(() => {
    triggerSave()
  }, [placement, markedClues])

  const clearAll = useCallback(() => {
    setPlacementState({})
    setMarkedCluesState([])
    setSelectedCharId(null)
    localStorage.removeItem(PLACEMENT_KEY)
    localStorage.removeItem(MARKED_KEY)
  }, [])

  return {
    placement,
    markedClues,
    selectedCharId,
    submitState,
    lastMessage,
    placedCount,
    placeCharacter,
    removeCharacter,
    selectCharacter,
    handleLocationTap,
    toggleClue,
    getCharAtLocation,
    getLocationForChar,
    setSubmitState,
    setLastMessage,
    clearAll,
  }
}
