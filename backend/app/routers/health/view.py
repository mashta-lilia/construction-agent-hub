from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    """Liveness probe — answers as long as the process serves requests.

    Readiness (`/api/ready`, checking PostgreSQL and Redis) arrives with the
    tickets that introduce those dependencies: S2-INFRA-02 and S2-INFRA-03.
    """
    return {"status": "ok"}
