"""
MURDOKU — Topographic Spatial Grid Game Configuration
12 Characters (11 Comissão de Faina + 1 Vítima Aluvião)
Locais UA: AUTOCARRO BAR, DETI, BIBLIOTECA, CUA, PRAÇA, DRINKS, DESCONHECIDO
Objetos: CD, T-shirt Aluvião, Computador, Tanga/Boxer, Caneca, Garrafa
═══════════════════════════════════════════════════════════════════════════════
"""

from typing import TypedDict


# ─── TYPES ────────────────────────────────────────────────────────────────────

class Character(TypedDict):
    id: str
    name: str
    nickname: str
    role: str  # "comissao" | "aluviao"
    description: str
    traits: str  # e.g. "Barba, óculos, capa"
    clue_hint: str
    image: str


class RoomZone(TypedDict):
    id: str
    name: str
    color: str
    accent: str
    description: str


class GridCellConfig(TypedDict):
    id: str
    x: int
    y: int
    zone_id: str
    terrain: str  # "walkable" | "object" | "blocked"
    object_type: str | None  # "cd" | "tshirt_aluviao" | "computador" | "boxer" | "caneca" | "garrafa"
    has_carpet: bool


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
    category: str


class Solution(TypedDict):
    placement: dict[str, str]  # char_id -> cell_id (e.g. "8_1")


class Reward(TypedDict):
    type: str
    title: str
    content: str
    subtitle: str


class GameConfig(TypedDict):
    characters: list[Character]
    rooms: list[RoomZone]
    grid: list[GridCellConfig]
    locations: list[Location]
    clues: list[Clue]
    solution: Solution
    reward: Reward
    max_attempts: int


# ─── ROOM ZONES (6 Locais Oficiais da UA + Local DESCONHECIDO) ────────────────

ROOMS: list[RoomZone] = [
    {
        "id": "autocarro_bar",
        "name": "AUTOCARRO BAR",
        "color": "#06B6D4",
        "accent": "rgba(6, 182, 212, 0.25)",
        "description": "Autocarro icónico da UA — Cerveja fresca e música académica",
    },
    {
        "id": "deti",
        "name": "DETI",
        "color": "#3B82F6",
        "accent": "rgba(59, 130, 246, 0.25)",
        "description": "Departamento de Eletrónica, Telecomunicações e Informática",
    },
    {
        "id": "biblioteca",
        "name": "BIBLIOTECA",
        "color": "#6366F1",
        "accent": "rgba(99, 102, 241, 0.25)",
        "description": "Biblioteca Universitária de Siza Vieira — Silêncio e estudo",
    },
    {
        "id": "cua",
        "name": "CUA",
        "color": "#EF4444",
        "accent": "rgba(239, 68, 68, 0.25)",
        "description": "Cantina e Centro Universitário de Aveiro — Almoço e refeições",
    },
    {
        "id": "praca",
        "name": "PRAÇA",
        "color": "#10B981",
        "accent": "rgba(16, 185, 129, 0.25)",
        "description": "Praça Central do Campus — Ponto de encontro de praxe",
    },
    {
        "id": "drinks",
        "name": "DRINKS",
        "color": "#F59E0B",
        "accent": "rgba(245, 158, 11, 0.25)",
        "description": "Zona de bebidas e convívio dos estudantes da Faina",
    },
    {
        "id": "desconhecido",
        "name": "DESCONHECIDO",
        "color": "#BE185D",
        "accent": "rgba(190, 24, 93, 0.35)",
        "description": "CENA DO CRIME — Onde o Aluvião foi atacado e ponto de encontro da Faina!",
    },
]


# ─── 12x12 SPATIAL GRID GENERATION (Regra Murdoku: Linha e Coluna Únicas) ───────

