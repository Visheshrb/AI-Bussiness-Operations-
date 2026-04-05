from app.agents.strategy_agent import generate_strategy


def run_goal_workflow(goal: str, business_type: str, target_audience: str, budget: float):
    strategy = generate_strategy(
        goal=goal,
        business_type=business_type,
        target_audience=target_audience,
        budget=budget,
    )

    return {
        "goal": goal,
        "strategy": strategy
    }