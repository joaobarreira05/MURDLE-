import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import type { Clue } from '@/types/game'

interface ClueCardProps {
  clue: Clue
  isMarked: boolean
  index: number
  onToggle: () => void
}

const CATEGORY_COLORS: Record<string, string> = {
  identity: '#D4A843',
  exclusion: '#EF4444',
  position: '#3B82F6',
  adjacency: '#10B981',
}

const CATEGORY_LABELS: Record<string, string> = {
  identity: 'IDENTIDADE',
  exclusion: 'EXCLUSÃO',
  position: 'POSIÇÃO',
  adjacency: 'ADJACÊNCIA',
}

export default function ClueCard({ clue, isMarked, index, onToggle }: ClueCardProps) {
  const color = CATEGORY_COLORS[clue.category] || '#94A3B8'
  const label = CATEGORY_LABELS[clue.category] || clue.category.toUpperCase()

  return (
    <motion.div
      onClick={onToggle}
      className="relative cursor-pointer group transition-all duration-200"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ x: -2 }}
    >
      <div
        className="p-3 transition-all duration-200"
        style={{
          background: isMarked ? 'rgba(16,185,129,0.05)' : 'var(--bg-card)',
          border: isMarked
            ? '1px solid rgba(16,185,129,0.25)'
            : '1px solid var(--border)',
          opacity: isMarked ? 0.6 : 1,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className="font-mono-custom text-[9px] font-bold"
              style={{ color: 'var(--text-muted)' }}
            >
              #{String(index + 1).padStart(2, '0')}
            </span>
            <span
              className="text-[8px] font-mono-custom font-bold tracking-wide px-1.5 py-0.5 rounded"
              style={{
                color,
                background: `${color}15`,
                border: `1px solid ${color}30`,
              }}
            >
              {label}
            </span>
          </div>

          {/* Analyzed toggle */}
          <div
            className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all duration-200"
            style={{
              background: isMarked ? 'rgba(16,185,129,0.15)' : 'transparent',
              border: isMarked ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--border)',
            }}
          >
            {isMarked && <CheckCircle2 size={12} color="var(--accent-green)" />}
          </div>
        </div>

        {/* Clue text */}
        <p
          className="text-xs leading-relaxed"
          style={{
            color: isMarked ? 'var(--text-muted)' : 'var(--text-secondary)',
            textDecoration: isMarked ? 'line-through' : 'none',
            textDecorationColor: 'rgba(100,116,139,0.5)',
          }}
        >
          {clue.text}
        </p>

        {/* Bottom hint */}
        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] font-mono-custom" style={{ color: 'var(--text-muted)' }}>
            {isMarked ? 'clique para desmarcar' : 'clique para marcar como analisada'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
