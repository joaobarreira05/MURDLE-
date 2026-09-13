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

const AVATAR_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6',
]

const getAvatarColor = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export default function LocationZone({
  location,
  character,
  isDragOver,
  selectedCharId,
  onTap,
}: LocationZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: location.id })

  const isHighlighted = isDragOver || isOver
  const canReceive = selectedCharId !== null && !character
  const isCrimeScene = location.id === 'labs_deti'

  return (
    <motion.div
      ref={setNodeRef}
      onClick={onTap}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group select-none"
      style={{
        left: `${location.map_x}%`,
        top: `${location.map_y}%`,
      }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
    >
      {/* Room Tile Card (Murdle Floorplan Style) */}
      <div
        className={`relative min-w-[75px] sm:min-w-[95px] p-2 rounded-xl border-2 transition-all duration-200 shadow-md flex flex-col items-center justify-center ${
          character
            ? 'bg-slate-900/90 border-emerald-500 shadow-emerald-950/50'
            : isCrimeScene
            ? 'bg-red-950/40 border-red-500/80 shadow-red-950/50'
            : isHighlighted
            ? 'bg-amber-950/50 border-amber-400'
            : canReceive
            ? 'bg-blue-950/40 border-blue-400 border-dashed'
            : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-500'
        }`}
      >
        {/* Crime Scene Ribbon / Badge */}
        {isCrimeScene && (
          <div className="absolute -top-2 px-1.5 py-0.5 rounded bg-red-600 text-white font-mono-custom text-[8px] font-bold tracking-wider uppercase shadow">
            ⚠️ CRIME SCENE
          </div>
        )}

        {/* Room Icon & Name */}
        <div className="flex items-center gap-1 mb-1 text-[10px] sm:text-xs font-bold text-slate-200">
          <span>{location.icon || '📍'}</span>
          <span className="truncate font-mono-custom max-w-[70px] sm:max-w-[85px] uppercase tracking-wide">
            {location.short_name}
          </span>
        </div>

        {/* Suspect Token OR Empty Drop Target */}
        <div className="mt-1 flex items-center justify-center">
          {character ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 350 }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white shadow"
              style={{
                background: getAvatarColor(character.id),
                boxShadow: `0 0 10px ${getAvatarColor(character.id)}60`,
              }}
            >
              <span className="w-2 h-2 rounded-full bg-white shrink-0" />
              <span>{character.nickname}</span>
            </motion.div>
          ) : (
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                isHighlighted
                  ? 'border-amber-400 text-amber-400 bg-amber-900/40'
                  : canReceive
                  ? 'border-blue-400 text-blue-400 bg-blue-900/30 animate-pulse'
                  : 'border-slate-600 text-slate-500 bg-slate-800/50'
              }`}
            >
              +
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
