import React from 'react'
import { motion } from 'framer-motion'
import type { Character } from '@/types/game'
import { getAvatarColor } from './CharacterCard'

interface CharacterCardDraggingProps {
  character: Character
}

export default function CharacterCardDragging({ character }: CharacterCardDraggingProps) {
  const color = getAvatarColor(character.id)
  const initials = character.nickname.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <motion.div
      initial={{ scale: 1.05, rotate: 1 }}
      animate={{ scale: 1.08, rotate: 2 }}
      className="flex items-center gap-3 p-3 pointer-events-none"
      style={{
        background: 'var(--bg-card)',
        border: '2px solid var(--accent-gold)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(212,168,67,0.15)',
        minWidth: '180px',
        borderRadius: '2px',
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
        style={{ background: color, boxShadow: `0 0 12px ${color}50` }}
      >
        {initials}
      </div>
      <div>
        <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          {character.nickname}
        </div>
        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {character.name}
        </div>
      </div>
    </motion.div>
  )
}
