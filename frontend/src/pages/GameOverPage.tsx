import React from 'react'
import { motion } from 'framer-motion'
import { XCircle } from 'lucide-react'

interface GameOverPageProps {
  onRestart: () => void
}

const MESSAGES = [
  'Conseguiram falhar uma investigação com onze pessoas e onze locais.',
  'Impressionante.',
  'O Estandarte vai continuar desaparecido.',
  'E a vossa dignidade também.',
]

export default function GameOverPage({ onRestart }: GameOverPageProps) {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative"
      style={{ background: '#080C18' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Red vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(239,68,68,0.08) 100%)',
        }}
      />

      <div className="relative z-10 text-center max-w-lg w-full space-y-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          <XCircle size={48} color="var(--accent-red)" className="mx-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div
            className="font-mono-custom text-xs tracking-[0.4em] mb-4"
            style={{ color: 'var(--accent-red)' }}
          >
            CASO ENCERRADO
          </div>
          <h1 className="font-display text-4xl mb-6" style={{ color: 'var(--text-primary)' }}>
            Investigação Falhada
          </h1>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {MESSAGES.map((msg, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.2 }}
              className="text-base"
              style={{ color: i === 0 ? 'var(--text-secondary)' : 'var(--text-muted)' }}
            >
              {msg}
            </motion.p>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="space-y-4"
        >
          <motion.a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 font-display text-sm tracking-[0.2em] border text-center"
            style={{
              borderColor: 'var(--accent-red)',
              color: 'var(--accent-red)',
              background: 'rgba(239,68,68,0.05)',
            }}
            whileHover={{ background: 'rgba(239,68,68,0.1)' }}
          >
            PEDIR CLEMÊNCIA
          </motion.a>

          <button
            onClick={onRestart}
            className="w-full text-xs font-mono-custom opacity-30 hover:opacity-60 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
          >
            voltar ao início
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
