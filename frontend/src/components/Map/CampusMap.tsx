import React, { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { UserCheck, XCircle, Trash2, HelpCircle } from 'lucide-react'
import type { Location, Character, GridCellConfig, RoomZone } from '@/types/game'
import LocationZone from './LocationZone'
import { sounds } from '@/lib/sounds'

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
  { id: 'deti', name: 'DETI', color: '#3B82F6', description: 'Laboratórios & Computadores' },
  { id: 'biblioteca', name: 'BIBLIOTECA', color: '#6366F1', description: 'Biblioteca Universitária' },
  { id: 'cua', name: 'CUA', color: '#EF4444', description: 'Cantina Universitária' },
  { id: 'praca', name: 'PRAÇA', color: '#10B981', description: 'Praça Central do Campus' },
  { id: 'autocarro_bar', name: 'AUTOCARRO BAR', color: '#06B6D4', description: 'Autocarro Cervejeiro' },
  { id: 'drinks', name: 'DRINKS', color: '#F59E0B', description: 'Zona de Convívio & Bar' },
  { id: 'desconhecido', name: 'DESCONHECIDO', color: '#BE185D', description: 'LOCAL SECRETO / CRIME' },
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
  const charById = useMemo(() => Object.fromEntries(characters.map(c => [c.id, c])), [characters])

  // Tool Mode: 'place' (default placement) or 'exclude' (click cell to place manual 'X' note)
  const [toolMode, setToolMode] = useState<'place' | 'exclude'>('place')
  const [manualExcludedCells, setManualExcludedCells] = useState<Set<string>>(new Set())

  // Calculate all cells that are in the same row OR same column of any currently placed character
  const rowColExcludedCells = useMemo(() => {
    const set = new Set<string>()
    Object.values(placement).forEach(cellId => {
      const [xStr, yStr] = cellId.split('_')
      const cx = parseInt(xStr, 10)
      const cy = parseInt(yStr, 10)
      if (isNaN(cx) || isNaN(cy)) return

      // Block entire column cx
      for (let y = 0; y < 12; y++) {
        if (y !== cy) set.add(`${cx}_${y}`)
      }
      // Block entire row cy
      for (let x = 0; x < 12; x++) {
        if (x !== cx) set.add(`${x}_${cy}`)
      }
    })
    return set
  }, [placement])

  const toggleManualExclude = useCallback((cellId: string) => {
    setManualExcludedCells(prev => {
      const next = new Set(prev)
      if (next.has(cellId)) {
        next.delete(cellId)
      } else {
        next.add(cellId)
      }
      return next
    })
    sounds.click()
  }, [])

  const handleCellClick = useCallback((cellId: string) => {
    if (toolMode === 'exclude') {
      toggleManualExclude(cellId)
      return
    }
    // In placement mode
    if (selectedCharId) {
      // If cell row or column is already blocked by another suspect, warn player
      if (rowColExcludedCells.has(cellId)) {
        sounds.error()
        return
      }
      onLocationTap(cellId)
    } else {
      // If no character selected, clicking toggles manual exclusion
      toggleManualExclude(cellId)
    }
  }, [toolMode, selectedCharId, rowColExcludedCells, onLocationTap, toggleManualExclude])

  // Fallback 12x12 grid generator matching game_config.py
  const gridCells: GridCellConfig[] = useMemo(() => {
    if (grid && grid.length === 144) return grid

    const object_map: Record<string, string> = {
      '2_0': 'computador',
      '0_3': 'tshirt_aluviao',
      '4_5': 'cd',
      '7_7': 'boxer',
      '8_9': 'garrafa',
      '9_11': 'caneca',
      '9_1': 'computador',
    }

    const carpet_cells = new Set(['6_7'])
    const blocked_cells = new Set([
      '6_0', '6_1', '6_2', '6_3',
      '0_2', '4_9', '7_10',
    ])

    const getZone = (x: number, y: number): string => {
      if (y <= 3) {
        if (x <= 5) return 'deti'
        else return 'desconhecido'
      } else if (y <= 8) {
        if (x <= 3) return 'biblioteca'
        else if (x >= 8) return 'drinks'
        else return 'praca'
      } else {
        if (x >= 8 && y === 9) return 'drinks'
        else if (x <= 5) return 'cua'
        else return 'autocarro_bar'
      }
    }

    return Array.from({ length: 144 }, (_, i) => {
      const x = i % 12
      const y = Math.floor(i / 12)
      const cellId = `${x}_${y}`

      return {
        id: cellId,
        x,
        y,
        zone_id: getZone(x, y),
        terrain: blocked_cells.has(cellId) ? 'blocked' : (object_map[cellId] ? 'object' : 'walkable'),
        object_type: object_map[cellId] || null,
        has_carpet: carpet_cells.has(cellId),
      }
    })
  }, [grid])

  const charAtCell: Record<string, Character> = useMemo(() => {
    const map: Record<string, Character> = {}
    Object.entries(placement).forEach(([charId, cellId]) => {
      if (charById[charId]) {
        map[cellId] = charById[charId]
      }
    })
    return map
  }, [placement, charById])

  return (
    <div className="relative flex-1 overflow-auto bg-[#070A14] p-2 sm:p-4 flex flex-col items-center select-none">
      {/* Top Map Toolbar: Zones Legend & Tools */}
      <div className="w-full max-w-[850px] mb-2 flex flex-wrap items-center justify-between gap-2 p-2 bg-[#0C1222] rounded-lg border border-[var(--border)] text-[10px] font-mono-custom shadow-md">
        {/* Rooms Legend */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-[var(--accent-gold)] flex items-center gap-1">
            🏛️ LOCAIS:
          </span>
          {rooms.map(room => (
            <div key={room.id} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/40 border border-white/5">
              <span className="w-2.5 h-2.5 rounded-sm shadow-sm flex-shrink-0" style={{ background: room.color }} />
              <span className={`font-semibold ${room.id === 'desconhecido' ? 'text-pink-400 font-bold animate-pulse' : 'text-slate-200'}`}>
                {room.name}
              </span>
            </div>
          ))}
        </div>

        {/* Interactive Mode Toggles */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => { setToolMode('place'); sounds.click(); }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono-custom font-bold transition-colors ${
              toolMode === 'place'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Modo de posicionar suspeitos no mapa"
          >
            <UserCheck size={12} />
            Colocar
          </button>
          <button
            onClick={() => { setToolMode('exclude'); sounds.click(); }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono-custom font-bold transition-colors ${
              toolMode === 'exclude'
                ? 'bg-red-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Modo de anotação de exclusão (marca ✕ nas células que deduzires vazias)"
          >
            <XCircle size={12} />
            Anotar ✕
          </button>
          {manualExcludedCells.size > 0 && (
            <button
              onClick={() => { setManualExcludedCells(new Set()); sounds.click(); }}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono-custom bg-slate-800 text-red-400 hover:bg-red-950/50 transition-colors"
              title="Limpar anotações ✕ manuais"
            >
              <Trash2 size={11} />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Spatial Deduction Helper Notice */}
      <div className="w-full max-w-[850px] mb-2 px-3 py-1.5 bg-blue-950/30 border border-blue-800/40 rounded-md text-[10px] font-mono-custom text-blue-300 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <HelpCircle size={12} className="text-blue-400 flex-shrink-0" />
          <span>
            <strong>Regra Murdoku:</strong> Ao colocares um suspeito, toda a sua linha e toda a sua coluna ficam bloqueadas com <strong className="text-red-400">✕</strong> (máximo de 1 suspeito por linha e por coluna). Podes clicar com botão direito para anotar <strong className="text-red-400">✕</strong> manualmente.
          </span>
        </span>
        {selectedCharId && (
          <span className="text-amber-400 font-bold animate-pulse flex-shrink-0">
            A posicionar: {charById[selectedCharId]?.nickname}
          </span>
        )}
      </div>

      {/* 12x12 Architectural Floorplan Grid */}
      <div className="w-full max-w-[850px] bg-[#0A0F1D] p-2 sm:p-3 rounded-xl border-2 border-slate-700 shadow-2xl overflow-x-auto relative">
        <div className="grid grid-cols-12 gap-1 min-w-[650px]">
          {gridCells.map(cell => {
            const char = charAtCell[cell.id] || null
            const isRowColBlocked = rowColExcludedCells.has(cell.id)
            const isManual = manualExcludedCells.has(cell.id)

            return (
              <LocationZone
                key={cell.id}
                cell={cell}
                character={char}
                selectedCharId={selectedCharId}
                isSurroundingExcluded={isRowColBlocked}
                isManualExcluded={isManual}
                onTap={() => handleCellClick(cell.id)}
                onToggleExclude={() => toggleManualExclude(cell.id)}
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

      {/* Floating Action Hint */}
      {selectedCharId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2.5 px-4 py-1.5 rounded-full text-xs font-mono-custom font-semibold flex items-center gap-2 bg-blue-950/95 border border-blue-400 text-blue-200 shadow-lg"
        >
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          Clica num quadrado livre para posicionar {charById[selectedCharId]?.nickname}
        </motion.div>
      )}
    </div>
  )
}

