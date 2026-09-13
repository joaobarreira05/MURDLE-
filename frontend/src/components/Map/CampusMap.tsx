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

// UA Campus map paths - stylized SVG representation of Universidade de Aveiro
// Based on the real campus layout around DETI/CP/CUA/Library/DMAT area

const UA_MAP_SVG = `
<svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background - campus grounds -->
  <rect width="800" height="600" fill="#0D1421"/>
  
  <!-- Main roads -->
  <path d="M 0 300 H 800" stroke="#1A2540" stroke-width="12" stroke-linecap="round"/>
  <path d="M 400 0 V 600" stroke="#1A2540" stroke-width="8" stroke-linecap="round"/>
  <path d="M 150 150 L 650 150" stroke="#1A2540" stroke-width="6"/>
  <path d="M 150 450 L 650 450" stroke="#1A2540" stroke-width="6"/>
  <path d="M 150 150 L 150 450" stroke="#1A2540" stroke-width="6"/>
  <path d="M 650 150 L 650 450" stroke="#1A2540" stroke-width="6"/>
  
  <!-- Lago de Aveiro / water feature -->
  <ellipse cx="680" cy="80" rx="90" ry="50" fill="#0D2040" opacity="0.8"/>
  <ellipse cx="680" cy="80" rx="85" ry="45" fill="#0F2545" opacity="0.6"/>
  <text x="680" y="84" fill="#1D3A6B" font-size="8" text-anchor="middle" font-family="monospace" opacity="0.6">RIAS</text>
  
  <!-- Green areas / relvado -->
  <rect x="330" y="220" width="140" height="100" rx="4" fill="#0E2015" opacity="0.8"/>
  <rect x="335" y="225" width="130" height="90" rx="3" fill="#102515" opacity="0.6"/>
  
  <!-- DETI building -->
  <rect x="420" y="170" width="120" height="80" rx="2" fill="#142038" stroke="#1E3050" stroke-width="1.5"/>
  <rect x="425" y="175" width="110" height="70" rx="1" fill="#162235"/>
  <text x="480" y="212" fill="#D4A843" font-size="9" text-anchor="middle" font-family="monospace" font-weight="bold">DETI</text>
  
  <!-- Complexo Pedagógico -->
  <rect x="240" y="210" width="110" height="85" rx="2" fill="#142038" stroke="#1E3050" stroke-width="1.5"/>
  <rect x="245" y="215" width="100" height="75" rx="1" fill="#162235"/>
  <text x="295" y="255" fill="#94A3B8" font-size="7" text-anchor="middle" font-family="monospace">COMPLEXO</text>
  <text x="295" y="265" fill="#94A3B8" font-size="7" text-anchor="middle" font-family="monospace">PEDAGÓGICO</text>
  
  <!-- CUA / Cantina -->
  <rect x="140" y="300" width="100" height="75" rx="2" fill="#142038" stroke="#1E3050" stroke-width="1.5"/>
  <rect x="145" y="305" width="90" height="65" rx="1" fill="#162235"/>
  <text x="190" y="340" fill="#94A3B8" font-size="8" text-anchor="middle" font-family="monospace">CUA</text>
  
  <!-- Biblioteca -->
  <rect x="500" y="290" width="115" height="80" rx="2" fill="#142038" stroke="#1E3050" stroke-width="1.5"/>
  <rect x="505" y="295" width="105" height="70" rx="1" fill="#162235"/>
  <text x="557" y="333" fill="#94A3B8" font-size="7" text-anchor="middle" font-family="monospace">BIBLIOTECA</text>
  
  <!-- DMAT -->
  <rect x="270" y="340" width="100" height="70" rx="2" fill="#142038" stroke="#1E3050" stroke-width="1.5"/>
  <rect x="275" y="345" width="90" height="60" rx="1" fill="#162235"/>
  <text x="320" y="378" fill="#94A3B8" font-size="8" text-anchor="middle" font-family="monospace">DMAT</text>
  
  <!-- Auditório -->
  <rect x="480" y="165" width="90" height="60" rx="2" fill="#142038" stroke="#1E3050" stroke-width="1.5"/>
  <ellipse cx="525" cy="165" rx="45" ry="20" fill="#142038" stroke="#1E3050" stroke-width="1.5"/>
  <text x="525" y="197" fill="#94A3B8" font-size="7" text-anchor="middle" font-family="monospace">AUDITÓRIO</text>
  
  <!-- Bar -->
  <rect x="165" y="215" width="75" height="55" rx="2" fill="#142038" stroke="#1E3050" stroke-width="1.5"/>
  <rect x="170" y="220" width="65" height="45" rx="1" fill="#162235"/>
  <text x="202" y="245" fill="#94A3B8" font-size="8" text-anchor="middle" font-family="monospace">BAR</text>
  
  <!-- Entrada UA -->
  <rect x="80" y="155" width="80" height="60" rx="2" fill="#142038" stroke="#1E3050" stroke-width="1.5"/>
  <rect x="85" y="160" width="70" height="50" rx="1" fill="#162235"/>
  <text x="120" y="183" fill="#94A3B8" font-size="6" text-anchor="middle" font-family="monospace">ENTRADA</text>
  <text x="120" y="193" fill="#94A3B8" font-size="6" text-anchor="middle" font-family="monospace">PRINCIPAL</text>
  
  <!-- Laboratório DETI -->
  <rect x="430" y="260" width="95" height="60" rx="2" fill="#142038" stroke="#1E3050" stroke-width="1.5"/>
  <rect x="435" y="265" width="85" height="50" rx="1" fill="#162235"/>
  <text x="477" y="293" fill="#94A3B8" font-size="7" text-anchor="middle" font-family="monospace">LABORATÓRIO</text>
  
  <!-- Sala de Estudo -->
  <rect x="330" y="150" width="100" height="55" rx="2" fill="#142038" stroke="#1E3050" stroke-width="1.5"/>
  <rect x="335" y="155" width="90" height="45" rx="1" fill="#162235"/>
  <text x="380" y="175" fill="#94A3B8" font-size="6" text-anchor="middle" font-family="monospace">SALA DE</text>
  <text x="380" y="185" fill="#94A3B8" font-size="6" text-anchor="middle" font-family="monospace">ESTUDO</text>
  
  <!-- Paths/walkways -->
  <path d="M 280 155 L 330 165" stroke="#1A2540" stroke-width="3" opacity="0.5"/>
  <path d="M 380 205 L 380 220" stroke="#1A2540" stroke-width="3" opacity="0.5"/>
  <path d="M 440 210 L 440 260" stroke="#1A2540" stroke-width="3" opacity="0.5"/>
  <path d="M 350 250 L 350 280" stroke="#1A2540" stroke-width="3" opacity="0.5"/>
  
  <!-- Compass rose (decorative) -->
  <g transform="translate(740, 540)">
    <circle cx="0" cy="0" r="18" fill="#0D1421" stroke="#1E3050" stroke-width="1"/>
    <text x="0" y="-8" fill="#D4A843" font-size="8" text-anchor="middle" font-family="monospace" font-weight="bold">N</text>
    <path d="M 0 -5 L 0 5" stroke="#D4A843" stroke-width="1.5" opacity="0.6"/>
    <path d="M -5 0 L 5 0" stroke="#475569" stroke-width="1" opacity="0.4"/>
  </g>
  
  <!-- Title watermark -->
  <text x="400" y="570" fill="#1A2540" font-size="10" text-anchor="middle" font-family="monospace" opacity="0.5">CAMPUS UA — MURDOKU</text>
</svg>
`

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
    <div className="relative flex-1 overflow-hidden" style={{ minHeight: '320px' }}>
      {/* Map SVG background */}
      <div
        className="absolute inset-0 w-full h-full"
        dangerouslySetInnerHTML={{ __html: UA_MAP_SVG }}
        style={{
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* SVG as actual element for proper sizing */}
      <div className="absolute inset-0 w-full h-full">
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full"
          style={{ position: 'absolute', inset: 0 }}
        >
          {/* Map background paths rendered via dangerouslySetInnerHTML above */}
        </svg>
      </div>

      {/* Location zones overlay */}
      <div className="absolute inset-0">
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
              onRemove={() => {
                // When removing, we need to call remove - handled via char card click
              }}
            />
          )
        })}
      </div>

      {/* Map header overlay */}
      <div
        className="absolute top-0 left-0 right-0 px-4 py-2 flex items-center justify-between"
        style={{
          background: 'linear-gradient(to bottom, rgba(8,12,24,0.9), transparent)',
        }}
      >
        <span
          className="font-mono-custom text-xs tracking-[0.2em]"
          style={{ color: 'var(--accent-gold)' }}
        >
          CAMPUS UA — ZONA DETI
        </span>
        <span
          className="font-mono-custom text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          {Object.keys(placement).length}/{locations.length} posições preenchidas
        </span>
      </div>

      {/* Selected character indicator */}
      {selectedCharId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs font-mono-custom"
          style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            color: 'var(--accent-blue)',
          }}
        >
          Toca num local para colocar {charById[selectedCharId]?.nickname}
        </motion.div>
      )}
    </div>
  )
}
