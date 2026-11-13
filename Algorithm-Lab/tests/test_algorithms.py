import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
from problem.problem import CodeBreakerProblem
from algorithms.bfs import bfs
from algorithms.dfs import dfs
from algorithms.greedy import greedy
from algorithms.astar import astar

def test_all_algorithms_find_goal():
    problem = CodeBreakerProblem(["Red","Blue","Green"], ["Red","Blue","Orange"])
    for algorithm in (bfs, dfs, greedy, astar):
        result = algorithm(problem)
        assert result["found"] is True
        assert result["path"][0] == list(problem.start)
        assert result["path"][-1] == list(problem.goal)

def test_bfs_and_astar_are_optimal_for_this_problem():
    problem = CodeBreakerProblem(["Red","Blue","Green"], ["Yellow","Purple","Orange"])
    assert bfs(problem)["path_cost"] == 3
    assert astar(problem)["path_cost"] == 3
