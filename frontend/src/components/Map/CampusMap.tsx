import React from 'react'
import { motion } from 'framer-motion'
import type { Location, Character } from '@/types/game'
import LocationZone from './LocationZone'

interface CampusMapProps {
  locations: Location[]
  characters: Character[]
  placement: Record<string, string>
  selectedCharId: string | null
  getCharAtLocation: (locationId: string) => string | null
  onLocationTap: (locationId: string) => void
}

export default function CampusMap({
  locations,
  characters,
  placement,
  selectedCharId,
  getCharAtLocation,
  onLocationTap,
}: CampusMapProps) {
  const charById = Object.fromEntries(characters.map(c => [c.id, c]))

  return (
    <div className="relative flex-1 overflow-hidden bg-[#0A0E1A] p-2 sm:p-4 flex flex-col justify-center items-center select-none">
      {/* Floorplan Container (Inspired by Murdle Game Board in Image 2!) */}
      <div className="relative w-full max-w-[850px] aspect-[4/3] bg-[#0F172A] rounded-xl border-4 border-[#1E293B] shadow-2xl overflow-hidden flex flex-col">
        {/* Floorplan Grid Background Pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #334155 1px, transparent 1px),
              linear-gradient(to bottom, #334155 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Map Header Banner */}
        <div className="relative z-10 px-4 py-2 bg-[#1E293B]/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-display text-xs sm:text-sm tracking-widest text-slate-200">
              MAPA DE INSTALAÇÕES — CAMPUS UA DETI
            </span>
          </div>
          <span className="font-mono-custom text-[11px] text-amber-400/90 font-semibold">
            {Object.keys(placement).length}/{locations.length} Suspeitos Posicionados
          </span>
        </div>

        {/* Interactive Floorplan Room Zones */}
        <div className="relative flex-1 w-full h-full">
          {locations.map(location => {
            const charId = getCharAtLocation(location.id)
            const char = charId ? charById[charId] : null

            return (
              <LocationZone
                key={location.id}
                location={location}
                character={char}
                isSelected={false}
                isDragOver={false}
                selectedCharId={selectedCharId}
                onTap={() => onLocationTap(location.id)}
                onRemove={() => {}}
              />
            )
          })}
        </div>

        {/* Map Footer Bar */}
        <div className="relative z-10 px-4 py-1.5 bg-[#1E293B]/80 border-t border-slate-700 flex items-center justify-between text-[10px] font-mono-custom text-slate-400">
          <span>📍 Arrasta ou toca nos locais para posicionar os suspeitos</span>
          <span className="text-emerald-400 font-bold">⚠️ Crime Scene: Labs DETI</span>
        </div>
      </div>

      {/* Selected Character Floating Indicator */}
      {selectedCharId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 px-4 py-2 rounded-full text-xs font-mono-custom shadow-lg font-semibold flex items-center gap-2 bg-blue-950/90 border border-blue-400 text-blue-300"
        >
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          Toca num local do mapa para posicionar {charById[selectedCharId]?.nickname}
        </motion.div>
      )}
    </div>
  )
}
