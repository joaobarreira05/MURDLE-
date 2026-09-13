import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface LandingPageProps {
  onEnter: () => void
}

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  duration: Math.random() * 8 + 4,
  delay: Math.random() * 4,
}))

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [typedText, setTypedText] = useState('')
  const fullText = 'UM CASO FOI ABERTO.'

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i))
        i++
      } else {
        clearInterval(interval)
      }
    }, 60)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #080C18 0%, #0D1428 50%, #080C18 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background particles */}
      {PARTICLES.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: 'rgba(212, 168, 67, 0.4)',
          }}
          animate={{
            opacity: [0, 0.8, 0],
            y: [0, -30, -60],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Scanline overlay */}
      <div className="absolute inset-0 scanline pointer-events-none" />

      {/* Top decorative line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent, #D4A843, transparent)' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
      />

      {/* Bottom decorative line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent, #D4A843, transparent)' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
      />

      {/* Corner decorations */}
      {[
        'top-4 left-4 border-t border-l',
        'top-4 right-4 border-t border-r',
        'bottom-4 left-4 border-b border-l',
        'bottom-4 right-4 border-b border-r',
      ].map((cls, i) => (
        <motion.div
          key={i}
          className={`absolute w-8 h-8 ${cls}`}
          style={{ borderColor: 'rgba(212, 168, 67, 0.3)' }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + i * 0.1 }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Case file header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-[1px] w-12" style={{ background: 'var(--accent-gold)' }} />
            <span className="font-mono-custom text-xs tracking-[0.3em]" style={{ color: 'var(--accent-gold)' }}>
              DOSSIER CLASSIFICADO
            </span>
            <div className="h-[1px] w-12" style={{ background: 'var(--accent-gold)' }} />
          </div>

          <div
            className="text-xs font-mono-custom tracking-[0.4em] mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            CASE FILE
          </div>
          <div
            className="font-mono-custom text-5xl font-bold tracking-[0.1em]"
            style={{ color: 'var(--accent-gold)' }}
          >
            #026
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <h1 className="font-display text-5xl sm:text-7xl mb-3" style={{ color: 'var(--text-primary)' }}>
            MURDOKU
          </h1>
          <div
            className="text-sm tracking-[0.3em] font-mono-custom"
            style={{ color: 'var(--text-secondary)' }}
          >
            FAINA DETI — UA 2026/27
          </div>
        </motion.div>

        {/* Separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="my-8 h-[1px] mx-auto max-w-xs"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.4), transparent)' }}
        />

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mb-10 space-y-3"
        >
          <p className="text-lg font-mono-custom" style={{ color: 'var(--text-secondary)' }}>
            {typedText}
            <span className="animate-blink" style={{ color: 'var(--accent-gold)' }}>|</span>
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="space-y-1"
          >
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Onze pessoas. Onze locais. Uma única verdade.
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              O Estandarte da Faina desapareceu.
            </p>
          </motion.div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <motion.button
            onClick={onEnter}
            className="relative px-10 py-4 font-display text-sm tracking-[0.2em] transition-all duration-300 group"
            style={{
              background: 'transparent',
              border: '1px solid var(--accent-gold)',
              color: 'var(--accent-gold)',
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="relative z-10">ENTRAR NO CASO</span>
            {/* Hover fill */}
            <motion.div
              className="absolute inset-0 -z-0"
              style={{ background: 'rgba(212, 168, 67, 0.08)' }}
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            />
          </motion.button>
        </motion.div>

        {/* Bottom stamp */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-12"
        >
          <div className="stamp-classified">ACESSO RESTRITO</div>
        </motion.div>
      </div>

      {/* Bottom tagline */}
      <motion.div
        className="absolute bottom-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <p className="font-mono-custom text-xs tracking-widest" style={{ color: 'var(--text-muted)' }}>
          UNIVERSIDADE DE AVEIRO — DETI — CF 26/27
        </p>
      </motion.div>
    </motion.div>
  )
}
