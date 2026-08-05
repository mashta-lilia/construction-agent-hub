import pytest

from app.utils.middlewares import _is_valid_request_id


@pytest.mark.parametrize(
    "value",
    [
        "5f6a6b1e-9b8d-4a2c-8e7a-1a2b3c4d5e6f",
        "00000000-0000-0000-0000-000000000000",
        "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
    ],
)
def test_accepts_canonical_uuid_strings(value: str) -> None:
    assert _is_valid_request_id(value) is True


@pytest.mark.parametrize(
    "value",
    [
        "caller-supplied-id",
        "",
        "A" * 8192,
        "5f6a6b1e9b8d4a2c8e7a1a2b3c4d5e6f",  # missing hyphens
        "5f6a6b1e-9b8d-4a2c-8e7a-1a2b3c4d5e6f ",  # trailing whitespace
    ],
)
def test_rejects_non_uuid_strings(value: str) -> None:
    assert _is_valid_request_id(value) is False
