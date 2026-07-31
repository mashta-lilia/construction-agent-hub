from app.core import CONFIG

TORTOISE_ORM = {
    "connections": {
        "default": (
            f"postgres://{CONFIG.database.USER}:{CONFIG.database.PASSWORD}"
            f"@{CONFIG.database.HOST}:{CONFIG.database.PORT}/{CONFIG.database.NAME}"
        )
    },
    "apps": {
        "models": {
            "models": ["app.database.models"],
            "default_connection": "default",
        }
    },
    "use_tz": True,
}

__all__ = ("TORTOISE_ORM",)
