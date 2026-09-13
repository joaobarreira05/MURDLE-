"""
MURDOKU — Game Configuration
═══════════════════════════════════════════════════════════════════════════════

THIS IS THE FILE TO EDIT TO CHANGE GAME CONTENT.

All game content is defined here:
  - Characters (names, nicknames, descriptions)
  - Locations (names, descriptions, map positions)
  - Clues (the logic constraints)
  - Solution (the correct placement)
  - Reward (shown on victory)
  - Game settings (max attempts, etc.)

═══════════════════════════════════════════════════════════════════════════════
"""

from typing import TypedDict


# ─── TYPES ────────────────────────────────────────────────────────────────────

class Character(TypedDict):
    id: str
    name: str
    nickname: str
    description: str
    clue_hint: str  # Personal clue shown under suspect card (Murdle style!)
    image: str


class Location(TypedDict):
    id: str
    name: str
    short_name: str
    description: str
    icon: str
    map_x: float
    map_y: float


class Clue(TypedDict):
    id: str
    text: str
    category: str  # "exclusion" | "position" | "adjacency" | "identity"


class Solution(TypedDict):
    placement: dict[str, str]


class Reward(TypedDict):
    type: str
    title: str
    content: str
    subtitle: str


class GameConfig(TypedDict):
    characters: list[Character]
    locations: list[Location]
    clues: list[Clue]
    solution: Solution
    reward: Reward
    max_attempts: int


# ─── CHARACTERS ───────────────────────────────────────────────────────────────
# 11 Suspeitos da Comissão de Faina do DETI

CHARACTERS: list[Character] = [
    {
        "id": "barreira",
        "name": "Barreira",
        "nickname": "Barreira",
        "description": "Veterano do DETI.",
        "clue_hint": "Foi visto na receção do edifício principal do DETI.",
        "image": "character-01.webp",
    },
    {
        "id": "rodao",
        "name": "Rodão",
        "nickname": "Rodão",
        "description": "Conhece todos os cantos do CP.",
        "clue_hint": "Passou a tarde em reuniões no Complexo Pedagógico.",
        "image": "character-02.webp",
    },
    {
        "id": "varela",
        "name": "Varela",
        "nickname": "Varela",
        "description": "Estudante reservado do DETI.",
        "clue_hint": "Esteve numa zona de equipamento técnico fechado a chave.",
        "image": "character-03.webp",
    },
    {
        "id": "ines",
        "name": "Inês",
        "nickname": "Inês",
        "description": "Fã de fotografia e natureza.",
        "clue_hint": "Esteve a tirar fotos na Passarela Pedonal da Ria.",
        "image": "character-04.webp",
    },
    {
        "id": "sid",
        "name": "Sid",
        "nickname": "Sid",
        "description": "Viciado em café expresso.",
        "clue_hint": "Esteve no Bar do DETI a beber um café concentrado.",
        "image": "character-05.webp",
    },
    {
        "id": "rita",
        "name": "Rita",
        "nickname": "Rita",
        "description": "Amante de música e artes.",
        "clue_hint": "Esteve junto à Concha Acústica a ensaiar com a guitarra.",
        "image": "character-06.webp",
    },
    {
        "id": "xuta",
        "name": "Xuta",
        "nickname": "Xuta",
        "description": "Membro ativo da Comissão.",
        "clue_hint": "Almoçava tranquilamente na Cantina de Santiago.",
        "image": "character-07.webp",
    },
    {
        "id": "pancas",
        "name": "Panças",
        "nickname": "Panças",
        "description": "Gosta de recantos sossegados.",
        "clue_hint": "Adormeceu nas cadeiras do Auditório Renato Araújo.",
        "image": "character-08.webp",
    },
    {
        "id": "machado",
        "name": "Machado",
        "nickname": "Machado",
        "description": "Investigador compenetrado.",
        "clue_hint": "Esteve em silêncio absoluto no 2º andar da Biblioteca.",
        "image": "character-09.webp",
    },
    {
        "id": "calix",
        "name": "Cálix",
        "nickname": "Cálix",
        "description": "Apreciador do ar livre.",
        "clue_hint": "Apanhava sol perto do Catavento no Relvado Central.",
        "image": "character-10.webp",
    },
    {
        "id": "mariana",
        "name": "Mariana",
        "nickname": "Mariana",
        "description": "Residente habitual da matemática.",
        "clue_hint": "Resolveu equações diferenciais no DMAT.",
        "image": "character-11.webp",
    },
]

# ─── LOCATIONS ────────────────────────────────────────────────────────────────

