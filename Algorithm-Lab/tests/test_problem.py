import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
from problem.problem import CodeBreakerProblem
from problem.state import get_all_states

def test_state_space_has_216_states():
    assert len(get_all_states()) == 216

def test_each_state_has_15_neighbors():
    problem = CodeBreakerProblem(["Red","Blue","Green"], ["Yellow","Purple","Orange"])
    assert len(problem.get_neighbors(problem.start)) == 15

def test_heuristic():
    problem = CodeBreakerProblem(["Red","Blue","Green"], ["Red","Purple","Orange"])
    assert problem.heuristic(problem.start) == 2
