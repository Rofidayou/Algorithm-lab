from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
from problem.problem import CodeBreakerProblem
from algorithms.bfs import bfs
from algorithms.dfs import dfs
from algorithms.greedy import greedy
from algorithms.astar import astar

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

app = Flask(__name__)

ALGORITHMS = {
    "BFS": bfs,
    "DFS": dfs,
    "Greedy": greedy,
    "A*": astar
}

@app.get("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.get("/<path:filename>")
def frontend_files(filename):
    return send_from_directory(FRONTEND_DIR, filename)

@app.post("/api/search")
def search():
    data = request.get_json(silent=True) or {}
    try:
        start = data.get("start")
        goal = data.get("goal")
        selected = data.get("algorithm", "BFS")

        if selected == "ALL":
            problem = CodeBreakerProblem(start, goal)
            results = [fn(problem) for fn in ALGORITHMS.values()]
            return jsonify({"results": results})

        if selected not in ALGORITHMS:
            return jsonify({"error": "Unknown algorithm."}), 400

        problem = CodeBreakerProblem(start, goal)
        result = ALGORITHMS[selected](problem)
        return jsonify(result)
    except (ValueError, TypeError) as exc:
        return jsonify({"error": str(exc)}), 400

if __name__ == "__main__":
    app.run(debug=True)
