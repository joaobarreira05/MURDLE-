"""
MURDOKU — Topographic Spatial Grid Game Configuration
UA Faina Edition: AUTOCARRO BAR, DETI, BIBLIOTECA, CUA, PRAÇA, DRINKS, DESCONHECIDO
═══════════════════════════════════════════════════════════════════════════════
"""

from typing import TypedDict


# ─── TYPES ────────────────────────────────────────────────────────────────────

class Character(TypedDict):
    id: str
    name: str
    nickname: str
    description: str
    clue_hint: str
    image: str


class RoomZone(TypedDict):
    id: str
    name: str
    color: str
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


# ─── ROOM ZONES (Locais Solicitados da UA + Local DESCONHECIDO) ────────────────

ROOMS: list[RoomZone] = [
    {"id": "autocarro_bar", "name": "AUTOCARRO BAR", "color": "#06B6D4", "description": "Ponto de encontro mítico no campus"},
    {"id": "deti", "name": "DETI", "color": "#3B82F6", "description": "Departamento de Eletrónica, Telecomunicações e Informática"},
    {"id": "biblioteca", "name": "BIBLIOTECA", "color": "#6366F1", "description": "Biblioteca Universitária da UA"},
    {"id": "cua", "name": "CUA", "color": "#EF4444", "description": "Cantina e Centro Universitário de Aveiro"},
    {"id": "praca", "name": "PRAÇA", "color": "#10B981", "description": "Praça central do campus universitário"},
    {"id": "drinks", "name": "DRINKS", "color": "#F59E0B", "description": "Bar / Ponto de bebidas dos estudantes"},
    {"id": "desconhecido", "name": "DESCONHECIDO", "color": "#BE185D", "description": "LOCAL SECRETO — Cena do Crime & Ponto da Faina"},
]


# ─── 10x10 SPATIAL GRID GENERATION (Objetos: CD, T-shirt Aluvião, Computador, Boxer, etc.) ────

def build_grid() -> list[GridCellConfig]:
    cells: list[GridCellConfig] = []
    
    # Specified Objects Mapping (x, y)
    object_map: dict[tuple[int, int], str] = {
        (2, 1): "computador",      # DETI
        (5, 4): "cd",              # PRAÇA
        (1, 4): "tshirt_aluviao",  # BIBLIOTECA
        (4, 5): "boxer",           # PRAÇA
        (7, 8): "caneca",          # AUTOCARRO BAR
        (8, 4): "garrafa",         # DRINKS
        (8, 0): "computador",      # DESCONHECIDO
    }
    
    carpet_cells = {(4, 4), (5, 4), (4, 5)}
    
    blocked_cells = {
        (0, 2), (5, 2), (5, 3),
        (3, 7), (6, 7),
        (6, 0), (6, 1), (6, 2),
    }

    for y in range(10):
        for x in range(10):
            cell_id = f"{x}_{y}"
            
            # Map zones across the 10x10 grid:
            # y <= 2, x >= 6 -> DESCONHECIDO (Local secreto do crime)
            # y <= 2, x < 6  -> DETI
            # y 3..6, x <= 3 -> BIBLIOTECA
            # y 3..6, x 4..6 -> PRAÇA
            # y 3..6, x >= 7 -> DRINKS
            # y >= 7, x <= 4 -> CUA
            # y >= 7, x >= 5 -> AUTOCARRO BAR
            
            if y <= 2 and x >= 6:
                zone_id = "desconhecido"
            elif y <= 2:
                zone_id = "deti"
            elif y >= 7 and x <= 4:
                zone_id = "cua"
            elif y >= 7:
                zone_id = "autocarro_bar"
            elif x <= 3:
                zone_id = "biblioteca"
            elif x >= 7:
                zone_id = "drinks"
            else:
                zone_id = "praca"
                
            # Terrain
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


# ─── CHARACTERS (11 Suspeitos com Pistas Temáticas) ───────────────────────────

