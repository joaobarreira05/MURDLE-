import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from app.data.puzzle_validator import count_valid_solutions, validate_puzzle
from app.data.game_config import CHARACTERS, LOCATIONS, SOLUTION


def test_exactly_one_solution():
    """CRITICAL: The puzzle must have exactly one valid solution."""
    char_ids = [c["id"] for c in CHARACTERS]
    loc_ids = [l["id"] for l in LOCATIONS]
    count, solutions = count_valid_solutions(char_ids, loc_ids)
    assert count == 1, (
        f"Expected exactly 1 solution, found {count}. "
        f"Solutions: {solutions}"
    )


def test_solution_matches_config():
    """The SOLUTION in game_config must match what the solver finds."""
    char_ids = [c["id"] for c in CHARACTERS]
    loc_ids = [l["id"] for l in LOCATIONS]
    _, solutions = count_valid_solutions(char_ids, loc_ids)
    assert len(solutions) == 1
    solver_solution = solutions[0]
    config_solution = SOLUTION["placement"]
    assert solver_solution == config_solution, (
        f"SOLUTION config doesn't match what solver found!\n"
        f"Config:  {config_solution}\n"
        f"Solver:  {solver_solution}"
    )


def test_all_characters_in_solution():
    """Every character must have a placement in the solution."""
    char_ids = {c["id"] for c in CHARACTERS}
    solution_chars = set(SOLUTION["placement"].keys())
    assert char_ids == solution_chars, (
        f"Missing characters in solution: {char_ids - solution_chars}"
    )


def test_all_locations_used():
    """Every location must be used exactly once in the solution."""
    loc_ids = {l["id"] for l in LOCATIONS}
    solution_locs = set(SOLUTION["placement"].values())
    assert loc_ids == solution_locs, (
        f"Location mismatch. Unused: {loc_ids - solution_locs}, "
        f"Unknown: {solution_locs - loc_ids}"
    )


def test_no_duplicate_locations_in_solution():
    """No two characters should share a location."""
    locs = list(SOLUTION["placement"].values())
    assert len(locs) == len(set(locs)), "Duplicate locations in solution!"


def test_validate_puzzle_returns_true():
    """High-level puzzle validation should return True."""
    assert validate_puzzle() is True
