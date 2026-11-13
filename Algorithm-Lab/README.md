# Algorithm Lab - Code Breaker

A small educational project for comparing BFS, DFS, Greedy Best-First Search, and A* on a 3-slot color-code puzzle.

## Requirements
- Python 3.10 or newer
- A modern browser

## Run
Open a terminal in the project folder:

```bash
cd backend
python -m venv .venv
```

Activate the environment:
- Windows: `.venv\Scripts\activate`
- macOS/Linux: `source .venv/bin/activate`

Install dependencies and start:

```bash
pip install -r requirements.txt
python app.py
```

Open `http://127.0.0.1:5000`.

## Tests
From the project root:

```bash
pip install pytest
pytest
```

## Puzzle model
- 3 slots, 6 possible colors per slot = 6^3 = 216 states.
- One move changes exactly one slot to another color.
- Every move costs 1.
- Heuristic: number of slots that differ from the goal (Hamming distance).
- BFS and A* return an optimal path for this equal-cost puzzle. DFS and Greedy are not guaranteed to.
