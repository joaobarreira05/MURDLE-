"""
MURDOKU — Topographic Spatial Grid Game Configuration
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
    object_type: str | None  # "mesa" | "tv" | "cadeira" | "tapete" | "estante" | "computador"
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


# ─── ROOM ZONES ───────────────────────────────────────────────────────────────

ROOMS: list[RoomZone] = [
    {"id": "sala_funcionarios", "name": "Sala dos Funcionários", "color": "#A855F7", "description": "Zona norte de acesso restrito"},
    {"id": "deposito", "name": "Depósito", "color": "#3B82F6", "description": "Armazém de equipamento e ficheiros"},
    {"id": "area_principal", "name": "Área Principal", "color": "#6366F1", "description": "Salão central do edifício"},
    {"id": "entrada", "name": "Entrada", "color": "#EF4444", "description": "Recepção e porta principal"},
    {"id": "sala_espera", "name": "Sala de Espera", "color": "#06B6D4", "description": "Atendimento e bancos de espera"},
    {"id": "labs_deti", "name": "Labs DETI", "color": "#EC4899", "description": "CRIME SCENE — Laboratório técnico"},
]


# ─── 10x10 SPATIAL GRID GENERATION ───────────────────────────────────────────

def build_grid() -> list[GridCellConfig]:
    cells: list[GridCellConfig] = []
    
    # Define objects and blocked walls mapping (x, y)
    object_map: dict[tuple[int, int], str] = {
        (8, 4): "mesa",
        (3, 4): "tv",
        (4, 5): "cadeira",
        (0, 2): "estante",
        (3, 2): "computador",
        (0, 8): "estante",
        (5, 1): "computador",
        (7, 8): "cadeira",
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
            
            # Determine Zone
            if y <= 1 and x >= 5:
                zone_id = "labs_deti" if x >= 7 else "sala_funcionarios"
            elif y <= 3 and x <= 3:
                zone_id = "deposito"
            elif y >= 7:
                zone_id = "sala_espera"
            elif x >= 7 and y >= 4 and y <= 6:
                zone_id = "entrada"
            else:
                zone_id = "area_principal"
                
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


# ─── CHARACTERS (11 Suspeitos) ────────────────────────────────────────────────

CHARACTERS: list[Character] = [
    {
        "id": "barreira",
        "name": "Barreira",
        "nickname": "Barreira",
        "description": "Veterano do DETI.",
        "clue_hint": "Ele estava ao lado da mesa na Entrada.",
        "image": "character-01.webp",
    },
    {
        "id": "rodao",
        "name": "Rodão",
        "nickname": "Rodão",
        "description": "Membro da comissão.",
        "clue_hint": "Ele estava na Sala de Espera num lugar sem objetos.",
        "image": "character-02.webp",
    },
    {
        "id": "varela",
        "name": "Varela",
        "nickname": "Varela",
        "description": "Estudante reservado.",
        "clue_hint": "Ele estava sozinho com a vítima nos Labs DETI.",
        "image": "character-03.webp",
    },
    {
        "id": "ines",
        "name": "Inês",
        "nickname": "Inês",
        "description": "Estudante de engenharia.",
        "clue_hint": "Ela estava ao lado de uma televisão.",
        "image": "character-04.webp",
    },
    {
        "id": "sid",
        "name": "Sid",
        "nickname": "Sid",
        "description": "Viciado em café.",
        "clue_hint": "Ele estava sentado em uma cadeira na Área Principal.",
        "image": "character-05.webp",
    },
    {
        "id": "rita",
        "name": "Rita",
        "nickname": "Rita",
        "description": "Amante de música.",
        "clue_hint": "Ela estava no Depósito ao lado de uma estante.",
        "image": "character-06.webp",
    },
    {
        "id": "xuta",
        "name": "Xuta",
        "nickname": "Xuta",
        "description": "Líder enérgico.",
        "clue_hint": "Ele estava em um tapete na Área Principal.",
        "image": "character-07.webp",
    },
    {
        "id": "pancas",
        "name": "Panças",
        "nickname": "Panças",
        "description": "Gosta de sossego.",
        "clue_hint": "Ele estava ao lado da estante na Sala de Espera.",
        "image": "character-08.webp",
    },
    {
        "id": "machado",
        "name": "Machado",
        "nickname": "Machado",
        "description": "Silencioso.",
        "clue_hint": "Ele estava no Depósito ao lado de um computador.",
        "image": "character-09.webp",
    },
    {
        "id": "calix",
        "name": "Cálix",
        "nickname": "Cálix",
        "description": "Apreciador de tranquilidade.",
        "clue_hint": "Ele estava sozinho na Sala dos Funcionários.",
        "image": "character-10.webp",
    },
    {
        "id": "mariana",
        "name": "Mariana",
        "nickname": "Mariana",
        "description": "A vítima do ataque (Aluviões).",
        "clue_hint": "A vítima. Estava sozinha nos Labs DETI com o assassino.",
        "image": "character-11.webp",
    },
]


# ─── LOCATIONS (Mapped to 2D Spatial Cell IDs) ────────────────────────────────

LOCATIONS: list[Location] = [
    {"id": "8_5", "name": "Entrada - junto à Mesa", "short_name": "Entrada (Mesa)", "description": "Célula (8,5)", "icon": "🚪", "map_x": 80, "map_y": 50},
    {"id": "2_8", "name": "Sala de Espera - Lugar Livre", "short_name": "Espera (Livre)", "description": "Célula (2,8)", "icon": "🪑", "map_x": 20, "map_y": 80},
    {"id": "8_1", "name": "Labs DETI - Canto Técnico", "short_name": "Labs DETI (Norte)", "description": "Célula (8,1)", "icon": "🔬", "map_x": 80, "map_y": 10},
    {"id": "3_5", "name": "Área Principal - TV", "short_name": "Área Principal (TV)", "description": "Célula (3,5)", "icon": "📺", "map_x": 30, "map_y": 50},
    {"id": "4_5", "name": "Área Principal - Cadeira", "short_name": "Área Principal (Cadeira)", "description": "Célula (4,5)", "icon": "🪑", "map_x": 40, "map_y": 50},
    {"id": "1_2", "name": "Depósito - Estante", "short_name": "Depósito (Estante)", "description": "Célula (1,2)", "icon": "📦", "map_x": 10, "map_y": 20},
    {"id": "2_5", "name": "Área Principal - Tapete", "short_name": "Área Principal (Tapete)", "description": "Célula (2,5)", "icon": "🧶", "map_x": 20, "map_y": 50},
    {"id": "1_8", "name": "Sala de Espera - Estante", "short_name": "Espera (Estante)", "description": "Célula (1,8)", "icon": "📚", "map_x": 10, "map_y": 80},
    {"id": "2_2", "name": "Depósito - PC", "short_name": "Depósito (PC)", "description": "Célula (2,2)", "icon": "💻", "map_x": 20, "map_y": 20},
    {"id": "5_0", "name": "Sala dos Funcionários", "short_name": "Funcionários", "description": "Célula (5,0)", "icon": "💼", "map_x": 50, "map_y": 0},
    {"id": "8_2", "name": "Labs DETI - Zona de Teste", "short_name": "Labs DETI (Vítima)", "description": "Célula (8,2)", "icon": "🎯", "map_x": 80, "map_y": 20},
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
        "pancas": "1_8",
        "machado": "2_2",
        "calix": "5_0",
        "mariana": "8_2",
    }
}


# ─── CLUES ────────────────────────────────────────────────────────────────────

CLUES: list[Clue] = [
    {
        "id": "clue_01",
        "text": "O Barreira estava posicionado na Entrada, exatamente ao lado da mesa.",
        "category": "identity",
    },
    {
        "id": "clue_02",
        "text": "O Rodão encontrava-se na Sala de Espera num espaço de chão livre.",
        "category": "identity",
    },
    {
        "id": "clue_03",
        "text": "A Inês estava na Área Principal, imediatamente ao lado da televisão.",
        "category": "identity",
    },
    {
        "id": "clue_04",
        "text": "O Sid estava sentado na cadeira da Área Principal.",
        "category": "identity",
    },
    {
        "id": "clue_05",
        "text": "A Rita estava no Depósito, exatamente ao lado da estante de arrumação.",
        "category": "identity",
    },
    {
        "id": "clue_06",
        "text": "O Xuta estava sobre o tapete da Área Principal.",
        "category": "identity",
    },
    {
        "id": "clue_07",
        "text": "O Panças estava na Sala de Espera, posicionado ao lado da estante.",
        "category": "identity",
    },
    {
        "id": "clue_08",
        "text": "O Machado estava no Depósito, ao lado do computador de ficheiros.",
        "category": "identity",
    },
    {
        "id": "clue_09",
        "text": "O Cálix estava completamente sozinho na Sala dos Funcionários.",
        "category": "identity",
    },
    {
        "id": "clue_10",
        "text": "A Mariana (vítima) estava nos Labs DETI na célula imediatamente ao lado do seu atacante.",
        "category": "identity",
    },
    {
        "id": "clue_11",
        "text": "CRIME SCENE: Apenas duas pessoas estavam nos Labs DETI: a vítima (Mariana) e o assassino (Varela).",
        "category": "position",
    },
]


# ─── REWARD ───────────────────────────────────────────────────────────────────

REWARD: Reward = {
    "type": "coordinates",
    "title": "CASO RESOLVIDO — CRIME TOPOGRÁFICO RESISTIDO!",
    "content": "40.630541, -8.657858",
    "subtitle": "Universidade de Aveiro — DETI\n\"Deduciste com precisão espacial! O Varela estava nos Labs DETI com a Mariana e atacou os Aluviões!\"\n\n[Posicionamento espacial validado com sucesso!]",
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
