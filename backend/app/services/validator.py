def validate_strategy_output(data: dict):
    if not isinstance(data, dict):
        raise ValueError("Output is not a dictionary")

    if "summary" not in data or not isinstance(data["summary"], str):
        raise ValueError("Missing or invalid 'summary'")

    if "channels" not in data or not isinstance(data["channels"], list):
        raise ValueError("Missing or invalid 'channels'")

    if "actions" not in data or not isinstance(data["actions"], list):
        raise ValueError("Missing or invalid 'actions'")

    if not all(isinstance(item, str) for item in data["channels"]):
        raise ValueError("'channels' must contain only strings")

    if not all(isinstance(item, str) for item in data["actions"]):
        raise ValueError("'actions' must contain only strings")

    return data