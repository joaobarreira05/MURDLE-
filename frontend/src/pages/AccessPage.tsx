import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { authenticate, ApiError } from '@/lib/api'

interface AccessPageProps {
  onAuth: (token: string) => void
}

export default function AccessPage({ onAuth }: AccessPageProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [shake, setShake] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim() || loading) return

    setLoading(true)
    setError('')

    try {
      const res = await authenticate(password)
      onAuth(res.access_token)
    } catch (err) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      triggerShake()

      if (err instanceof ApiError && err.status === 401) {
        const msgs = [
          'Código de acesso inválido.',
          'Código errado. O Discord é teu amigo.',
          'Ainda não. Lê melhor o que a Comissão enviou.',
          'Não é essa. Calma.',
        ]
        setError(msgs[Math.min(newAttempts - 1, msgs.length - 1)])
      } else {
        setError('Erro de ligação. Tenta novamente.')
      }
      setPassword('')
      inputRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: '#080C18' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(212,168,67,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,67,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Lock size={32} color="var(--accent-gold)" className="mx-auto mb-4" />
          </motion.div>
          <h1 className="font-display text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
            CÓDIGO DE ACESSO
          </h1>
          <p className="text-sm font-mono-custom" style={{ color: 'var(--text-muted)' }}>
            Acesso reservado a investigadores autorizados
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <form onSubmit={handleSubmit}>
            <motion.div
              animate={shake ? { x: [-6, 6, -6, 6, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Password field */}
              <div
                className="relative border transition-all duration-300"
                style={{
                  borderColor: error ? 'var(--accent-red)' : 'var(--border-bright)',
                  background: 'var(--bg-surface)',
                }}
              >
                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-4 pr-12 bg-transparent font-mono-custom text-lg outline-none tracking-[0.3em]"
                  style={{
                    color: 'var(--text-primary)',
                    caretColor: 'var(--accent-gold)',
                  }}
                  autoComplete="off"
                  autoCapitalize="none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                >
                  {showPassword
                    ? <EyeOff size={16} color="var(--text-secondary)" />
                    : <Eye size={16} color="var(--text-secondary)" />
                  }
                </button>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 px-4 py-3"
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <AlertCircle size={14} color="var(--accent-red)" />
                  <span className="text-sm font-mono-custom" style={{ color: 'var(--accent-red)' }}>
                    {error}
                  </span>
                </motion.div>
              )}

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading || !password.trim()}
                className="w-full py-4 font-display text-sm tracking-[0.2em] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--accent-gold)',
                  color: '#080C18',
                }}
                whileHover={!loading ? { scale: 1.01 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#080C18] border-t-transparent rounded-full animate-spin" />
                    A VERIFICAR...
                  </span>
                ) : (
                  'DESBLOQUEAR CASO'
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>

        {/* Hint */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-xs font-mono-custom" style={{ color: 'var(--text-muted)' }}>
            O código foi divulgado no Discord da Faina DETI
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
