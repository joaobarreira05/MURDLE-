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
  cd: '💿',
  tshirt_aluviao: '👕',
  computador: '💻',
  boxer: '🩲',
  caneca: '🍺',
  garrafa: '🍾',
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
}

const ZONE_COLORS: Record<string, string> = {
  autocarro_bar: 'rgba(6, 182, 212, 0.18)',
  deti: 'rgba(59, 130, 246, 0.18)',
  biblioteca: 'rgba(99, 102, 241, 0.18)',
  cua: 'rgba(239, 68, 68, 0.18)',
  praca: 'rgba(16, 185, 129, 0.18)',
  drinks: 'rgba(245, 158, 11, 0.18)',
  desconhecido: 'rgba(190, 24, 93, 0.28)',
}

const ZONE_BORDERS: Record<string, string> = {
  autocarro_bar: 'rgba(6, 182, 212, 0.5)',
  deti: 'rgba(59, 130, 246, 0.5)',
  biblioteca: 'rgba(99, 102, 241, 0.5)',
  cua: 'rgba(239, 68, 68, 0.5)',
  praca: 'rgba(16, 185, 129, 0.5)',
  drinks: 'rgba(245, 158, 11, 0.5)',
  desconhecido: 'rgba(190, 24, 93, 0.8)',
}

export default function LocationZone({
  cell,
  character,
  selectedCharId,
  onTap,
  onRemove,
}: LocationZoneProps) {
  const isBlocked = cell.terrain === 'blocked'
  const isMystery = cell.zone_id === 'desconhecido'
  
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
          : isMystery
          ? 'hover:border-pink-500 animate-pulse-slow'
          : 'hover:border-slate-400'
      }`}
      style={{
        background: isOver ? undefined : zoneBg,
        borderColor: isOver ? undefined : zoneBorder,
      }}
    >
      {/* Object Icon Label (if object or carpet) */}
      <div className="w-full flex justify-between items-center text-[9px] font-mono-custom px-0.5 leading-none">
        <span className="text-slate-400 font-semibold">{cell.x},{cell.y}</span>
        {cell.object_type && (
          <span title={cell.object_type} className="text-xs">
            {OBJECT_ICONS[cell.object_type] || '📦'}
          </span>
        )}
        {cell.has_carpet && !cell.object_type && (
          <span title="Tapete" className="text-xs">🧶</span>
        )}
        {isMystery && !cell.object_type && (
          <span title="Cena do Crime" className="text-[10px] text-pink-400 font-bold">❓</span>
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
