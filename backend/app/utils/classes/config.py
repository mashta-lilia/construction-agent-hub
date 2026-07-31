import logging
from typing import Optional

from dotenv import load_dotenv

from ..exceptions import EnvironmentFileError
from .config_factory import ConfigFactory


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
    DB: Optional[int] = 0


class ConfInfo(ConfigFactory):
    __prefix__ = "CONF_"
    ORIGINS: list[str] = ["http://localhost"]


class SecurityInfo(ConfigFactory):
    __prefix__ = ""  # deliberately flat — keeps the existing root .env.example var name
    JWT_SECRET: str
    JWT_ACCESS_EXPIRE_MINUTES: int = 20
    JWT_REFRESH_EXPIRE_MINUTES: int = 10080


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
        """
        params = []
        for attr_name, factory_cls in Config.__annotations__.items():
            params.append(f"# {attr_name}")
            if not hasattr(factory_cls, "__prefix__"):
                setattr(factory_cls, "__prefix__", Config.__qualname__)
            for var_name in factory_cls.__annotations__.keys():
                params.append(f"{factory_cls.__prefix__ + var_name}=")
        with open(".env.example", "w") as file:
            file.write("\n".join(params))
        print("Created .env.example file")
