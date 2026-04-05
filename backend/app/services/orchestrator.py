from app.agents.strategy_agent import StrategyAgent
from app.schemas.goal import GoalRequest, GoalResponse


class Orchestrator:
    def __init__(self) -> None:
        self.strategy_agent = StrategyAgent()

    def handle_goal(self, goal_request: GoalRequest) -> GoalResponse:
        strategy = self.strategy_agent.generate_strategy(goal_request)
        return GoalResponse(goal=goal_request.goal, strategy=strategy)
