from dotenv import load_dotenv

from .config_factory import ConfigFactory


class ConfInfo(ConfigFactory):
    """Application-level settings.

    Database, Redis, SMTP and AI credentials get their own sections in the
    tickets that introduce those dependencies (S2-INFRA-02, S2-INFRA-03,
    S2-MAIL-01, S3-AI-01). Everything here has a default on purpose, so the
    skeleton boots without a `.env` file.
    """

    __prefix__ = "CONF_"
    ORIGINS: list[str] = ["http://localhost"]


class Config:
    """Aggregates every settings section. Consumers import the ready-made
    instance from `app.core`, never this class directly.
    """

    configuration: ConfInfo

    def __init__(self, path: str | None = None) -> None:
        load_dotenv(path)
        for attr_name, factory_cls in type(self).__annotations__.items():
            setattr(self, attr_name, factory_cls())
