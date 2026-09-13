"""
MURDOKU — Topographic Spatial Grid Game Configuration (DETI UA IT Edition)
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
    object_type: str | None  # "servidor" | "terminal" | "pendrive" | "gpu" | "router" | "multimetro"
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
    placement: dict[str, str]  # char_id -> cell_id (e.g. "8_5")


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


# ─── ROOM ZONES (6 Locais Reais da UA) ─────────────────────────────────────────

ROOMS: list[RoomZone] = [
    {"id": "deti", "name": "DETI", "color": "#EC4899", "description": "Departamento de Eletrónica — CRIME SCENE"},
    {"id": "cua", "name": "CUA", "color": "#EF4444", "description": "Cantina de Santiago & Refeitório"},
    {"id": "biblioteca", "name": "BIBLIOTECA", "color": "#3B82F6", "description": "Biblioteca Universitária da UA"},
    {"id": "dmat", "name": "DMAT", "color": "#A855F7", "description": "Departamento de Matemática"},
    {"id": "comp_pedagogico", "name": "COMPLEXO PEDAGÓGICO", "color": "#6366F1", "description": "Blocos de Aulas Teóricas"},
    {"id": "bar", "name": "BAR", "color": "#06B6D4", "description": "Bar dos Estudantes & Café"},
]


# ─── 10x10 SPATIAL GRID GENERATION (IT / Computer Engineering Objects) ─────────

def build_grid() -> list[GridCellConfig]:
    cells: list[GridCellConfig] = []
    
    # IT / Computer Science Objects Mapping (x, y)
    object_map: dict[tuple[int, int], str] = {
        (8, 4): "servidor",
        (3, 4): "terminal",
        (4, 5): "gpu",
        (0, 2): "router",
        (3, 2): "pendrive",
        (0, 8): "multimetro",
        (5, 1): "servidor",
        (7, 8): "terminal",
    }
    
    carpet_cells = {(2, 5), (3, 5), (4, 5)}
    
    blocked_cells = {
        (0, 3), (1, 3), (4, 3), (5, 3),
        (3, 0), (4, 0),
        (6, 4), (6, 5),
    }

    for y in range(10):
        for x in range(10):
            cell_id = f"{x}_{y}"
            
            # Determine Zone among the 6 UA Locations: DETI, CUA, BIBLIOTECA, DMAT, COMPLEXO PEDAGÓGICO, BAR
            if y <= 1 and x >= 5:
                zone_id = "deti"  # DETI (Crime Scene)
            elif y <= 3 and x <= 3:
                zone_id = "biblioteca"  # BIBLIOTECA
            elif y >= 7 and x <= 4:
                zone_id = "cua"  # CUA
            elif y >= 7 and x >= 5:
                zone_id = "bar"  # BAR
            elif x >= 7 and y >= 4 and y <= 6:
                zone_id = "dmat"  # DMAT
            else:
                zone_id = "comp_pedagogico"  # COMPLEXO PEDAGÓGICO
                
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


# ─── CHARACTERS (11 Suspeitos com Pistas de Informática) ─────────────────────

CHARACTERS: list[Character] = [
    {
        "id": "barreira",
        "name": "Barreira",
        "nickname": "Barreira",
        "description": "Veterano de informática.",
        "clue_hint": "Ele estava no DMAT ao lado do servidor de cálculo.",
        "image": "character-01.webp",
    },
    {
        "id": "rodao",
        "name": "Rodão",
        "nickname": "Rodão",
        "description": "Membro da comissão.",
        "clue_hint": "Ele estava no CUA num lugar de chão livre a almoçar.",
        "image": "character-02.webp",
    },
    {
        "id": "varela",
        "name": "Varela",
        "nickname": "Varela",
        "description": "Estudante reservado do DETI.",
        "clue_hint": "Ele estava sozinho com a vítima no DETI perto do servidor principal.",
        "image": "character-03.webp",
    },
    {
        "id": "ines",
        "name": "Inês",
        "nickname": "Inês",
        "description": "Desenvolvedora de software.",
        "clue_hint": "Ela estava no Complexo Pedagógico ao lado de um terminal de código.",
        "image": "character-04.webp",
    },
    {
        "id": "sid",
        "name": "Sid",
        "nickname": "Sid",
        "description": "Engenheiro de hardware.",
        "clue_hint": "Ele estava a testar uma GPU no Complexo Pedagógico.",
        "image": "character-05.webp",
    },
    {
        "id": "rita",
        "name": "Rita",
        "nickname": "Rita",
        "description": "Especialista em redes.",
        "clue_hint": "Ela estava na Biblioteca ao lado do router de Wi-Fi.",
        "image": "character-06.webp",
    },
    {
        "id": "xuta",
        "name": "Xuta",
        "nickname": "Xuta",
        "description": "Líder enérgico.",
        "clue_hint": "Ele estava sobre o tapete de circuitos no Complexo Pedagógico.",
        "image": "character-07.webp",
    },
    {
        "id": "pancas",
        "name": "Panças",
        "nickname": "Panças",
        "description": "Gosta de café.",
        "clue_hint": "Ele estava no BAR posicionado ao lado do multímetro de bancada.",
        "image": "character-08.webp",
    },
    {
        "id": "machado",
        "name": "Machado",
        "nickname": "Machado",
        "description": "Administrador de sistemas.",
        "clue_hint": "Ele estava na Biblioteca ao lado de uma pen drive com backups.",
        "image": "character-09.webp",
    },
    {
        "id": "calix",
        "name": "Cálix",
        "nickname": "Cálix",
        "description": "Hacker ético.",
        "clue_hint": "Ele estava no BAR ao lado de um terminal de testes.",
        "image": "character-10.webp",
    },
    {
        "id": "mariana",
        "name": "Mariana",
        "nickname": "Mariana",
        "description": "A vítima do ataque (Aluviões).",
        "clue_hint": "A vítima. Estava sozinha no DETI com o assassino.",
        "image": "character-11.webp",
    },
]


# ─── LOCATIONS (Mapped to 2D Spatial Cell IDs) ────────────────────────────────

LOCATIONS: list[Location] = [
    {"id": "8_5", "name": "DMAT - Servidor de Cálculo", "short_name": "DMAT (Servidor)", "description": "Célula (8,5)", "icon": "🖥️", "map_x": 80, "map_y": 50},
    {"id": "2_8", "name": "CUA - Chão Livre", "short_name": "CUA (Refeitório)", "description": "Célula (2,8)", "icon": "🍽️", "map_x": 20, "map_y": 80},
    {"id": "8_1", "name": "DETI - Servidor Principal", "short_name": "DETI (Servidor)", "description": "Célula (8,1)", "icon": "💻", "map_x": 80, "map_y": 10},
    {"id": "3_5", "name": "Comp. Pedagógico - Terminal", "short_name": "CP (Terminal)", "description": "Célula (3,5)", "icon": "⌨️", "map_x": 30, "map_y": 50},
    {"id": "4_5", "name": "Comp. Pedagógico - GPU", "short_name": "CP (GPU)", "description": "Célula (4,5)", "icon": "⚡", "map_x": 40, "map_y": 50},
    {"id": "1_2", "name": "Biblioteca - Router Wi-Fi", "short_name": "Biblioteca (Router)", "description": "Célula (1,2)", "icon": "📶", "map_x": 10, "map_y": 20},
    {"id": "2_5", "name": "Comp. Pedagógico - Tapete", "short_name": "CP (Tapete)", "description": "Célula (2,5)", "icon": "🧶", "map_x": 20, "map_y": 50},
    {"id": "0_8", "name": "BAR - Multímetro", "short_name": "BAR (Multímetro)", "description": "Célula (0,8)", "icon": "🔌", "map_x": 0, "map_y": 80},
    {"id": "2_2", "name": "Biblioteca - Pen Drive", "short_name": "Biblioteca (PenDrive)", "description": "Célula (2,2)", "icon": "💾", "map_x": 20, "map_y": 20},
    {"id": "7_8", "name": "BAR - Terminal de Testes", "short_name": "BAR (Terminal)", "description": "Célula (7,8)", "icon": "⌨️", "map_x": 70, "map_y": 80},
    {"id": "8_2", "name": "DETI - Zona de Testes", "short_name": "DETI (Vítima)", "description": "Célula (8,2)", "icon": "🎯", "map_x": 80, "map_y": 20},
]


# ─── SOLUTION (Exact Spatial Cell Placement) ──────────────────────────────────

SOLUTION: Solution = {
    "placement": {
        "barreira": "8_5",
        "rodao": "2_8",
        "varela": "8_1",
        "ines": "3_5",
        "sid": "4_5",
        "rita": "1_2",
        "xuta": "2_5",
        "pancas": "0_8",
        "machado": "2_2",
        "calix": "7_8",
        "mariana": "8_2",
    }
}


# ─── CLUES ────────────────────────────────────────────────────────────────────

CLUES: list[Clue] = [
    {
        "id": "clue_01",
        "text": "O Barreira estava no DMAT ao lado do servidor de cálculo.",
        "category": "identity",
    },
    {
        "id": "clue_02",
        "text": "O Rodão encontrava-se no CUA a almoçar no chão livre.",
        "category": "identity",
    },
    {
        "id": "clue_03",
        "text": "A Inês estava no Complexo Pedagógico ao lado do terminal de código.",
        "category": "identity",
    },
    {
        "id": "clue_04",
        "text": "O Sid estava a testar uma GPU no Complexo Pedagógico.",
        "category": "identity",
    },
    {
        "id": "clue_05",
        "text": "A Rita estava na Biblioteca ao lado do router de Wi-Fi.",
        "category": "identity",
    },
    {
        "id": "clue_06",
        "text": "O Xuta estava sobre o tapete de circuitos no Complexo Pedagógico.",
        "category": "identity",
    },
    {
        "id": "clue_07",
        "text": "O Panças estava no BAR ao lado do multímetro de bancada.",
        "category": "identity",
    },
    {
        "id": "clue_08",
        "text": "O Machado estava na Biblioteca ao lado de uma pen drive com ficheiros.",
        "category": "identity",
    },
    {
        "id": "clue_09",
        "text": "O Cálix estava no BAR junto ao terminal de testes.",
        "category": "identity",
    },
    {
        "id": "clue_10",
        "text": "A Mariana (vítima) estava no DETI na célula imediatamente ao lado do seu atacante.",
        "category": "identity",
    },
    {
        "id": "clue_11",
        "text": "CRIME SCENE: Apenas duas pessoas estavam no DETI: a vítima (Mariana) e o assassino (Varela).",
        "category": "position",
    },
]


# ─── REWARD ───────────────────────────────────────────────────────────────────

REWARD: Reward = {
    "type": "coordinates",
    "title": "CASO RESOLVIDO — O VARELA FOI DESMASCARADO NO DETI!",
    "content": "40.630541, -8.657858",
    "subtitle": "Universidade de Aveiro — DETI\n\"O Varela estava no DETI com a Mariana e atacou os Aluviões!\"\n\n[Posicionamento no DETI validado com sucesso!]",
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
