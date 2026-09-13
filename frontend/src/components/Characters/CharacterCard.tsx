import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { X, GripVertical, MapPin } from 'lucide-react'
import type { Character } from '@/types/game'
import { getAvatarColor } from '@/lib/colors'

interface CharacterCardProps {
  character: Character
  isPlaced: boolean
  isSelected: boolean
  locationName: string | null
  onSelect: () => void
  onRemove: () => void
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
  const initials = character.nickname.slice(0, 2).toUpperCase()

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000,
  } : {}

  if (isDragging) return null

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="relative group cursor-grab active:cursor-grabbing p-1.5"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onSelect}
      whileHover={{ scale: 1.01 }}
      {...attributes}
      {...listeners}
    >
      <div
        className="rounded-lg p-2.5 transition-all duration-200 shadow-sm flex flex-col gap-1.5 relative overflow-hidden"
        style={{
          background: isSelected
            ? 'rgba(59, 130, 246, 0.15)'
            : isPlaced
              ? 'rgba(16, 185, 129, 0.08)'
              : '#0D1428',
          border: isSelected
            ? '1.5px solid #3B82F6'
            : isPlaced
              ? '1.5px solid #10B981'
              : '1px solid var(--border)',
        }}
      >
        {/* Top Header */}
        <div className="flex items-center gap-2">
          <GripVertical
            size={12}
            className="opacity-30 group-hover:opacity-70 flex-shrink-0 text-gray-400"
          />

          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white shadow-inner"
            style={{
              background: color,
              border: `2px solid ${color}`,
            }}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[var(--text-primary)] truncate">
              {character.nickname}
            </div>
            {locationName ? (
              <div className="text-[10px] font-mono-custom text-emerald-400 flex items-center gap-1 font-semibold truncate">
                <MapPin size={9} />
                {locationName}
              </div>
            ) : (
              <div className="text-[10px] text-[var(--text-muted)] truncate">
                {character.description}
              </div>
            )}
          </div>

          {isPlaced && (
            <button
              onClick={e => { e.stopPropagation(); onRemove() }}
              className="flex-shrink-0 text-red-400 hover:text-red-300 hover:bg-red-950/40 p-1 rounded transition-colors"
              title="Remover do mapa"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Murdle Clue Bubble */}
        {character.clue_hint && (
          <div className="mt-0.5 p-1.5 bg-black/40 rounded border border-white/5 text-[10px] leading-tight text-gray-300 font-mono-custom italic">
            "{character.clue_hint}"
          </div>
        )}
      </div>
    </motion.div>
  )
}
