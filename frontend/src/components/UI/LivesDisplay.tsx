import React from 'react'
import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'

interface LivesDisplayProps {
  current: number
  max: number
}

export default function LivesDisplay({ current, max }: LivesDisplayProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: max }, (_, i) => {
        const isActive = i < current
        return (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Heart
              size={14}
              style={{
                fill: isActive ? 'var(--accent-red)' : 'transparent',
                color: isActive ? 'var(--accent-red)' : 'var(--text-muted)',
                transition: 'all 0.3s ease',
              }}
            />
          </motion.div>
        )
      })}
    </div>
  )
}
