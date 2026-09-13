import React, { useState } from 'react'
import { FileText, ChevronDown, ChevronUp } from 'lucide-react'
import type { Clue } from '@/types/game'
import ClueCard from './ClueCard'

interface DossierPanelProps {
  clues: Clue[]
  markedClues: string[]
  onToggleClue: (clueId: string) => void
}

export default function DossierPanel({ clues, markedClues, onToggleClue }: DossierPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const analyzedCount = markedClues.length

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between flex-shrink-0 cursor-pointer lg:cursor-default"
        style={{ borderBottom: '1px solid var(--border)' }}
        onClick={() => setIsCollapsed(v => !v)}
      >
        <div className="flex items-center gap-2">
          <FileText size={14} color="var(--accent-gold)" />
          <span className="font-display text-xs tracking-[0.2em]" style={{ color: 'var(--text-primary)' }}>
            DOSSIÊ DE INVESTIGAÇÃO
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono-custom text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {analyzedCount}/{clues.length} analisadas
          </span>
          <div className="lg:hidden">
            {isCollapsed
              ? <ChevronDown size={14} color="var(--text-muted)" />
              : <ChevronUp size={14} color="var(--text-muted)" />
            }
          </div>
        </div>
      </div>

      {/* Hint */}
      {!isCollapsed && (
        <div
          className="px-4 py-2 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}
        >
          <p className="text-[10px] font-mono-custom" style={{ color: 'var(--text-muted)' }}>
            Clique para marcar pistas como analisadas
          </p>
        </div>
      )}

      {/* Clue list */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-0">
            {clues.map((clue, i) => (
              <ClueCard
                key={clue.id}
                clue={clue}
                isMarked={markedClues.includes(clue.id)}
                index={i}
                onToggle={() => onToggleClue(clue.id)}
              />
            ))}
          </div>

          {/* Padding at bottom */}
          <div className="h-4" />
        </div>
      )}

      {/* Progress bar */}
      {!isCollapsed && (
        <div
          className="px-4 py-3 flex-shrink-0"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div
            className="h-1 w-full rounded-full overflow-hidden"
            style={{ background: 'var(--border)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(analyzedCount / clues.length) * 100}%`,
                background: 'var(--accent-green)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