def build_grid() -> list[GridCellConfig]:
    cells: list[GridCellConfig] = []
    
    # Specified Object Locations (x, y)
    object_map: dict[tuple[int, int], str] = {
        (2, 0): "computador",      # DETI (adjacent to Barreira at 1,0)
        (0, 3): "tshirt_aluviao",  # BIBLIOTECA (adjacent to Rita at 0,4)
        (4, 5): "cd",              # PRAÇA (adjacent to Inês at 4,6)
        (7, 7): "boxer",           # PRAÇA (adjacent to Sid at 7,8)
        (8, 9): "garrafa",         # DRINKS (adjacent to Cálix at 9,9)
        (9, 11): "caneca",         # AUTOCARRO BAR (adjacent to Panças at 10,11)
        (9, 1): "computador",      # DESCONHECIDO (terminal de pistas)
    }
    
    carpet_cells = {(6, 7)}  # Tapete de comando na Praça
    
    blocked_cells = {
        (6, 0), (6, 1), (6, 2), (6, 3),  # Parede entre DETI e DESCONHECIDO
        (0, 2), (4, 9), (7, 10),          # Pilares estruturais
    }

    def get_zone(x: int, y: int) -> str:
        if y <= 3:
            if x <= 5: return "deti"
            else: return "desconhecido"
        elif y <= 8:
            if x <= 3: return "biblioteca"
            elif x >= 8: return "drinks"
            else: return "praca"
        else: # y >= 9
            if x >= 8 and y == 9: return "drinks"
            elif x <= 5: return "cua"
            else: return "autocarro_bar"

    for y in range(12):
        for x in range(12):
            cell_id = f"{x}_{y}"
            zone_id = get_zone(x, y)
            
            if (x, y) in blocked_cells:
                terrain = "blocked"
                obj = None
            elif (x, y) in object_map:
                terrain = "object"
                obj = object_map[(x, y)]
            else:
                terrain = "walkable"
                obj = None
                
            cells.append({
                "id": cell_id,
                "x": x,
                "y": y,
                "zone_id": zone_id,
                "terrain": terrain,
                "object_type": obj,
                "has_carpet": (x, y) in carpet_cells,
            })
            
    return cells

GRID_CELLS = build_grid()


# ─── CHARACTERS (11 Membros da Comissão + 1 Aluvião Vítima) ───────────────────

CHARACTERS: list[Character] = [
    {
        "id": "barreira",
        "name": "Barreira",
        "nickname": "Barreira",
        "role": "comissao",
        "description": "Veterano do DETI.",
        "traits": "Barba, sem óculos",
        "clue_hint": "Estive no DETI a programar colado ao terminal do computador.",
        "image": "character-01.webp",
    },
    {
        "id": "mariana",
        "name": "Mariana",
        "nickname": "Mariana",
        "role": "comissao",
        "description": "Comissão de Faina (Aluna exemplar).",
        "traits": "Sem óculos, sem barba",
        "clue_hint": "Supervisionava a entrada do DETI longe dos computadores.",
        "image": "character-11.webp",
    },
    {
        "id": "rodao",
        "name": "Rodão",
        "nickname": "Rodão",
        "role": "comissao",
        "description": "Comissão de Faina.",
        "traits": "Óculos, sem barba",
        "clue_hint": "Almocei sozinho e descansado no CUA com a minha bandeja.",
        "image": "character-02.webp",
    },
    {
        "id": "rita",
        "name": "Rita",
        "nickname": "Rita",
        "role": "comissao",
        "description": "Comissão de Faina.",
        "traits": "Sem óculos, sem barba",
        "clue_hint": "Encontrei uma T-shirt rasgada do Aluvião na Biblioteca!",
        "image": "character-06.webp",
    },
    {
        "id": "machado",
        "name": "Machado",
        "nickname": "Machado",
        "role": "comissao",
        "description": "Comissão de Faina.",
        "traits": "Óculos, sem barba",
        "clue_hint": "Passei a tarde em silêncio absoluto na Biblioteca a estudar.",
        "image": "character-09.webp",
    },
    {
        "id": "xuta",
        "name": "Xuta",
        "nickname": "Xuta",
        "role": "comissao",
        "description": "Comissão de Faina.",
        "traits": "Sem óculos, sem barba",
        "clue_hint": "Comandei a reunião da Faina de pé sobre o tapete da Praça.",
        "image": "character-07.webp",
    },
    {
        "id": "ines",
        "name": "Inês",
        "nickname": "Inês",
        "role": "comissao",
        "description": "Comissão de Faina.",
        "traits": "Sem óculos, sem barba",
        "clue_hint": "Estive na Praça a examinar um CD de música académica.",
        "image": "character-04.webp",
    },
    {
        "id": "sid",
        "name": "Sid",
        "nickname": "Sid",
        "role": "comissao",
        "description": "Comissão de Faina.",
        "traits": "Barba, sem óculos",
        "clue_hint": "Tropecei numa tanga/boxer caída no chão da Praça.",
        "image": "character-05.webp",
    },
    {
        "id": "pancas",
        "name": "Panças",
        "nickname": "Panças",
        "role": "comissao",
        "description": "Comissão de Faina.",
        "traits": "Sem óculos, sem barba",
        "clue_hint": "Não saí do Autocarro Bar: estive sempre encostado à caneca de cerveja.",
        "image": "character-08.webp",
    },
    {
        "id": "calix",
        "name": "Cálix",
        "nickname": "Cálix",
        "role": "comissao",
        "description": "Comissão de Faina.",
        "traits": "Sem óculos, sem barba",
        "clue_hint": "Passei o convívio no Drinks ao lado da garrafa a celebrar.",
        "image": "character-10.webp",
    },
    {
        "id": "aluviao",
        "name": "Aluvião",
        "nickname": "Aluvião",
        "role": "aluviao",
        "description": "O Caloiro / Vítima da Faina.",
        "traits": "Caloiro, sem capa, Vítima",
        "clue_hint": "A VÍTIMA. Fui emboscado e arrastado para uma sala secreta...",
        "image": "character-12.webp",
    },
    {
        "id": "varela",
        "name": "Varela",
        "nickname": "Varela",
        "role": "comissao",
        "description": "Comissão de Faina reservado.",
        "traits": "Barba, sem óculos, Capa negra",
        "clue_hint": "Ninguém me viu nos sítios habituais do campus...",
        "image": "character-03.webp",
    },
]


