// ─── Game Domain Types ───────────────────────────────────────────────────────

export interface Character {
  id: string
  name: string
  nickname: string
  description: string
  clue_hint?: string
  image: string
}

export interface RoomZone {
  id: string
  name: string
  color: string
  description: string
}

export interface GridCellConfig {
  id: string
  x: number
  y: number
  zone_id: string
  terrain: 'walkable' | 'object' | 'blocked'
  object_type: 'mesa' | 'tv' | 'cadeira' | 'tapete' | 'estante' | 'computador' | null
  has_carpet: boolean
}

export interface Location {
  id: string
  name: string
  short_name: string
  description: string
  icon?: string
  map_x: number
  map_y: number
}

export interface Clue {
  id: string
  text: string
  category: 'exclusion' | 'position' | 'adjacency' | 'identity'
}

export interface Reward {
  type: 'coordinates' | 'text' | 'code' | 'qr'
  title: string
  content: string
  subtitle: string
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface AuthResponse {
  access_token: string
  token_type: string
  message: string
}

export interface GameStartResponse {
  session_id: string
  state: GameState
  attempts_remaining: number
  max_attempts: number
  characters: Character[]
  rooms?: RoomZone[]
  grid?: GridCellConfig[]
  locations: Location[]
  clues: Clue[]
  current_placement: Record<string, string>
  marked_clues: string[]
}

export interface GameStateResponse {
  session_id: string
  state: GameState
  attempts_used: number
  attempts_remaining: number
  max_attempts: number
  current_placement: Record<string, string>
  marked_clues: string[]
}

export interface SubmitResponse {
  correct: boolean
  game_over: boolean
  already_won: boolean
  attempts_remaining: number
  message: string
  reward: Reward | null
}

// ─── App State Types ──────────────────────────────────────────────────────────

export type GameState = 'playing' | 'won' | 'lost'

export type AppPage =
  | 'landing'
  | 'access'
  | 'intro'
  | 'game'
  | 'victory'
  | 'gameover'

export interface SessionData {
  token: string
  session_id: string | null
  state: GameState
  attempts_remaining: number
  max_attempts: number
}

export interface GameData {
  characters: Character[]
  rooms?: RoomZone[]
  grid?: GridCellConfig[]
  locations: Location[]
  clues: Clue[]
}

// ─── UI State Types ───────────────────────────────────────────────────────────

export type DragState = {
  activeCharacter: Character | null
  isDragging: boolean
}

export type PlacementMap = Record<string, string> // char_id → cell_id (e.g. "8_5")

export type SubmitState = 'idle' | 'loading' | 'error' | 'success'
