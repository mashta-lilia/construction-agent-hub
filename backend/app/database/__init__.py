from urllib.parse import quote

from app.core import CONFIG

# Percent-encode the credential/name parts: a password containing `@`, `:` or
# `/` would otherwise corrupt the DSN. `safe=""` so nothing is left unescaped
# (quote, not quote_plus — `+` is a literal in URL userinfo, not a space).
_user = quote(CONFIG.database.USER, safe="")
_name = quote(CONFIG.database.NAME, safe="")
_password = CONFIG.database.PASSWORD
# Omit the password entirely when unset, rather than sending literal "None".
_credentials = _user if _password is None else f"{_user}:{quote(_password, safe='')}"

TORTOISE_ORM = {
    "connections": {
        "default": (
            f"postgres://{_credentials}"
            f"@{CONFIG.database.HOST}:{CONFIG.database.PORT}/{_name}"
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
