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
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                {character.nickname}
              </span>
              {character.role === 'aluviao' ? (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-pink-900/60 text-pink-300 border border-pink-700">
                  🎯 VÍTIMA
                </span>
              ) : (
                <span className="text-[9px] px-1 py-0.2 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40">
                  COMISSÃO
                </span>
              )}
            </div>

            {locationName ? (
              <div className="text-[10px] font-mono-custom text-emerald-400 flex items-center gap-1 font-semibold truncate mt-0.5">
                <MapPin size={9} />
                {locationName}
              </div>
            ) : (
              <div className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                {character.description}
              </div>
            )}

            {/* Trait badges for logical deduction */}
            {character.traits && (
              <div className="flex flex-wrap gap-1 mt-1">
                {character.traits.split(',').map((trait, idx) => {
                  const t = trait.trim()
                  if (t.toLowerCase().includes('líder')) return null
                  const isBeard = t.toLowerCase().includes('barba') && !t.toLowerCase().includes('sem barba')
                  const isGlasses = t.toLowerCase().includes('óculos') && !t.toLowerCase().includes('sem óculos')
                  const isVictim = t.toLowerCase().includes('vítima') || t.toLowerCase().includes('caloiro')
                  return (
                    <span
                      key={idx}
                      className={`text-[9px] font-mono-custom px-1.5 py-0.5 rounded border ${
                        isBeard
                          ? 'bg-amber-950/40 border-amber-600/50 text-amber-300'
                          : isGlasses
                          ? 'bg-cyan-950/40 border-cyan-600/50 text-cyan-300'
                          : isVictim
                          ? 'bg-red-950/50 border-red-500/50 text-red-300 font-bold'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300'
                      }`}
                    >
                      {isBeard ? '🧔 ' : isGlasses ? '👓 ' : ''}{t}
                    </span>
                  )
                })}
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
      </div>
    </motion.div>
  )
}