# ─── LOCATIONS (Mapped to 2D Spatial Cell IDs) ────────────────────────────────

LOCATIONS: list[Location] = [
    {"id": "1_0", "name": "DETI (Terminal de Computador)", "short_name": "DETI (Computador)", "description": "Célula (1,0)", "icon": "💻", "map_x": 10, "map_y": 0},
    {"id": "5_1", "name": "DETI (Entrada Gabinetes)", "short_name": "DETI (Entrada)", "description": "Célula (5,1)", "icon": "🏛️", "map_x": 50, "map_y": 10},
    {"id": "0_4", "name": "BIBLIOTECA (Junto à T-shirt)", "short_name": "BIBLIOTECA (Tshirt)", "description": "Célula (0,4)", "icon": "👕", "map_x": 0, "map_y": 40},
    {"id": "2_5", "name": "BIBLIOTECA (Cabine de Estudo)", "short_name": "BIBLIOTECA (Mesa)", "description": "Célula (2,5)", "icon": "📚", "map_x": 20, "map_y": 50},
    {"id": "4_6", "name": "PRAÇA (Junto ao CD)", "short_name": "PRAÇA (CD)", "description": "Célula (4,6)", "icon": "💿", "map_x": 40, "map_y": 60},
    {"id": "6_7", "name": "PRAÇA (Tapete Central)", "short_name": "PRAÇA (Tapete)", "description": "Célula (6,7)", "icon": "🧶", "map_x": 60, "map_y": 70},
    {"id": "7_8", "name": "PRAÇA (Tanga/Boxer Perdida)", "short_name": "PRAÇA (Boxer)", "description": "Célula (7,8)", "icon": "🩲", "map_x": 70, "map_y": 80},
    {"id": "9_9", "name": "DRINKS (Mesa da Garrafa)", "short_name": "DRINKS", "description": "Célula (9,9)", "icon": "🍾", "map_x": 90, "map_y": 90},
    {"id": "3_10", "name": "CUA (Mesa de Almoço)", "short_name": "CUA (Refeitório)", "description": "Célula (3,10)", "icon": "🍽️", "map_x": 30, "map_y": 100},
    {"id": "10_11", "name": "AUTOCARRO BAR (Balcão)", "short_name": "AUTOCARRO BAR", "description": "Célula (10,11)", "icon": "🍺", "map_x": 100, "map_y": 110},
    {"id": "11_3", "name": "DESCONHECIDO (A Vítima)", "short_name": "DESCONHECIDO (Vítima)", "description": "Célula (11,3)", "icon": "🎯", "map_x": 110, "map_y": 30},
    {"id": "8_2", "name": "DESCONHECIDO (O Agressor)", "short_name": "DESCONHECIDO (Crime)", "description": "Célula (8,2)", "icon": "❓", "map_x": 80, "map_y": 20},
]


