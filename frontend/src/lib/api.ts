import type {
  AuthResponse,
  GameStartResponse,
  GameStateResponse,
  SubmitResponse,
} from '@/types/game'

const API_BASE = import.meta.env.VITE_API_URL || ''

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try {
      const err = await response.json()
      detail = err.detail || detail
    } catch {
      // ignore
    }
    throw new ApiError(response.status, detail)
  }

  return response.json()
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function authenticate(password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}

// ─── Game ─────────────────────────────────────────────────────────────────────

export async function startGame(token: string): Promise<GameStartResponse> {
  return request<GameStartResponse>('/api/game/start', { method: 'POST' }, token)
}

export async function getGameState(
  token: string,
  sessionId: string,
): Promise<GameStateResponse> {
  return request<GameStateResponse>(`/api/game/state/${sessionId}`, {}, token)
}

export async function submitSolution(
  token: string,
  sessionId: string,
  placement: Record<string, string>,
): Promise<SubmitResponse> {
  return request<SubmitResponse>(
    '/api/game/submit',
    {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, placement }),
    },
    token,
  )
}

export async function saveGameState(
  token: string,
  sessionId: string,
  placement: Record<string, string>,
  markedClues: string[],
): Promise<void> {
  await request(
    '/api/game/save',
    {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        placement,
        marked_clues: markedClues,
      }),
    },
    token,
  )
}

export { ApiError }
