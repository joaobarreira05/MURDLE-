import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import type { GridCellConfig, Character } from '@/types/game'
import { getAvatarColor } from '@/lib/colors'

interface LocationZoneProps {
  cell: GridCellConfig
  character: Character | null
  selectedCharId: string | null
  onTap: () => void
  onRemove: () => void
}

const OBJECT_ICONS: Record<string, string> = {
  servidor: '🖥️',
  terminal: '⌨️',
  pendrive: '💾',
  gpu: '⚡',
  router: '📶',
  multimetro: '🔌',
  mesa: '🟫',
  tv: '📺',
  cadeira: '🪑',
  tapete: '🧶',
  estante: '📚',
  computador: '💻',
}

const ZONE_COLORS: Record<string, string> = {
  deti: 'rgba(236, 72, 153, 0.2)',
  cua: 'rgba(239, 68, 68, 0.15)',
  biblioteca: 'rgba(59, 130, 246, 0.15)',
  dmat: 'rgba(168, 85, 247, 0.15)',
  comp_pedagogico: 'rgba(99, 102, 241, 0.15)',
  bar: 'rgba(6, 182, 212, 0.15)',
}

const ZONE_BORDERS: Record<string, string> = {
  deti: 'rgba(236, 72, 153, 0.6)',
  cua: 'rgba(239, 68, 68, 0.4)',
  biblioteca: 'rgba(59, 130, 246, 0.4)',
  dmat: 'rgba(168, 85, 247, 0.4)',
  comp_pedagogico: 'rgba(99, 102, 241, 0.4)',
  bar: 'rgba(6, 182, 212, 0.4)',
}

export default function LocationZone({
  cell,
  character,
  selectedCharId,
  onTap,
  onRemove,
}: LocationZoneProps) {
  const isBlocked = cell.terrain === 'blocked'
  
  const { setNodeRef, isOver } = useDroppable({
    id: cell.id,
    disabled: isBlocked,
  })

  const canReceive = selectedCharId !== null && !character && !isBlocked
  const zoneBg = ZONE_COLORS[cell.zone_id] || 'rgba(30, 41, 59, 0.2)'
  const zoneBorder = ZONE_BORDERS[cell.zone_id] || 'rgba(51, 65, 85, 0.4)'

  if (isBlocked) {
    return (
      <div
        className="w-full h-full min-h-[42px] sm:min-h-[50px] bg-slate-950/90 border border-slate-800 flex items-center justify-center pointer-events-none select-none opacity-80"
        title="Parede / Bloqueado"
      >
        <span className="text-slate-700 font-bold text-xs font-mono-custom">✕</span>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      onClick={onTap}
      className={`relative w-full h-full min-h-[42px] sm:min-h-[50px] p-1 border transition-all duration-150 flex flex-col items-center justify-between cursor-pointer select-none ${
        isOver
          ? 'ring-2 ring-amber-400 bg-amber-950/40 z-20'
          : canReceive
          ? 'hover:border-blue-400 bg-blue-950/20'
          : 'hover:border-slate-400'
      }`}
      style={{
        background: isOver ? undefined : zoneBg,
        borderColor: isOver ? undefined : zoneBorder,
      }}
    >
      {/* Object Icon Label (if IT object or carpet) */}
      <div className="w-full flex justify-between items-center text-[9px] font-mono-custom px-0.5 leading-none">
        <span className="text-slate-500 font-semibold">{cell.x},{cell.y}</span>
        {cell.object_type && (
          <span title={cell.object_type} className="text-xs">
            {OBJECT_ICONS[cell.object_type] || '📦'}
          </span>
        )}
        {cell.has_carpet && !cell.object_type && (
          <span title="Tapete" className="text-xs">🧶</span>
        )}
      </div>

      {/* Suspect Token Avatar */}
      <div className="flex-1 w-full flex items-center justify-center my-0.5">
        {character ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="group relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md border-2 border-white/80"
            style={{
              background: getAvatarColor(character.id),
              boxShadow: `0 0 10px ${getAvatarColor(character.id)}60`,
            }}
            title={`${character.nickname} (${cell.x}, ${cell.y})`}
          >
            {character.nickname.slice(0, 2).toUpperCase()}
            {/* Remove button on hover */}
            <button
              onClick={e => { e.stopPropagation(); onRemove() }}
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remover"
            >
              ×
            </button>
          </motion.div>
        ) : canReceive ? (
          <span className="text-blue-400/60 text-xs font-bold animate-pulse">+</span>
        ) : null}
      </div>
    </div>
  )
}