CHARACTERS: list[Character] = [
    {
        "id": "barreira",
        "name": "Barreira",
        "nickname": "Barreira",
        "description": "Veterano da Faina.",
        "clue_hint": "Ele estava no DETI ao lado de um computador.",
        "image": "character-01.webp",
    },
    {
        "id": "rodao",
        "name": "Rodão",
        "nickname": "Rodão",
        "description": "Membro da comissão.",
        "clue_hint": "Ele estava no CUA a almoçar tranquilamente.",
        "image": "character-02.webp",
    },
    {
        "id": "varela",
        "name": "Varela",
        "nickname": "Varela",
        "description": "Estudante reservado.",
        "clue_hint": "Ele esteve sozinho com a vítima num local misterioso.",
        "image": "character-03.webp",
    },
    {
        "id": "ines",
        "name": "Inês",
        "nickname": "Inês",
        "description": "Estudante de informática.",
        "clue_hint": "Ela estava na PRAÇA ao lado de um CD de música.",
        "image": "character-04.webp",
    },
    {
        "id": "sid",
        "name": "Sid",
        "nickname": "Sid",
        "description": "Viciado em café e convívio.",
        "clue_hint": "Ele estava na PRAÇA ao lado de uma tanga / boxer deixada no chão.",
        "image": "character-05.webp",
    },
    {
        "id": "rita",
        "name": "Rita",
        "nickname": "Rita",
        "description": "Membro da organização.",
        "clue_hint": "Ela estava na BIBLIOTECA ao lado de uma T-shirt de Aluvião.",
        "image": "character-06.webp",
    },
    {
        "id": "xuta",
        "name": "Xuta",
        "nickname": "Xuta",
        "description": "Líder enérgico da Faina.",
        "clue_hint": "Ele estava na PRAÇA sobre o tapete central.",
        "image": "character-07.webp",
    },
    {
        "id": "pancas",
        "name": "Panças",
        "nickname": "Panças",
        "description": "Apreciador de cerveja fresca.",
        "clue_hint": "Ele estava no AUTOCARRO BAR ao lado de uma caneca.",
        "image": "character-08.webp",
    },
    {
        "id": "machado",
        "name": "Machado",
        "nickname": "Machado",
        "description": "Silencioso e observador.",
        "clue_hint": "Ele estava na BIBLIOTECA a estudar silenciosamente.",
        "image": "character-09.webp",
    },
    {
        "id": "calix",
        "name": "Cálix",
        "nickname": "Cálix",
        "description": "Gosta de festejar.",
        "clue_hint": "Ele estava no DRINKS ao lado de uma garrafa.",
        "image": "character-10.webp",
    },
    {
        "id": "mariana",
        "name": "Mariana",
        "nickname": "Mariana",
        "description": "A vítima (Aluvião).",
        "clue_hint": "A vítima. Foi atraída para o local DESCONHECIDO e estava com o atacante.",
        "image": "character-11.webp",
    },
]


# ─── LOCATIONS (Mapped to 2D Spatial Cell IDs) ────────────────────────────────

LOCATIONS: list[Location] = [
    {"id": "2_2", "name": "DETI (Computador)", "short_name": "DETI (PC)", "description": "Célula (2,2)", "icon": "💻", "map_x": 20, "map_y": 20},
    {"id": "2_8", "name": "CUA (Refeitório)", "short_name": "CUA", "description": "Célula (2,8)", "icon": "🍽️", "map_x": 20, "map_y": 80},
    {"id": "8_1", "name": "DESCONHECIDO (Crime)", "short_name": "DESCONHECIDO", "description": "Célula (8,1)", "icon": "❓", "map_x": 80, "map_y": 10},
    {"id": "5_5", "name": "PRAÇA (CD)", "short_name": "PRAÇA (CD)", "description": "Célula (5,5)", "icon": "💿", "map_x": 50, "map_y": 50},
    {"id": "4_6", "name": "PRAÇA (Boxer)", "short_name": "PRAÇA (Boxer)", "description": "Célula (4,6)", "icon": "🩲", "map_x": 40, "map_y": 60},
    {"id": "1_3", "name": "BIBLIOTECA (T-shirt)", "short_name": "BIBLIOTECA (Tshirt)", "description": "Célula (1,3)", "icon": "👕", "map_x": 10, "map_y": 30},
    {"id": "4_4", "name": "PRAÇA (Tapete)", "short_name": "PRAÇA (Tapete)", "description": "Célula (4,4)", "icon": "🧶", "map_x": 40, "map_y": 40},
    {"id": "7_9", "name": "AUTOCARRO BAR (Caneca)", "short_name": "AUTOCARRO BAR", "description": "Célula (7,9)", "icon": "🍺", "map_x": 70, "map_y": 90},
    {"id": "2_4", "name": "BIBLIOTECA (Estudo)", "short_name": "BIBLIOTECA", "description": "Célula (2,4)", "icon": "📚", "map_x": 20, "map_y": 40},
    {"id": "8_5", "name": "DRINKS (Garrafa)", "short_name": "DRINKS", "description": "Célula (8,5)", "icon": "🍾", "map_x": 80, "map_y": 50},
    {"id": "8_2", "name": "DESCONHECIDO (Vítima)", "short_name": "DESCONHECIDO (Aluvião)", "description": "Célula (8,2)", "icon": "🎯", "map_x": 80, "map_y": 20},
]


