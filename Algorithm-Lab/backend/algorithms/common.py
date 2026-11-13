def reconstruct_path(parent, goal):
    path = []
    current = goal
    while current is not None:
        path.append(current)
        current = parent[current]
    return list(reversed(path))


def result_template(name, found, path, explored, generated, elapsed, max_frontier,
                    parent=None, problem=None):
    parent = parent or {}
    nodes = []
    edges = []
    depth_cache = {}

    def depth(state):
        if state in depth_cache:
            return depth_cache[state]
        previous = parent.get(state)
        value = 0 if previous is None else depth(previous) + 1
        depth_cache[state] = value
        return value

    explored_set = set(explored)
    path_set = set(path)
    for state in parent:
        previous = parent[state]
        if previous is not None:
            edges.append({"from": list(previous), "to": list(state)})
        h = problem.heuristic(state) if problem else None
        nodes.append({
            "state": list(state),
            "depth": depth(state),
            "status": "goal" if problem and problem.is_goal(state) else
                      "path" if state in path_set else
                      "explored" if state in explored_set else "frontier",
            "h": h,
            "g": depth(state),
            "f": depth(state) + h if h is not None else None
        })

    return {
        "algorithm": name,
        "found": found,
        "path": [list(s) for s in path],
        "explored": [list(s) for s in explored],
        "explored_count": len(explored),
        "generated_count": generated,
        "path_cost": max(0, len(path) - 1) if found else None,
        "execution_time": round(elapsed * 1000, 4),
        "max_frontier_size": max_frontier,
        "graph": {"nodes": nodes, "edges": edges,
                  "exploration_order": [list(s) for s in explored]}
    }
