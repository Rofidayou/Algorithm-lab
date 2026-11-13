import heapq
from itertools import count
from time import perf_counter
from .common import reconstruct_path, result_template

def greedy(problem):
    started = perf_counter()
    tie = count()
    frontier = [(problem.heuristic(problem.start), next(tie), problem.start)]
    parent = {problem.start: None}
    discovered = {problem.start}
    explored = []
    generated = 1
    max_frontier = 1

    while frontier:
        _, _, current = heapq.heappop(frontier)
        explored.append(current)
        if problem.is_goal(current):
            path = reconstruct_path(parent, current)
            return result_template("Greedy", True, path, explored, generated,
                                   perf_counter() - started, max_frontier, parent, problem)
        for neighbor in problem.get_neighbors(current):
            if neighbor not in discovered:
                discovered.add(neighbor)
                parent[neighbor] = current
                heapq.heappush(frontier, (problem.heuristic(neighbor), next(tie), neighbor))
                generated += 1
        max_frontier = max(max_frontier, len(frontier))

    return result_template("Greedy", False, [], explored, generated,
                           perf_counter() - started, max_frontier, parent, problem)
