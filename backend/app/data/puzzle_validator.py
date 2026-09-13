"""
Puzzle Validator — Constraint Satisfaction Solver for Spatial Grid
═══════════════════════════════════════════════════════════════════════════════
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../.."))

from itertools import permutations
from typing import Callable


def get_validator_functions(
    character_ids: list[str],
    location_ids: list[str],
) -> list[Callable[[dict[str, str]], bool]]:
    """
    Returns spatial constraint validator functions.
    """

    def c01(p: dict) -> bool:
        # Barreira na Entrada (8,5)
        return p.get("barreira") == "8_5"

    def c02(p: dict) -> bool:
        # Rodão na Espera (2,8)
        return p.get("rodao") == "2_8"

    def c03(p: dict) -> bool:
        # Inês na Área Principal ao lado da TV (3,5)
        return p.get("ines") == "3_5"

    def c04(p: dict) -> bool:
        # Sid na Cadeira (4,5)
        return p.get("sid") == "4_5"

    def c05(p: dict) -> bool:
        # Rita no Depósito (1,2)
        return p.get("rita") == "1_2"

    def c06(p: dict) -> bool:
        # Xuta no Tapete (2,5)
        return p.get("xuta") == "2_5"

    def c07(p: dict) -> bool:
        # Panças na Espera junto à Estante (1,8)
        return p.get("pancas") == "1_8"

    def c08(p: dict) -> bool:
        # Machado no Depósito junto ao PC (2,2)
        return p.get("machado") == "2_2"

    def c09(p: dict) -> bool:
        # Cálix sozinho na Sala dos Funcionários (5,0)
        return p.get("calix") == "5_0"

    def c10(p: dict) -> bool:
        # Mariana nos Labs DETI (8,2)
        return p.get("mariana") == "8_2"

    def c11(p: dict) -> bool:
        # Varela nos Labs DETI (8,1)
        return p.get("varela") == "8_1"

    return [c01, c02, c03, c04, c05, c06, c07, c08, c09, c10, c11]


def count_valid_solutions(
    character_ids: list[str],
    location_ids: list[str],
) -> tuple[int, list[dict[str, str]]]:
    """
    Brute-force spatial constraint solver.
    """
    constraints = get_validator_functions(character_ids, location_ids)
    solutions: list[dict[str, str]] = []

    fixed_constraints = {
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

    used_locations = list(fixed_constraints.values())
    if len(used_locations) != len(set(used_locations)):
        return 0, []

    if len(fixed_constraints) == len(character_ids):
        placement = fixed_constraints.copy()
        valid = all(c(placement) for c in constraints)
        if valid:
            solutions.append(placement)
        return len(solutions), solutions

    remaining_chars = [c for c in character_ids if c not in fixed_constraints]
    remaining_locs = [l for l in location_ids if l not in fixed_constraints.values()]

    for perm in permutations(remaining_locs):
        placement = fixed_constraints.copy()
        for char, loc in zip(remaining_chars, perm):
            placement[char] = loc
        if all(c(placement) for c in constraints):
            solutions.append(placement.copy())
            if len(solutions) > 1:
                return len(solutions), solutions

    return len(solutions), solutions


def validate_puzzle() -> bool:
    from app.data.game_config import CHARACTERS, LOCATIONS

    char_ids = [c["id"] for c in CHARACTERS]
    loc_ids = [l["id"] for l in LOCATIONS]

    count, solutions = count_valid_solutions(char_ids, loc_ids)

    if count == 0:
        print("❌ PUZZLE ERROR: No valid solutions found!")
        return False
    elif count == 1:
        print("✅ PUZZLE VALID: Exactly 1 solution exists.")
        print(f"   Solution: {solutions[0]}")
        return True
    else:
        print(f"❌ PUZZLE ERROR: {count} valid solutions found!")
        return False


if __name__ == "__main__":
    validate_puzzle()
