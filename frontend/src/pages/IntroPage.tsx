import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface IntroPageProps {
  onStart: () => void
}

const NARRATIVE_BEATS = [
  { text: '23:47 — UNIVERSIDADE DE AVEIRO', isTime: true },
  { text: 'Um crime perturbou a Faina do DETI.', isTime: false },
  { text: 'Os Aluviões foram atacados durante a noite.', isTime: false },
  { text: 'Onze membros da Comissão de Faina foram vistos espalhados pelo campus da UA.', isTime: false },
  { text: 'Entre eles está o responsável: Varela.', isTime: false },
  { text: 'Usa o Caderno de Dedução e as pistas para posicionar cada suspeito.', isTime: false },
  { text: 'RECONSTRUIR OS ACONTECIMENTOS.', isTime: false, isAccent: true },
]

export default function IntroPage({ onStart }: IntroPageProps) {
  const [currentBeat, setCurrentBeat] = useState(0)
  const [showButton, setShowButton] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const timings = [0, 800, 1600, 2400, 3200, 4000, 5000]

    const timers = timings.map((delay, i) =>
      setTimeout(() => setCurrentBeat(i + 1), delay)
    )

    const buttonTimer = setTimeout(() => setShowButton(true), 6200)
    timers.push(buttonTimer)

    return () => timers.forEach(clearTimeout)
  }, [])

  const handleStart = async () => {
    setLoading(true)
    await onStart()
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative"
      style={{ background: '#080C18' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      <div className="relative z-10 max-w-lg w-full text-center space-y-6">
        {NARRATIVE_BEATS.map((beat, i) => (
          <AnimatePresence key={i}>
            {currentBeat > i && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                {beat.isTime ? (
                  <div
                    className="font-mono-custom text-2xl sm:text-3xl font-bold tracking-widest mb-2 text-[var(--accent-gold)]"
                  >
                    {beat.text}
                  </div>
                ) : beat.isAccent ? (
                  <div
                    className="font-display text-2xl tracking-widest mt-4 text-[var(--accent-gold)]"
                  >
                    {beat.text}
                  </div>
                ) : (
                  <p
                    className="text-base leading-relaxed text-[var(--text-secondary)]"
                  >
                    {beat.text}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        ))}

        {/* CTA */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="pt-8"
            >
              <motion.button
                onClick={handleStart}
                disabled={loading}
                className="px-10 py-4 font-display text-sm tracking-[0.2em] border disabled:opacity-50"
                style={{
                  borderColor: 'var(--accent-gold)',
                  color: 'var(--accent-gold)',
                  background: 'transparent',
                }}
                whileHover={{ scale: 1.02, background: 'rgba(212,168,67,0.08)' }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin" />
                    A ABRIR O CASO...
                  </span>
                ) : (
                  'INICIAR INVESTIGAÇÃO →'
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip button */}
      {!showButton && (
        <button
          onClick={() => {
            setCurrentBeat(NARRATIVE_BEATS.length)
            setShowButton(true)
          }}
          className="absolute bottom-8 right-8 text-xs font-mono-custom opacity-30 hover:opacity-60 transition-opacity text-[var(--text-muted)]"
        >
          saltar →
        </button>
      )}
    </motion.div>
  )
}
