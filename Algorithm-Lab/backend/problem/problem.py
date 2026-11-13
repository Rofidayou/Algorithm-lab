from .state import get_all_states, get_neighbors, is_goal, heuristic, normalize_state

class CodeBreakerProblem:
    def __init__(self, start, goal):
        self.start = normalize_state(start)
        self.goal = normalize_state(goal)

    def get_all_states(self):
        return get_all_states()

    def get_neighbors(self, state):
        return get_neighbors(state)

    def is_goal(self, state):
        return is_goal(state, self.goal)

    def heuristic(self, state):
        return heuristic(state, self.goal)
