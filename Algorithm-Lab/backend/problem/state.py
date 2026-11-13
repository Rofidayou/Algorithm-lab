COLORS = ("Red", "Blue", "Green", "Yellow", "Purple", "Orange")
SLOT_COUNT = 3

def normalize_state(state):
    if not isinstance(state, (list, tuple)) or len(state) != SLOT_COUNT:
        raise ValueError("A state must contain exactly 3 colors.")
    normalized = tuple(str(color).title() for color in state)
    if any(color not in COLORS for color in normalized):
        raise ValueError(f"Colors must be selected from: {', '.join(COLORS)}")
    return normalized

def get_all_states():
    from itertools import product
    return list(product(COLORS, repeat=SLOT_COUNT))

def get_neighbors(state):
    state = normalize_state(state)
    neighbors = []
    for slot in range(SLOT_COUNT):
        for color in COLORS:
            if color != state[slot]:
                next_state = list(state)
                next_state[slot] = color
                neighbors.append(tuple(next_state))
    return neighbors

def is_goal(state, goal):
    return normalize_state(state) == normalize_state(goal)

def heuristic(state, goal):
    state = normalize_state(state)
    goal = normalize_state(goal)
    return sum(a != b for a, b in zip(state, goal))
