/**
 * Optional Web Audio API sound effects.
 * No external files needed — pure synthesis.
 */

let audioCtx: AudioContext | null = null
let enabled = true

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioCtx
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.15,
  startDelay = 0,
): void {
  if (!enabled) return
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + startDelay)
    gainNode.gain.setValueAtTime(0, ctx.currentTime + startDelay)
    gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + startDelay + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + startDelay + duration,
    )
    osc.start(ctx.currentTime + startDelay)
    osc.stop(ctx.currentTime + startDelay + duration)
  } catch {
    // Audio not supported or blocked
  }
}

export const sounds = {
  click: () => playTone(800, 0.08, 'square', 0.05),
  drop: () => {
    playTone(440, 0.1, 'sine', 0.1)
    playTone(660, 0.15, 'sine', 0.08, 0.05)
  },
  error: () => {
    playTone(220, 0.2, 'sawtooth', 0.08)
    playTone(180, 0.3, 'sawtooth', 0.06, 0.1)
  },
  success: () => {
    playTone(523, 0.12, 'sine', 0.12)
    playTone(659, 0.12, 'sine', 0.12, 0.12)
    playTone(784, 0.12, 'sine', 0.12, 0.24)
    playTone(1047, 0.3, 'sine', 0.15, 0.36)
  },
  unlock: () => {
    playTone(300, 0.1, 'sine', 0.1)
    playTone(600, 0.15, 'sine', 0.12, 0.1)
    playTone(900, 0.2, 'sine', 0.1, 0.2)
  },
  toggle: (on: boolean) => {
    if (on) playTone(660, 0.1, 'sine', 0.08)
    else playTone(440, 0.1, 'sine', 0.08)
  },
}

export function setSoundEnabled(value: boolean) {
  enabled = value
}

export function isSoundEnabled() {
  return enabled
}
