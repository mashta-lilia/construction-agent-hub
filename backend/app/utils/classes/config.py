import logging
import os
from typing import Optional

from dotenv import load_dotenv

from ..exceptions import EnvironmentFileError, InvalidEnvironmentError
from .config_factory import ConfigFactory

# The exact values committed as placeholders in .env.example — if JWT_SECRET
# is ever left as one of these verbatim, HS256 is brute-forceable offline
# from a single captured token since the "secret" is public in this repo.
_PLACEHOLDER_JWT_SECRETS = frozenset({"change-me", "change-me-to-a-random-secret"})
MIN_JWT_SECRET_LENGTH = 32


class DatabaseInfo(ConfigFactory):
    __prefix__ = "DB_"
    USER: str
    PASSWORD: Optional[str]
    HOST: str
    PORT: int
    NAME: str


class RedisInfo(ConfigFactory):
    __prefix__ = "REDIS_"
    HOST: str
    PORT: int
    PASSWORD: Optional[str]
    DB: int = 0


class ConfInfo(ConfigFactory):
    __prefix__ = "CONF_"
    ORIGINS: list[str] = ["http://localhost"]
    # Drives Tortoise's dev-only schema auto-generation (see app/core and
    # main.py). Defaults to False so staging/prod fail closed — local dev
    # opts in explicitly via CONF_DEBUG=true.
    DEBUG: bool = False

    def __init__(self):
        super().__init__()
        if "*" in self.ORIGINS:
            # main.py sets allow_credentials=True; combined with a wildcard
            # origin, CORSMiddleware echoes the caller's Origin back rather
            # than rejecting it, which makes "*" behave as any-origin-with-
            # credentials rather than actually restricting anything.
            raise InvalidEnvironmentError(
                "CONF_ORIGINS must not include '*' while credentials are allowed"
            )


class SecurityInfo(ConfigFactory):
    __prefix__ = ""  # deliberately flat — keeps the existing root .env.example var name
    JWT_SECRET: str
    JWT_ACCESS_EXPIRE_MINUTES: int = 20
    JWT_REFRESH_EXPIRE_MINUTES: int = 10080

    def __init__(self):
        super().__init__()
        if self.JWT_SECRET in _PLACEHOLDER_JWT_SECRETS or len(self.JWT_SECRET) < MIN_JWT_SECRET_LENGTH:
            raise InvalidEnvironmentError(
                f"JWT_SECRET must be a unique random value of at least "
                f"{MIN_JWT_SECRET_LENGTH} characters, not the committed "
                f".env.example placeholder — generate one with e.g. "
                f"`openssl rand -hex 32`"
            )


class AiInfo(ConfigFactory):
    __prefix__ = ""
    OPENROUTER_API_KEY: Optional[str]


class SmtpInfo(ConfigFactory):
    __prefix__ = "SMTP_"
    HOST: str
    PORT: int = 587
    USER: Optional[str]
    PASSWORD: Optional[str]


class Config:
    database: DatabaseInfo
    configuration: ConfInfo
    redis: RedisInfo
    security: SecurityInfo
    ai: AiInfo
    smtp: SmtpInfo

    def __init__(self, path: Optional[str] = None):
        try:
            load_dotenv(path)
            for attr_name, factory_cls in type(self).__annotations__.items():
                instance = factory_cls()
                setattr(self, attr_name, instance)
        except EnvironmentFileError as E:
            logging.error(E)
            self.create_example_env()
            raise E

    @staticmethod
    def create_example_env():
        """
        Creates an example.env file with placeholder values.

        Never overwrites an existing one: this runs from the `except` branch
        of `__init__` whenever *any* required variable is missing, which in
        practice means "someone forgot to export one var locally" — a
        tracked, hand-commented `.env.example` must not be silently replaced
        with a bare auto-generated dump because of that.
        """
        if os.path.exists(".env.example"):
            return
        params = []
        for attr_name, factory_cls in Config.__annotations__.items():
            params.append(f"# {attr_name}")
            # Mirror ConfigFactory.__init__'s own fallback (the factory's own
            # qualname, not Config's) without mutating the factory class
            # itself as a side effect of generating a file.
            prefix = getattr(factory_cls, "__prefix__", factory_cls.__qualname__)
            for var_name in factory_cls.__annotations__.keys():
                params.append(f"{prefix + var_name}=")
        with open(".env.example", "w") as file:
            file.write("\n".join(params))
        print("Created .env.example file")
