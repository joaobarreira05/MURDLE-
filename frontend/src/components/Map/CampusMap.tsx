import React from 'react'
import { motion } from 'framer-motion'
import type { Location, Character, GridCellConfig, RoomZone } from '@/types/game'
import LocationZone from './LocationZone'

interface CampusMapProps {
  locations: Location[]
  characters: Character[]
  placement: Record<string, string>
  selectedCharId: string | null
  getCharAtLocation: (locationId: string) => string | null
  onLocationTap: (locationId: string) => void
  grid?: GridCellConfig[]
  rooms?: RoomZone[]
  onRemoveCharacter?: (charId: string) => void
}

const DEFAULT_ROOMS: RoomZone[] = [
  { id: 'autocarro_bar', name: 'AUTOCARRO BAR', color: '#06B6D4', description: 'Ponto de encontro mítico' },
  { id: 'deti', name: 'DETI', color: '#3B82F6', description: 'Departamento de Eletrónica' },
  { id: 'biblioteca', name: 'BIBLIOTECA', color: '#6366F1', description: 'Biblioteca Universitária' },
  { id: 'cua', name: 'CUA', color: '#EF4444', description: 'Cantina de Santiago' },
  { id: 'praca', name: 'PRAÇA', color: '#10B981', description: 'Praça central' },
  { id: 'drinks', name: 'DRINKS', color: '#F59E0B', description: 'Bar / Drinks' },
  { id: 'desconhecido', name: 'DESCONHECIDO', color: '#BE185D', description: 'LOCAL DO CRIME & FAINA' },
]

export default function CampusMap({
  characters,
  placement,
  selectedCharId,
  onLocationTap,
  grid,
  rooms = DEFAULT_ROOMS,
  onRemoveCharacter,
}: CampusMapProps) {
  const charById = Object.fromEntries(characters.map(c => [c.id, c]))

  // Fallback 10x10 grid generator matching game_config.py
  const gridCells: GridCellConfig[] = grid || Array.from({ length: 100 }, (_, i) => {
    const x = i % 10
    const y = Math.floor(i / 10)
    const cellId = `${x}_${y}`

    let zoneId = 'praca'
    if (y <= 2 && x >= 6) zoneId = 'desconhecido'
    else if (y <= 2) zoneId = 'deti'
    else if (y >= 7 && x <= 4) zoneId = 'cua'
    else if (y >= 7) zoneId = 'autocarro_bar'
    else if (x <= 3) zoneId = 'biblioteca'
    else if (x >= 7) zoneId = 'drinks'

    const blocked = (x === 0 && y === 2) || (x === 5 && y === 2) || (x === 5 && y === 3) || (x === 3 && y === 7) || (x === 6 && y === 7) || (x === 6 && y <= 2)

    return {
      id: cellId,
      x,
      y,
      zone_id: zoneId,
      terrain: blocked ? 'blocked' : 'walkable',
      object_type: null,
      has_carpet: x === 4 && y === 4,
    }
  })

  const charAtCell: Record<string, Character> = {}
  Object.entries(placement).forEach(([charId, cellId]) => {
    if (charById[charId]) {
      charAtCell[cellId] = charById[charId]
    }
  })

  return (
    <div className="relative flex-1 overflow-auto bg-[#080C18] p-3 sm:p-4 flex flex-col items-center select-none">
      {/* Room Zone Color Legend Bar */}
      <div className="w-full max-w-[850px] mb-3 flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#0D1428] rounded-lg border border-[var(--border)] text-[10px] font-mono-custom shadow-md">
        <div className="flex items-center gap-1 font-bold text-[var(--accent-gold)]">
          🏛️ LOCAIS DA UNIVERSIDADE DE AVEIRO:
        </div>
        <div className="flex flex-wrap gap-2.5">
          {rooms.map(room => (
            <div key={room.id} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm shadow-sm" style={{ background: room.color }} />
              <span className={`font-semibold ${room.id === 'desconhecido' ? 'text-pink-400 font-bold animate-pulse' : 'text-slate-200'}`}>
                {room.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 10x10 Topographic Grid Container */}
      <div className="w-full max-w-[850px] bg-[#0A0E1A] p-2.5 sm:p-4 rounded-xl border-2 border-slate-700 shadow-2xl overflow-x-auto">
        <div className="grid grid-cols-10 gap-1 min-w-[600px]">
          {gridCells.map(cell => {
            const char = charAtCell[cell.id] || null

            return (
              <LocationZone
                key={cell.id}
                cell={cell}
                character={char}
                selectedCharId={selectedCharId}
                onTap={() => onLocationTap(cell.id)}
                onRemove={() => {
                  if (char && onRemoveCharacter) {
                    onRemoveCharacter(char.id)
                  }
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Floating Action Indicator */}
      {selectedCharId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 px-4 py-2 rounded-full text-xs font-mono-custom font-semibold flex items-center gap-2 bg-blue-950/90 border border-blue-400 text-blue-300 shadow-lg"
        >
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          Toca num quadrado livre para posicionar {charById[selectedCharId]?.nickname}
        </motion.div>
      )}
    </div>
  )
}
