import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import type { Location, Character } from '@/types/game'

interface LocationZoneProps {
  location: Location
  character: Character | null
  isSelected: boolean
  isDragOver: boolean
  selectedCharId: string | null
  onTap: () => void
  onRemove: () => void
}

export default function LocationZone({
  location,
  character,
  isSelected,
  isDragOver,
  selectedCharId,
  onTap,
  onRemove,
}: LocationZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: location.id })

  const isHighlighted = isDragOver || isOver
  const canReceive = selectedCharId !== null && !character

  // Avatar colors based on character id
  const avatarColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6',
  ]

  const getAvatarColor = (id: string) => {
    let hash = 0
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash)
    }
    return avatarColors[Math.abs(hash) % avatarColors.length]
  }

  return (
    <motion.div
      ref={setNodeRef}
      onClick={onTap}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      style={{
        left: `${location.map_x}%`,
        top: `${location.map_y}%`,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Zone marker */}
      <div className="relative">
        {/* Drop zone indicator */}
        <motion.div
          className="absolute inset-0 rounded-full -m-2"
          animate={{
            opacity: isHighlighted || canReceive ? 1 : 0,
            scale: isHighlighted ? 1.3 : 1,
          }}
          style={{
            background: isHighlighted
              ? 'rgba(212, 168, 67, 0.25)'
              : 'rgba(59, 130, 246, 0.15)',
            border: isHighlighted
              ? '2px solid rgba(212, 168, 67, 0.6)'
              : '2px dashed rgba(59, 130, 246, 0.4)',
          }}
        />

        {/* Character avatar or empty marker */}
        <div
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200"
          style={{
            background: character
              ? getAvatarColor(character.id)
              : isHighlighted
                ? 'rgba(212, 168, 67, 0.2)'
                : 'rgba(13, 18, 33, 0.9)',
            border: character
              ? `2px solid ${getAvatarColor(character.id)}`
              : isHighlighted
                ? '2px solid var(--accent-gold)'
                : '2px solid var(--border-bright)',
            boxShadow: character
              ? `0 0 12px ${getAvatarColor(character.id)}40`
              : 'none',
          }}
        >
          {character ? (
            <div className="relative">
              <span className="text-white text-[10px] font-bold leading-none select-none">
                {character.nickname.slice(0, 2).toUpperCase()}
              </span>
              {/* Remove button */}
              <button
                onClick={e => { e.stopPropagation(); onRemove() }}
                className="absolute -top-3 -right-3 w-4 h-4 rounded-full flex items-center justify-center text-[8px] opacity-0 hover:opacity-100 transition-opacity"
                style={{ background: 'var(--accent-red)', color: 'white' }}
              >
                ×
              </button>
            </div>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>+</span>
          )}
        </div>

        {/* Location label */}
        <div
          className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap"
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="text-[9px] font-mono-custom tracking-wide px-1.5 py-0.5 rounded"
            style={{
              background: 'rgba(8,12,24,0.85)',
              color: character ? 'var(--accent-gold)' : 'var(--text-muted)',
              border: `1px solid ${character ? 'rgba(212,168,67,0.3)' : 'var(--border)'}`,
              backdropFilter: 'blur(4px)',
            }}
          >
            {location.short_name}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
