from collections import deque
from time import perf_counter
from .common import reconstruct_path, result_template

def bfs(problem):
    started = perf_counter()
    queue = deque([problem.start])
    parent = {problem.start: None}
    explored = []
    generated = 1
    max_frontier = 1

    while queue:
        current = queue.popleft()
        explored.append(current)
        if problem.is_goal(current):
            path = reconstruct_path(parent, current)
            return result_template("BFS", True, path, explored, generated,
                                   perf_counter() - started, max_frontier, parent, problem)
        for neighbor in problem.get_neighbors(current):
            if neighbor not in parent:
                parent[neighbor] = current
                queue.append(neighbor)
                generated += 1
        max_frontier = max(max_frontier, len(queue))

    return result_template("BFS", False, [], explored, generated,
                           perf_counter() - started, max_frontier, parent, problem)
