import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { X, GripVertical } from 'lucide-react'
import type { Character, Location } from '@/types/game'

interface CharacterCardProps {
  character: Character
  isPlaced: boolean
  isSelected: boolean
  locationName: string | null
  onSelect: () => void
  onRemove: () => void
}

const AVATAR_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6',
]

export function getAvatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export default function CharacterCard({
  character,
  isPlaced,
  isSelected,
  locationName,
  onSelect,
  onRemove,
}: CharacterCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: character.id,
    disabled: false,
  })

  const color = getAvatarColor(character.id)
  const initials = character.nickname.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000,
  } : {}

  if (isDragging) return null

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="relative group cursor-grab active:cursor-grabbing"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onSelect}
      whileHover={{ x: 2 }}
      {...attributes}
      {...listeners}
    >
      <div
        className="flex items-center gap-3 p-2.5 transition-all duration-200"
        style={{
          background: isSelected
            ? 'rgba(59, 130, 246, 0.12)'
            : isPlaced
              ? 'rgba(212, 168, 67, 0.05)'
              : 'var(--bg-card)',
          border: isSelected
            ? '1px solid rgba(59, 130, 246, 0.5)'
            : isPlaced
              ? '1px solid rgba(212, 168, 67, 0.2)'
              : '1px solid var(--border)',
        }}
      >
        {/* Drag handle */}
        <GripVertical
          size={12}
          className="opacity-20 group-hover:opacity-50 flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}
        />

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
          style={{
            background: color,
            boxShadow: `0 0 8px ${color}30`,
            opacity: isPlaced ? 0.7 : 1,
          }}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div
            className="text-xs font-bold truncate"
            style={{ color: isPlaced ? 'var(--text-muted)' : 'var(--text-primary)' }}
          >
            {character.nickname}
          </div>
          <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
            {locationName
              ? <span style={{ color: 'var(--accent-gold)' }}>→ {locationName}</span>
              : character.description
            }
          </div>
        </div>

        {/* Placed indicator / remove button */}
        {isPlaced && (
          <button
            onClick={e => { e.stopPropagation(); onRemove() }}
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--accent-red)' }}
          >
            <X size={10} />
          </button>
        )}
      </div>
    </motion.div>
  )
}
