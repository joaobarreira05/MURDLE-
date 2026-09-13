import React, { useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { setSoundEnabled, isSoundEnabled, sounds } from '@/lib/sounds'

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(isSoundEnabled())

  const toggle = () => {
    const next = !enabled
    setEnabled(next)
    setSoundEnabled(next)
    sounds.toggle(next)
  }

  return (
    <button
      onClick={toggle}
      className="w-7 h-7 flex items-center justify-center opacity-40 hover:opacity-80 transition-opacity"
      title={enabled ? 'Desativar som' : 'Ativar som'}
    >
      {enabled
        ? <Volume2 size={14} color="var(--text-secondary)" />
        : <VolumeX size={14} color="var(--text-muted)" />
      }
    </button>
  )
}
