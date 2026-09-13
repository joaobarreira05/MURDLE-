import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Grid, RotateCcw } from 'lucide-react'
import type { Character, Location } from '@/types/game'
import { sounds } from '@/lib/sounds'

type CellState = 'empty' | 'x' | 'check'

interface GridState {
  [key: string]: CellState // "charId:locId" -> CellState
}

interface DeductionGridProps {
  characters: Character[]
  locations: Location[]
  placement: Record<string, string>
  onPlaceCharacter: (charId: string, locationId: string) => void
  onRemoveCharacter: (charId: string) => void
}

const STORAGE_GRID_KEY = 'murdoku_grid_matrix'

export default function DeductionGrid({
  characters,
  locations,
  placement,
  onPlaceCharacter,
  onRemoveCharacter,
}: DeductionGridProps) {
  const [grid, setGrid] = useState<GridState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_GRID_KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return {}
  })

  // Keep grid synced with placement from map
  useEffect(() => {
    setGrid(prev => {
      const next = { ...prev }
      let changed = false

      characters.forEach(char => {
        const placedLoc = placement[char.id]
        locations.forEach(loc => {
          const key = `${char.id}:${loc.id}`
          const isTargetPlaced = placedLoc === loc.id
          if (isTargetPlaced) {
            if (next[key] !== 'check') {
              next[key] = 'check'
              changed = true
            }
          }
        })
      })

      if (changed) {
        localStorage.setItem(STORAGE_GRID_KEY, JSON.stringify(next))
        return next
      }
      return prev
    })
  }, [placement, characters, locations])

  const getCellState = (charId: string, locId: string): CellState => {
    return grid[`${charId}:${locId}`] || 'empty'
  }

  const handleCellClick = (charId: string, locId: string) => {
    const key = `${charId}:${locId}`
    const currentState = getCellState(charId, locId)

    const nextGrid = { ...grid }

    if (currentState === 'empty') {
      // Cycle to X
      nextGrid[key] = 'x'
      sounds.click()
    } else if (currentState === 'x') {
      // Cycle to CHECK ✓ (Auto-fill X in row and column!)
      nextGrid[key] = 'check'

      // Auto-fill X in row (for other locations of this character)
      locations.forEach(l => {
        if (l.id !== locId) {
          nextGrid[`${charId}:${l.id}`] = 'x'
        }
      })

      // Auto-fill X in column (for other characters in this location)
      characters.forEach(c => {
        if (c.id !== charId) {
          nextGrid[`${c.id}:${locId}`] = 'x'
        }
      })

      // Update game placement
      onPlaceCharacter(charId, locId)
      sounds.success()
    } else {
      // Cycle back to empty
      delete nextGrid[key]

      // If this character was placed here, remove from placement
      if (placement[charId] === locId) {
        onRemoveCharacter(charId)
      }
      sounds.click()
    }

    setGrid(nextGrid)
    localStorage.setItem(STORAGE_GRID_KEY, JSON.stringify(nextGrid))
  }

  const handleResetGrid = () => {
    setGrid({})
    localStorage.removeItem(STORAGE_GRID_KEY)
    characters.forEach(c => onRemoveCharacter(c.id))
    sounds.click()
  }

  return (
    <div className="flex flex-col h-full bg-[#080C18] p-3 sm:p-4 rounded-lg border border-[var(--border)]">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Grid size={16} className="text-[var(--accent-gold)]" />
          <span className="font-display text-xs tracking-widest text-[var(--text-primary)]">
            CADERNO DE DEDUÇÃO (GRELHA MURDLE)
          </span>
        </div>
        <button
          onClick={handleResetGrid}
          className="flex items-center gap-1 text-[11px] font-mono-custom text-[var(--text-muted)] hover:text-red-400 transition-colors"
          title="Limpar Grelha"
        >
          <RotateCcw size={12} />
          Limpar
        </button>
      </div>

      {/* Tip Banner */}
      <div className="mb-3 p-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded text-[11px] font-mono-custom text-[var(--text-secondary)]">
        💡 <strong className="text-[var(--accent-gold)]">Dica Murdle:</strong> Toca numa célula para alternar [ Vazio → <span className="text-red-400">X</span> → <span className="text-emerald-400">✓</span> ]. Ao marcar <span className="text-emerald-400">✓</span>, a linha e a coluna são preenchidas com <span className="text-red-400">X</span> automaticamente!
      </div>

      {/* Scrollable Matrix Table */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-center border-collapse text-xs font-mono-custom">
          <thead>
            <tr>
              <th className="p-2 border border-[var(--border)] bg-[#0D1428] sticky top-0 left-0 z-20 min-w-[100px] text-left text-[var(--accent-gold)]">
                Suspeito / Local
              </th>
              {locations.map(loc => (
                <th
                  key={loc.id}
                  className="p-1 sm:p-2 border border-[var(--border)] bg-[#0D1428] sticky top-0 z-10 min-w-[65px] sm:min-w-[80px] text-[10px] sm:text-xs text-[var(--text-secondary)] font-medium"
                  title={loc.name}
                >
                  <div className="truncate max-w-[75px]">{loc.short_name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {characters.map(char => (
              <tr key={char.id} className="hover:bg-white/5 transition-colors">
                {/* Character Label */}
                <td className="p-2 border border-[var(--border)] bg-[#0D1428] sticky left-0 z-10 text-left font-semibold text-[var(--text-primary)]">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-gold)] shrink-0" />
                    <span className="truncate">{char.nickname}</span>
                  </div>
                </td>

                {/* Location Grid Cells */}
                {locations.map(loc => {
                  const state = getCellState(char.id, loc.id)
                  const isConfirmed = state === 'check'
                  const isExcluded = state === 'x'

                  return (
                    <td
                      key={loc.id}
                      onClick={() => handleCellClick(char.id, loc.id)}
                      className={`p-0 border border-[var(--border)] cursor-pointer select-none transition-all duration-150 h-10 sm:h-11 ${
                        isConfirmed
                          ? 'bg-emerald-950/40 text-emerald-400 font-bold'
                          : isExcluded
                          ? 'bg-red-950/20 text-red-400/70'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        {isConfirmed && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                          >
                            <Check size={18} className="text-emerald-400 stroke-[3]" />
                          </motion.div>
                        )}
                        {isExcluded && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <X size={14} className="text-red-400/60 stroke-[2.5]" />
                          </motion.div>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
