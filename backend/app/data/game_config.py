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
    image: str


class Location(TypedDict):
    id: str
    name: str
    short_name: str
    description: str
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
# Os 11 suspeitos da Comissão de Faina do DETI
# A vítima: Os Aluviões | O assassino: Varela

CHARACTERS: list[Character] = [
    {
        "id": "barreira",
        "name": "Barreira",
        "nickname": "Barreira",
        "description": "Veterano do DETI. Sempre a inspecionar os laboratórios.",
        "image": "character-01.webp",
    },
    {
        "id": "rodao",
        "name": "Rodão",
        "nickname": "Rodão",
        "description": "Conhece todos os cantos do Complexo Pedagógico.",
        "image": "character-02.webp",
    },
    {
        "id": "varela",
        "name": "Varela",
        "nickname": "Varela",
        "description": "O principal suspeito do ataque aos Aluviões. Rosto misterioso.",
        "image": "character-03.webp",
    },
    {
        "id": "ines",
        "name": "Inês",
        "nickname": "Inês",
        "description": "Vista a andar apressada perto da Ria de Aveiro.",
        "image": "character-04.webp",
    },
    {
        "id": "sid",
        "name": "Sid",
        "nickname": "Sid",
        "description": "Viciado em café e no ambiente do Bar do DETI.",
        "image": "character-05.webp",
    },
    {
        "id": "rita",
        "name": "Rita",
        "nickname": "Rita",
        "description": "Amante de artes e ensaios ao ar livre na Concha Acústica.",
        "image": "character-06.webp",
    },
    {
        "id": "xuta",
        "name": "Xuta",
        "nickname": "Xuta",
        "description": "Líder enérgico. Almoçava descansado na Cantina.",
        "image": "character-07.webp",
    },
    {
        "id": "pancas",
        "name": "Panças",
        "nickname": "Panças",
        "description": "Sempre no Auditório a fingir que assiste às conferências.",
        "image": "character-08.webp",
    },
    {
        "id": "machado",
        "name": "Machado",
        "nickname": "Machado",
        "description": "Silencioso. Passou o dia escondido entre os livros da Biblioteca.",
        "image": "character-09.webp",
    },
    {
        "id": "calix",
        "name": "Cálix",
        "nickname": "Cálix",
        "description": "Procurava inspiração no Relvado Central da UA.",
        "image": "character-10.webp",
    },
    {
        "id": "mariana",
        "name": "Mariana",
        "nickname": "Mariana",
        "description": "Especialista em cálculos e residente habitual do DMAT.",
        "image": "character-11.webp",
    },
]

# ─── LOCATIONS ────────────────────────────────────────────────────────────────
# Locais reais da Universidade de Aveiro (UA)

LOCATIONS: list[Location] = [
    {
        "id": "deti",
        "name": "Departamento de Eletrónica (DETI)",
        "short_name": "DETI",
        "description": "Edifício 4 do Campus de Santiago.",
        "map_x": 55.0,
        "map_y": 35.0,
    },
    {
        "id": "comp_pedagogico",
        "name": "Complexo Pedagógico (CP)",
        "short_name": "Comp. Pedagógico",
        "description": "Onde decorrem as grandes aulas teóricas.",
        "map_x": 38.0,
        "map_y": 42.0,
    },
    {
        "id": "cantina",
        "name": "Cantina de Santiago (CUA)",
        "short_name": "Cantina / CUA",
        "description": "Ponto de encontro para o almoço do campus.",
        "map_x": 25.0,
        "map_y": 55.0,
    },
    {
        "id": "biblioteca",
        "name": "Biblioteca Universitária",
        "short_name": "Biblioteca UA",
        "description": "Zona de estudo silencioso desenhada por Siza Vieira.",
        "map_x": 70.0,
        "map_y": 52.0,
    },
    {
        "id": "dmat",
        "name": "Departamento de Matemática (DMAT)",
        "short_name": "DMAT",
        "description": "Edifício das equações e fórmulas abstratas.",
        "map_x": 42.0,
        "map_y": 62.0,
    },
    {
        "id": "relvado",
        "name": "Relvado Central & Catavento",
        "short_name": "Relvado UA",
        "description": "O coração verde no centro do campus.",
        "map_x": 50.0,
        "map_y": 50.0,
    },
    {
        "id": "bar_deti",
        "name": "Bar do DETI / Estudantes",
        "short_name": "Bar DETI",
        "description": "Onde o café a 0.50€ mantém o curso a andar.",
        "map_x": 30.0,
        "map_y": 40.0,
    },
    {
        "id": "auditorio",
        "name": "Auditório Renato Araújo",
        "short_name": "Auditório UA",
        "description": "O grande auditório da Reitoria da UA.",
        "map_x": 65.0,
        "map_y": 30.0,
    },
    {
        "id": "concha",
        "name": "Concha Acústica da UA",
        "short_name": "Concha Acústica",
        "description": "Palco ao ar livre para atuações e serenatas.",
        "map_x": 20.0,
        "map_y": 30.0,
    },
    {
        "id": "labs_deti",
        "name": "Laboratórios de Redes e Hardware (DETI)",
        "short_name": "Labs DETI",
        "description": "O local exato onde os Aluviões foram surpreendidos!",
        "map_x": 60.0,
        "map_y": 42.0,
    },
    {
        "id": "passarela",
        "name": "Passarela Pedonal da Ria",
        "short_name": "Passarela Ria",
        "description": "Ponte pedonal com vista para a ria de Aveiro.",
        "map_x": 45.0,
        "map_y": 28.0,
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

CLUES: list[Clue] = [
    {
        "id": "clue_01",
        "text": "O Barreira estava na receção do Departamento de Eletrónica (DETI).",
        "category": "identity",
    },
    {
        "id": "clue_02",
        "text": "O Rodão esteve o tempo todo nas salas do Complexo Pedagógico.",
        "category": "identity",
    },
    {
        "id": "clue_03",
        "text": "O Varela, o verdadeiro culpado pelo ataque aos Aluviões, atuou no interior dos Laboratórios do DETI.",
        "category": "identity",
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
        "text": "O Panças estava confortavelmente sentado no Auditório Renato Araújo.",
        "category": "identity",
    },
    {
        "id": "clue_09",
        "text": "O Machado esteve em silêncio absoluto na Biblioteca Universitária.",
        "category": "identity",
    },
    {
        "id": "clue_10",
        "text": "O Cálix esteve a relaxar na relva perto do Catavento no Relvado Central.",
        "category": "identity",
    },
    {
        "id": "clue_11",
        "text": "A Mariana estava a resolver equações diferenciais no Departamento de Matemática (DMAT).",
        "category": "identity",
    },
    {
        "id": "clue_12",
        "text": "ATENÇÃO: A vítima do crime foi o grupo de Aluviões. O responsável direto pelo ato foi o Varela!",
        "category": "exclusion",
    },
]

# ─── REWARD ───────────────────────────────────────────────────────────────────

REWARD: Reward = {
    "type": "coordinates",
    "title": "CASO RESOLVIDO — CRIME NA FAINA DETI",
    "content": "40.630541, -8.657858",
    "subtitle": "Universidade de Aveiro — DETI\n\"Desmascaraste o Varela e salvaste a honra dos Aluviões!\"\n\n[O Estandarte e a Praxe do DETI estão a salvo.]",
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
