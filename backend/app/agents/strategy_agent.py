from app.schemas.goal import GoalRequest, StrategyOutput


class StrategyAgent:
    """Simple starter agent.

    For now it returns a deterministic strategy so the API works end-to-end.
    Later, this is the file where you will add your real LLM call.
    """

    def generate_strategy(self, goal_request: GoalRequest) -> StrategyOutput:
        business_type = goal_request.business_type.lower()

        if "saas" in business_type:
            return StrategyOutput(
                summary="Focus on awareness, targeted outreach, and landing page conversion.",
                channels=["LinkedIn", "Email", "Content Marketing"],
                actions=[
                    "Create a clear landing page with one strong CTA.",
                    "Run a weekly LinkedIn content plan targeting the chosen audience.",
                    "Send personalized cold emails to qualified prospects.",
                ],
            )

        if "real estate" in business_type:
            return StrategyOutput(
                summary="Focus on local lead generation, listing promotion, and buyer follow-up.",
                channels=["Instagram", "Facebook Ads", "Email"],
                actions=[
                    "Create high-quality posts for the featured properties.",
                    "Run local ads targeting buyers in the selected area.",
                    "Follow up with interested leads using a short email sequence.",
                ],
            )

        return StrategyOutput(
            summary="Start with one audience, one offer, and one measurable campaign.",
            channels=["Email", "Social Media", "Website"],
            actions=[
                "Define the main customer segment and key problem.",
                "Launch one small campaign with a clear call to action.",
                "Track clicks, leads, and conversions to improve the next iteration.",
            ],
        )
