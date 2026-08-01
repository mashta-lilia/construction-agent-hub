from typing import Final

from app.utils.classes.config import Config

# The single entry point for configuration: no module outside this package
# reads `os.environ` directly (CLAUDE.md §10).
CONFIG: Final = Config(".env")

__all__ = ("CONFIG",)