# ─── SOLUTION (Exact 12 Character Murdoku Placement: Unique Rows & Cols) ───────

SOLUTION: Solution = {
    "placement": {
        "barreira": "1_0",
        "mariana": "5_1",
        "rita": "0_4",
        "machado": "2_5",
        "ines": "4_6",
        "xuta": "6_7",
        "sid": "7_8",
        "calix": "9_9",
        "rodao": "3_10",
        "pancas": "10_11",
        "aluviao": "11_3",
        "varela": "8_2",
    }
}


# ─── CLUES (Dedução Lógica e Desafiante no estilo Murdle/Murdoku) ──────────────

CLUES: list[Clue] = [
    {
        "id": "clue_01",
        "text": "No DETI encontravam-se apenas duas pessoas da comissão: um veterano com barba que operava o Computador, e uma mulher que geria a entrada oposta.",
        "category": "position",
    },
    {
        "id": "clue_02",
        "text": "O refeitório da Cantina (CUA) tinha apenas uma pessoa a almoçar calmamente à mesa, e essa pessoa usava óculos.",
        "category": "identity",
    },
    {
        "id": "clue_03",
        "text": "Na BIBLIOTECA estavam duas pessoas: o Machado lia em silêncio absoluto com os seus óculos, enquanto uma mulher sem barba nem óculos descobriu a T-shirt rasgada do Aluvião.",
        "category": "identity",
    },
    {
        "id": "clue_04",
        "text": "Na PRAÇA central estavam exatamente três membros: um membro no tapete central, uma mulher que examinava um CD de música académica, e um membro com barba.",
        "category": "position",
    },
    {
        "id": "clue_05",
        "text": "O Sid tropeçou embaraçado numa tanga/boxer caída no chão da PRAÇA.",
        "category": "identity",
    },
    {
        "id": "clue_06",
        "text": "O Panças não esteve em mais lado nenhum: passou o serão no AUTOCARRO BAR, sozinho e encostado a uma caneca bem fresca.",
        "category": "identity",
    },
    {
        "id": "clue_07",
        "text": "O Cálix esteve a brindar sozinho na zona de convívio dos DRINKS, ao lado de uma garrafa.",
        "category": "identity",
    },
    {
        "id": "clue_08",
        "text": "O Aluvião (a vítima) foi emboscado e arrastado até ao local DESCONHECIDO, na extremidade da sala.",
        "category": "identity",
    },
    {
        "id": "clue_09",
        "text": "REGRA MURDOKU: Em todo o mapa, ao posicionares um suspeito, toda a sua linha e toda a sua coluna ficam bloqueadas com ✕ (máximo de 1 suspeito por linha e por coluna).",
        "category": "exclusion",
    },
    {
        "id": "clue_10",
        "text": "CRIME SCENE: Apenas DUAS pessoas estavam no local DESCONHECIDO no momento do ataque — a vítima (Aluvião) e o agressor da Faina com barba e capa negra. Descobre quem sobra da comissão para revelar onde os Aluviões têm de ir ter à Faina!",
        "category": "position",
    },
]


# ─── REWARD ───────────────────────────────────────────────────────────────────

REWARD: Reward = {
    "type": "coordinates",
    "title": "CASO RESOLVIDO — LOCAL DA FAINA REVELADO!",
    "content": "40.630541, -8.657858",
    "subtitle": "Universidade de Aveiro — Faina DETI\n\"Desmascaraste o Varela! O local DESCONHECIDO foi identificado!\"\n\n[Aluviões: Dirijam-se a este local agora mesmo para a Faina!]",
}


# ─── GAME CONFIG ──────────────────────────────────────────────────────────────

GAME_CONFIG: GameConfig = {
    "characters": CHARACTERS,
    "rooms": ROOMS,
    "grid": GRID_CELLS,
    "locations": LOCATIONS,
    "clues": CLUES,
    "solution": SOLUTION,
    "reward": REWARD,
    "max_attempts": 3,
}

