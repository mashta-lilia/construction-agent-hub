from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"

    postgres_dsn: str
    redis_url: str

    # No default: nothing reads this yet (S2-INFRA-01 wires it up), but #10
    # in this stack adds JWT signing — a signing secret that silently falls
    # back to a value published in this repo is worse than one that fails
    # to boot. Required now, before anything depends on it.
    jwt_secret: str
    openrouter_api_key: str = ""
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""


settings = Settings()