# ─── SOLUTION (Exact Spatial Cell Placement) ──────────────────────────────────

SOLUTION: Solution = {
    "placement": {
        "barreira": "2_2",
        "rodao": "2_8",
        "varela": "8_1",
        "ines": "5_5",
        "sid": "4_6",
        "rita": "1_3",
        "xuta": "4_4",
        "pancas": "7_9",
        "machado": "2_4",
        "calix": "8_5",
        "mariana": "8_2",
    }
}


# ─── CLUES ────────────────────────────────────────────────────────────────────

CLUES: list[Clue] = [
    {
        "id": "clue_01",
        "text": "O Barreira estava no DETI posicionado ao lado do computador.",
        "category": "identity",
    },
    {
        "id": "clue_02",
        "text": "O Rodão encontrava-se no CUA a almoçar calmamente.",
        "category": "identity",
    },
    {
        "id": "clue_03",
        "text": "A Inês estava na PRAÇA, exatamente ao lado de um CD de música académica.",
        "category": "identity",
    },
    {
        "id": "clue_04",
        "text": "O Sid estava na PRAÇA ao lado de uma tanga / boxer que caiu no chão.",
        "category": "identity",
    },
    {
        "id": "clue_05",
        "text": "A Rita estava na BIBLIOTECA ao lado da T-shirt de Aluvião deixada na mesa.",
        "category": "identity",
    },
    {
        "id": "clue_06",
        "text": "O Xuta estava sobre o tapete central na PRAÇA.",
        "category": "identity",
    },
    {
        "id": "clue_07",
        "text": "O Panças estava no AUTOCARRO BAR mesmo ao lado de uma caneca.",
        "category": "identity",
    },
    {
        "id": "clue_08",
        "text": "O Machado estava na BIBLIOTECA focado em estudar em silêncio.",
        "category": "identity",
    },
    {
        "id": "clue_09",
        "text": "O Cálix estava no DRINKS ao lado de uma garrafa.",
        "category": "identity",
    },
    {
        "id": "clue_10",
        "text": "A Mariana (Aluvião) foi atraída para o local DESCONHECIDO.",
        "category": "identity",
    },
    {
        "id": "clue_11",
        "text": "CRIME SCENE: Apenas duas pessoas estavam no local DESCONHECIDO no momento do ataque: a vítima e o assassino. Descobre o assassino para revelar onde os Aluviões têm de ir ter à Faina!",
        "category": "position",
    },
]


# ─── REWARD ───────────────────────────────────────────────────────────────────

REWARD: Reward = {
    "type": "coordinates",
    "title": "CASO RESOLVIDO — LOCAL DA FAINA REVELADO!",
    "content": "40.630541, -8.657858",
    "subtitle": "Universidade de Aveiro — Faina DETI\n\"Desmascaraste o Varela! O local DESCONHECIDO é o ponto de encontro secreto!\"\n\n[Aluviões: Dirijam-se a este local agora mesmo para a Faina!]",
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
