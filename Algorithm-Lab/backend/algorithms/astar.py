import heapq
from itertools import count
from time import perf_counter
from .common import reconstruct_path, result_template

def astar(problem):
    started = perf_counter()
    tie = count()
    frontier = [(problem.heuristic(problem.start), next(tie), 0, problem.start)]
    parent = {problem.start: None}
    best_g = {problem.start: 0}
    explored = []
    generated = 1
    max_frontier = 1

    while frontier:
        _, _, current_g, current = heapq.heappop(frontier)
        if current_g != best_g.get(current):
            continue
        explored.append(current)
        if problem.is_goal(current):
            path = reconstruct_path(parent, current)
            return result_template("A*", True, path, explored, generated,
                                   perf_counter() - started, max_frontier, parent, problem)
        for neighbor in problem.get_neighbors(current):
            new_g = current_g + 1
            if new_g < best_g.get(neighbor, float("inf")):
                best_g[neighbor] = new_g
                parent[neighbor] = current
                f_score = new_g + problem.heuristic(neighbor)
                heapq.heappush(frontier, (f_score, next(tie), new_g, neighbor))
                generated += 1
        max_frontier = max(max_frontier, len(frontier))

    return result_template("A*", False, [], explored, generated,
                           perf_counter() - started, max_frontier, parent, problem)
