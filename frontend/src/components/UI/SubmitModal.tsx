import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import LivesDisplay from './LivesDisplay'

interface SubmitModalProps {
  state: 'idle' | 'loading' | 'error' | 'success'
  message: string
  attemptsLeft: number
  maxAttempts: number
  onClose: () => void
}

export default function SubmitModal({
  state,
  message,
  attemptsLeft,
  maxAttempts,
  onClose,
}: SubmitModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,12,24,0.85)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={state !== 'loading' ? onClose : undefined}
    >
      <motion.div
        className="w-full max-w-sm"
        style={{
          background: 'var(--bg-card)',
          border: state === 'success'
            ? '1px solid rgba(16,185,129,0.4)'
            : state === 'error'
              ? '1px solid rgba(239,68,68,0.4)'
              : '1px solid var(--border)',
        }}
        initial={{ scale: 0.9, y: 20 }}
        animate={{
          scale: 1,
          y: 0,
          x: state === 'error' ? [0, -8, 8, -8, 8, -4, 4, 0] : 0,
        }}
        transition={state === 'error'
          ? { x: { duration: 0.4, delay: 0.1 } }
          : { type: 'spring', stiffness: 400, damping: 25 }
        }
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 text-center space-y-4">
          {/* Icon */}
          {state === 'loading' && (
            <Loader2
              size={32}
              className="mx-auto animate-spin"
              style={{ color: 'var(--accent-gold)' }}
            />
          )}
          {state === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <CheckCircle2 size={40} className="mx-auto" style={{ color: 'var(--accent-green)' }} />
            </motion.div>
          )}
          {state === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <XCircle size={40} className="mx-auto" style={{ color: 'var(--accent-red)' }} />
            </motion.div>
          )}

          {/* Status label */}
          {state !== 'loading' && (
            <div
              className="font-mono-custom text-xs tracking-[0.3em]"
              style={{ color: state === 'success' ? 'var(--accent-green)' : 'var(--accent-red)' }}
            >
              {state === 'success' ? 'CORRETO' : 'DEDUÇÃO INCORRETA'}
            </div>
          )}

          {/* Message */}
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {state === 'loading' ? 'A analisar a solução...' : message}
          </p>

          {/* Lives remaining */}
          {state === 'error' && attemptsLeft > 0 && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-mono-custom" style={{ color: 'var(--text-muted)' }}>
                Tentativas restantes
              </p>
              <LivesDisplay current={attemptsLeft} max={maxAttempts} />
            </div>
          )}

          {/* Close button */}
          {state !== 'loading' && state !== 'success' && (
            <motion.button
              onClick={onClose}
              className="w-full py-3 font-display text-xs tracking-[0.2em] border transition-all duration-200"
              style={{
                borderColor: 'var(--border-bright)',
                color: 'var(--text-secondary)',
                background: 'transparent',
              }}
              whileHover={{ background: 'var(--bg-surface)' }}
              whileTap={{ scale: 0.98 }}
            >
              CONTINUAR INVESTIGAÇÃO
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