LOCATIONS: list[Location] = [
    {
        "id": "deti",
        "name": "Departamento de Eletrónica (DETI)",
        "short_name": "DETI",
        "description": "Edifício principal do DETI",
        "icon": "💻",
        "map_x": 52.0,
        "map_y": 30.0,
    },
    {
        "id": "comp_pedagogico",
        "name": "Complexo Pedagógico (CP)",
        "short_name": "Comp. Pedagógico",
        "description": "Salas de aula e blocos teóricos",
        "icon": "🏛️",
        "map_x": 36.0,
        "map_y": 40.0,
    },
    {
        "id": "cantina",
        "name": "Cantina de Santiago (CUA)",
        "short_name": "Cantina / CUA",
        "description": "Zona de refeições e convívio",
        "icon": "🍽️",
        "map_x": 22.0,
        "map_y": 55.0,
    },
    {
        "id": "biblioteca",
        "name": "Biblioteca Universitária",
        "short_name": "Biblioteca UA",
        "description": "Estudo e silêncio obrigatório",
        "icon": "📚",
        "map_x": 72.0,
        "map_y": 50.0,
    },
    {
        "id": "dmat",
        "name": "Departamento de Matemática (DMAT)",
        "short_name": "DMAT",
        "description": "Gabinete e salas de cálculo",
        "icon": "📐",
        "map_x": 42.0,
        "map_y": 64.0,
    },
    {
        "id": "relvado",
        "name": "Relvado Central & Catavento",
        "short_name": "Relvado UA",
        "description": "Espaço verde no centro do campus",
        "icon": "🌿",
        "map_x": 50.0,
        "map_y": 50.0,
    },
    {
        "id": "bar_deti",
        "name": "Bar do DETI / Estudantes",
        "short_name": "Bar DETI",
        "description": "Cafetaria e ponto de encontro",
        "icon": "☕",
        "map_x": 30.0,
        "map_y": 36.0,
    },
    {
        "id": "auditorio",
        "name": "Auditório Renato Araújo",
        "short_name": "Auditório UA",
        "description": "Grande anfiteatro da Reitoria",
        "icon": "🎭",
        "map_x": 68.0,
        "map_y": 28.0,
    },
    {
        "id": "concha",
        "name": "Concha Acústica da UA",
        "short_name": "Concha Acústica",
        "description": "Palco ao ar livre",
        "icon": "🎤",
        "map_x": 18.0,
        "map_y": 30.0,
    },
    {
        "id": "labs_deti",
        "name": "Laboratórios de Hardware (DETI)",
        "short_name": "Labs DETI",
        "description": "CRIME SCENE — Onde os Aluviões foram atacados",
        "icon": "🔬",
        "map_x": 62.0,
        "map_y": 40.0,
    },
    {
        "id": "passarela",
        "name": "Passarela Pedonal da Ria",
        "short_name": "Passarela Ria",
        "description": "Ponte pedonal sobre o canal",
        "icon": "🌉",
        "map_x": 44.0,
        "map_y": 24.0,
    },
]

# ─── SOLUTION ─────────────────────────────────────────────────────────────────

SOLUTION: Solution = {
    "placement": {
        "barreira": "deti",
        "rodao": "comp_pedagogico",
        "varela": "labs_deti",
        "ines": "passarela",
        "sid": "bar_deti",
        "rita": "concha",
        "xuta": "cantina",
        "pancas": "auditorio",
        "machado": "biblioteca",
        "calix": "relvado",
        "mariana": "dmat",
    }
}

# ─── CLUES ────────────────────────────────────────────────────────────────────
# DEDUCTION PUZZLE — NO SPOILERS!
# Player deduces positions, and deduces who was at Labs DETI (the crime scene).

CLUES: list[Clue] = [
    {
        "id": "clue_01",
        "text": "O Barreira estava na receção do edifício principal do DETI.",
        "category": "identity",
    },
    {
        "id": "clue_02",
        "text": "O Rodão esteve o tempo todo nas salas do Complexo Pedagógico.",
        "category": "identity",
    },
    {
        "id": "clue_03",
        "text": "O suspeito que se encontrava nos Laboratórios do DETI estava sozinho com a vítima no momento do ataque.",
        "category": "position",
    },
    {
        "id": "clue_04",
        "text": "A Inês estava a apanhar ar fresco na Passarela Pedonal da Ria.",
        "category": "identity",
    },
    {
        "id": "clue_05",
        "text": "O Sid esteve a beber um café concentrado no Bar do DETI.",
        "category": "identity",
    },
    {
        "id": "clue_06",
        "text": "A Rita esteve a ensaiar junto à Concha Acústica da UA.",
        "category": "identity",
    },
    {
        "id": "clue_07",
        "text": "O Xuta foi visto a almoçar uma senha de prato na Cantina de Santiago (CUA).",
        "category": "identity",
    },
    {
        "id": "clue_08",
        "text": "O Panças estava confortavelmente adormecido no Auditório Renato Araújo.",
        "category": "identity",
    },
    {
        "id": "clue_09",
        "text": "O Machado esteve em silêncio absoluto no 2º andar da Biblioteca Universitária.",
        "category": "identity",
    },
    {
        "id": "clue_10",
        "text": "O Cálix esteve a relaxar na relva perto do Catavento no Relvado Central.",
        "category": "identity",
    },
    {
        "id": "clue_11",
        "text": "A Mariana estava a resolver equações no Departamento de Matemática (DMAT).",
        "category": "identity",
    },
    {
        "id": "clue_12",
        "text": "CRIME SCENE: Os Aluviões foram atacados nos Laboratórios do DETI. A pessoa que lá estava é o ASSASSINO!",
        "category": "exclusion",
    },
]

# ─── REWARD ───────────────────────────────────────────────────────────────────

REWARD: Reward = {
    "type": "coordinates",
    "title": "CASO RESOLVIDO — O ASSASSINO ERA O VARELA!",
    "content": "40.630541, -8.657858",
    "subtitle": "Universidade de Aveiro — DETI\n\"Deduciste corretamente! O Varela estava nos Laboratórios do DETI e atacou os Aluviões!\"\n\n[A honra dos Aluviões e a Faina do DETI foram salvas!]",
}

# ─── GAME SETTINGS ────────────────────────────────────────────────────────────

GAME_CONFIG: GameConfig = {
    "characters": CHARACTERS,
    "locations": LOCATIONS,
    "clues": CLUES,
    "solution": SOLUTION,
    "reward": REWARD,
    "max_attempts": 3,
}
