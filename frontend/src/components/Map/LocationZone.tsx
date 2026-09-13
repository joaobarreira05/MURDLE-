import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import type { GridCellConfig, Character } from '@/types/game'
import { getAvatarColor } from '@/lib/colors'

interface LocationZoneProps {
  cell: GridCellConfig
  character: Character | null
  selectedCharId: string | null
  isSurroundingExcluded: boolean
  isManualExcluded: boolean
  onTap: () => void
  onToggleExclude: () => void
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
  autocarro_bar: 'rgba(6, 182, 212, 0.45)',
  deti: 'rgba(59, 130, 246, 0.45)',
  biblioteca: 'rgba(99, 102, 241, 0.45)',
  cua: 'rgba(239, 68, 68, 0.45)',
  praca: 'rgba(16, 185, 129, 0.45)',
  drinks: 'rgba(245, 158, 11, 0.45)',
  desconhecido: 'rgba(190, 24, 93, 0.75)',
}

const ZONE_WATERMARKS: Record<string, string> = {
  autocarro_bar: '🚌',
  deti: '🖥️',
  biblioteca: '📚',
  cua: '🍽️',
  praca: '🌿',
  drinks: '🍸',
  desconhecido: '⚠️',
}

export default function LocationZone({
  cell,
  character,
  selectedCharId,
  isSurroundingExcluded,
  isManualExcluded,
  onTap,
  onToggleExclude,
  onRemove,
}: LocationZoneProps) {
  const isBlocked = cell.terrain === 'blocked'
  const isMystery = cell.zone_id === 'desconhecido'
  
  const { setNodeRef, isOver } = useDroppable({
    id: cell.id,
    disabled: isBlocked || isSurroundingExcluded,
  })

  const canReceive = selectedCharId !== null && !character && !isBlocked && !isSurroundingExcluded
  const zoneBg = ZONE_COLORS[cell.zone_id] || 'rgba(30, 41, 59, 0.2)'
  const zoneBorder = isSurroundingExcluded 
    ? 'rgba(239, 68, 68, 0.35)' 
    : (ZONE_BORDERS[cell.zone_id] || 'rgba(51, 65, 85, 0.4)')

  if (isBlocked) {
    return (
      <div
        className="w-full h-full min-h-[46px] sm:min-h-[54px] bg-slate-950 border border-slate-800/80 flex items-center justify-center pointer-events-none select-none opacity-85 rounded-[3px]"
        title="Parede / Bloqueado"
      >
        <span className="text-slate-600 font-bold text-sm font-mono-custom">✕</span>
      </div>
    )
  }

  const showX = (isSurroundingExcluded || isManualExcluded) && !character

  return (
    <div
      ref={setNodeRef}
      onClick={onTap}
      onContextMenu={e => {
        e.preventDefault()
        onToggleExclude()
      }}
      className={`relative w-full h-full min-h-[46px] sm:min-h-[54px] p-1 border transition-all duration-150 flex flex-col items-center justify-between cursor-pointer select-none rounded-[3px] overflow-hidden ${
        isOver
          ? 'ring-2 ring-amber-400 bg-amber-950/50 z-20 shadow-lg'
          : canReceive
          ? 'hover:border-blue-400 bg-blue-950/20 shadow-sm'
          : isSurroundingExcluded
          ? 'bg-red-950/15 border-red-900/40 cursor-not-allowed'
          : isMystery
          ? 'hover:border-pink-500'
          : 'hover:border-slate-400'
      }`}
      style={{
        background: isOver ? undefined : zoneBg,
        borderColor: isOver ? undefined : zoneBorder,
      }}
    >
      {/* Top Coordinate & Item Badge */}
      <div className="w-full flex justify-between items-center text-[9px] font-mono-custom px-0.5 leading-none z-10">
        <span className="text-slate-400 font-semibold">{cell.x},{cell.y}</span>
        {cell.object_type && (
          <span title={cell.object_type} className="text-xs filter drop-shadow">
            {OBJECT_ICONS[cell.object_type] || '📦'}
          </span>
        )}
        {cell.has_carpet && !cell.object_type && (
          <span title="Tapete de Comando da Faina" className="text-xs">🧶</span>
        )}
        {isMystery && !cell.object_type && (
          <span title="Cena do Crime (DESCONHECIDO)" className="text-[10px] text-pink-400 font-bold animate-pulse">❓</span>
        )}
      </div>

      {/* Subtle Room Watermark in Background */}
      {!cell.object_type && !cell.has_carpet && !character && (
        <span className="absolute bottom-0.5 right-1 text-[11px] opacity-20 pointer-events-none select-none filter grayscale">
          {ZONE_WATERMARKS[cell.zone_id] || ''}
        </span>
      )}

      {/* Center Avatar OR Auto-X Surrounding Marker */}
      <div className="flex-1 w-full flex items-center justify-center my-0.5 relative z-10">
        {character ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="group relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/90 z-20"
            style={{
              background: getAvatarColor(character.id),
              boxShadow: `0 0 12px ${getAvatarColor(character.id)}80`,
            }}
            title={`${character.nickname} (${cell.x}, ${cell.y})`}
          >
            {character.nickname.slice(0, 2).toUpperCase()}
            {/* Quick Remove Button */}
            <button
              onClick={e => { e.stopPropagation(); onRemove() }}
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition-opacity shadow"
              title="Remover"
            >
              ×
            </button>
          </motion.div>
        ) : showX ? (
          /* Auto 'X' around placed suspect or manual deduction X */
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`font-mono-custom font-bold select-none ${
              isManualExcluded
                ? 'text-red-500 text-sm drop-shadow'
                : 'text-red-400/80 text-xs'
            }`}
            title={isManualExcluded ? 'Excluído manualmente (clica com botão direito para remover)' : 'Excluído: Linha ou coluna de suspeito colocado'}
          >
            ✕
          </motion.div>
        ) : canReceive ? (
          <span className="text-blue-400/70 text-xs font-bold animate-pulse">+</span>
        ) : null}
      </div>
    </div>
  )
}
