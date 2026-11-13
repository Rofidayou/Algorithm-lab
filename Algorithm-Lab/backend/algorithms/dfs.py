from time import perf_counter
from .common import reconstruct_path, result_template

def dfs(problem):
    started = perf_counter()
    stack = [problem.start]
    parent = {problem.start: None}
    explored = []
    generated = 1
    max_frontier = 1

    while stack:
        current = stack.pop()
        explored.append(current)
        if problem.is_goal(current):
            path = reconstruct_path(parent, current)
            return result_template("DFS", True, path, explored, generated,
                                   perf_counter() - started, max_frontier, parent, problem)
        for neighbor in reversed(problem.get_neighbors(current)):
            if neighbor not in parent:
                parent[neighbor] = current
                stack.append(neighbor)
                generated += 1
        max_frontier = max(max_frontier, len(stack))

    return result_template("DFS", False, [], explored, generated,
                           perf_counter() - started, max_frontier, parent, problem)
