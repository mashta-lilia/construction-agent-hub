import os
import typing
from abc import ABC

from ..exceptions import InvalidEnvironmentError, NoParameterError


class ConfigFactory(ABC):
    def __init__(self):
        if not hasattr(self, "__prefix__"):
            self.__prefix__ = self.__qualname__
        for var_name, var_type in type(self).__annotations__.items():
            env_value = os.getenv(self.__prefix__ + var_name, "")

            origin = typing.get_origin(var_type)
            args = typing.get_args(var_type)
            is_optional = origin is typing.Union and type(None) in args
            if is_optional:
                base_type = next(t for t in args if t is not type(None))
            else:
                base_type = var_type
            if env_value == "":
                if var_name in type(self).__dict__:
                    # A class-level default (e.g. `PORT: int = 587`) already
                    # applies via normal attribute lookup — leave it alone.
                    # Checked before `is_optional` on purpose: an optional
                    # field WITH a default (`DB: Optional[int] = 0`) must keep
                    # that default rather than be overwritten with None.
                    continue
                if is_optional:
                    setattr(self, var_name, None)
                    continue
                raise NoParameterError(
                    f"Environment variable '{self.__prefix__ + var_name}' not set"
                )
            try:
                setattr(self, var_name, self._cast_value(env_value, base_type))
            except ValueError as exc:
                raise InvalidEnvironmentError(
                    f"Environment variable '{self.__prefix__ + var_name}' has an invalid value"
                ) from exc

    def _cast_value(self, value: str, var_type: type):
        if var_type is str:
            return value
        elif var_type is int:
            return int(value)
        elif var_type is bool:
            return value.lower() in ("true", "1", "yes")
        elif var_type in (list[int], tuple[int]):
            return (
                tuple(map(int, value.split(",")))
                if var_type is tuple[int]
                else list(map(int, value.split(",")))
            )
        elif var_type in (list[str], tuple[str]):
            return (
                tuple(value.split(",")) if var_type is tuple[str] else value.split(",")
            )
        elif var_type in (list[bool], tuple[bool]):
            return (
                tuple(
                    map(lambda x: x.lower() in ("true", "1", "yes"), value.split(","))
                )
                if var_type is tuple[bool]
                else list(
                    map(lambda x: x.lower() in ("true", "1", "yes"), value.split(","))
                )
            )
        raise TypeError(f"Unsupported type: {var_type}")
