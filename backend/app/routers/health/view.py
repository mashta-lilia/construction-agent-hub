from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready")
async def ready() -> dict[str, str]:
    # Stub: S2-INFRA-01 wires real Postgres/Redis connectivity checks here.
    return {"status": "ok"}
