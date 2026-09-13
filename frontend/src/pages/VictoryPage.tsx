import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation } from 'lucide-react'
import type { Reward } from '@/types/game'

interface VictoryPageProps {
  reward: Reward | null
  onRestart: () => void
}

const CONFETTI_ITEMS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  color: ['#D4A843', '#3B82F6', '#10B981', '#F1F5F9'][Math.floor(Math.random() * 4)],
  delay: Math.random() * 2,
  duration: Math.random() * 3 + 2,
}))

export default function VictoryPage({ reward, onRestart }: VictoryPageProps) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500)
    const t2 = setTimeout(() => setPhase(2), 1500)
    const t3 = setTimeout(() => setPhase(3), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: '#080C18' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Confetti */}
      {CONFETTI_ITEMS.map(item => (
        <motion.div
          key={item.id}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${item.x}%`,
            top: '-10px',
            background: item.color,
          }}
          animate={{
            y: ['0vh', '110vh'],
            rotate: [0, 720],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            ease: 'easeIn',
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 text-center max-w-lg w-full space-y-8">
        {/* Victory stamp */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={phase >= 1 ? { scale: 1, rotate: -8 } : {}}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <div className="stamp-solved text-4xl mx-auto inline-block">
            CASO RESOLVIDO
          </div>
        </motion.div>

        {/* Message */}
        {phase >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h1 className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>
              A investigação terminou.
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Mas a vossa jornada ainda não.
            </p>
          </motion.div>
        )}

        {/* Reward */}
        {phase >= 3 && reward && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="border p-6 relative"
            style={{
              borderColor: 'var(--accent-gold)',
              background: 'rgba(212, 168, 67, 0.05)',
            }}
          >
            {/* Glow effect */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: '0 0 40px rgba(212, 168, 67, 0.1), inset 0 0 40px rgba(212, 168, 67, 0.03)',
              }}
            />

            <div className="relative">
              <div
                className="text-xs font-mono-custom tracking-[0.3em] mb-4"
                style={{ color: 'var(--accent-gold)' }}
              >
                {reward.title}
              </div>

              {reward.type === 'coordinates' && (
                <div className="flex flex-col items-center gap-3">
                  <Navigation size={24} color="var(--accent-gold)" />
                  <div
                    className="font-mono-custom text-2xl font-bold tracking-wider"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {reward.content}
                  </div>
                </div>
              )}

              {reward.type === 'text' && (
                <div
                  className="font-display text-xl"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {reward.content}
                </div>
              )}

              {reward.subtitle && (
                <div
                  className="mt-4 text-sm font-mono-custom whitespace-pre-line"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {reward.subtitle}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Restart */}
        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={onRestart}
              className="text-xs font-mono-custom opacity-30 hover:opacity-60 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            >
              voltar ao início
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
