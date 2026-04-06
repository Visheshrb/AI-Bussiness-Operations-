from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Autonomous Business Operator AI"
    app_version: str = "0.1.0"

    ollama_model: str = "llama3"
    ollama_base_url: str = "http://localhost:11434"

    database_url: str = "postgresql://postgres:postgres@localhost:5432/business_ai"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )


settings = Settings()