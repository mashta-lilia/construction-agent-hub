from tortoise import fields
from tortoise.models import Model

from app.utils.classes.mixin import PydanticMixin


class User(Model, PydanticMixin):
    """Placeholder ported from fastapi-template. The auth follow-up ticket
    will add password_hash/role/is_active and likely a separate
    RefreshToken model for revocation/rotation (CLAUDE.md §10) — do not
    build auth endpoints against this shape as-is.
    """

    id = fields.BigIntField(primary_key=True)
    username = fields.CharField(max_length=255, null=True)
    first_name = fields.CharField(max_length=255, null=False)
    last_name = fields.CharField(max_length=255, null=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:  # pyright: ignore
        table = "users"
