import React from 'react'
import { Users } from 'lucide-react'
import type { Character, Location } from '@/types/game'
import CharacterCard from './CharacterCard'

interface CharacterPanelProps {
  characters: Character[]
  placement: Record<string, string>
  selectedCharId: string | null
  onSelectChar: (charId: string | null) => void
  onRemoveChar: (charId: string) => void
  getLocationForChar: (charId: string) => string | null
  locations: Location[]
}

export default function CharacterPanel({
  characters,
  placement,
  selectedCharId,
  onSelectChar,
  onRemoveChar,
  getLocationForChar,
  locations,
}: CharacterPanelProps) {
  const locById = Object.fromEntries(locations.map(l => [l.id, l]))
  const placedCount = Object.keys(placement).length

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <Users size={14} color="var(--accent-gold)" />
          <span className="font-display text-xs tracking-[0.2em]" style={{ color: 'var(--text-primary)' }}>
            SUSPEITOS
          </span>
        </div>
        <span className="font-mono-custom text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {placedCount}/{characters.length}
        </span>
      </div>

      {/* Instruction */}
      <div
        className="px-4 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}
      >
        <p className="text-[10px] font-mono-custom" style={{ color: 'var(--text-muted)' }}>
          Arrasta para o mapa ou toca para selecionar
        </p>
      </div>

      {/* Character list */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {characters.map(char => {
            const locId = getLocationForChar(char.id)
            const location = locId ? locById[locId] : null
            
            let label: string | null = null
            if (locId) {
              if (location) label = location.short_name
              else {
                const parts = locId.split('_')
                if (parts.length === 2) label = `Célula (${parts[0]}, ${parts[1]})`
                else label = locId
              }
            }

            return (
              <CharacterCard
                key={char.id}
                character={char}
                isPlaced={!!locId}
                isSelected={selectedCharId === char.id}
                locationName={label}
                onSelect={() => {
                  if (selectedCharId === char.id) {
                    onSelectChar(null)
                  } else {
                    onSelectChar(char.id)
                  }
                }}
                onRemove={() => onRemoveChar(char.id)}
              />
            )
          })}
        </div>
      </div>

      {/* Progress bar */}
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
              width: `${(placedCount / characters.length) * 100}%`,
              background: placedCount === characters.length
                ? 'var(--accent-gold)'
                : 'var(--accent-blue)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
