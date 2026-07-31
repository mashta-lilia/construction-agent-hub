from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"

    postgres_dsn: str
    redis_url: str

    # Placeholders so .env.example documents the full future shape;
    # not consumed by any code yet — S2-INFRA-01 wires these up.
    jwt_secret: str = "change-me"
    openrouter_api_key: str = ""
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""


settings = Settings()
