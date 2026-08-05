import os

# Sane defaults for a local run against docker-compose's published
# postgres/redis ports. Override any of these by exporting the real var
# before running pytest — os.environ always wins over setdefault.
os.environ.setdefault("DB_USER", "reconstruction_hub")
os.environ.setdefault("DB_PASSWORD", "change-me")
os.environ.setdefault("DB_HOST", "localhost")
os.environ.setdefault("DB_PORT", "5432")
os.environ.setdefault("DB_NAME", "reconstruction_hub")
os.environ.setdefault("REDIS_HOST", "localhost")
os.environ.setdefault("REDIS_PORT", "6379")
# Must match the root .env.example, because docker-compose starts Redis with
# `--requirepass ${REDIS_PASSWORD}` and rejects unauthenticated clients. An
# empty default here made /ready report Redis as down against a correctly
# running stack, which is what left the integration tier permanently red.
os.environ.setdefault("REDIS_PASSWORD", "change-me")
os.environ.setdefault("REDIS_DB", "0")
os.environ.setdefault("CONF_ORIGINS", "http://localhost")
os.environ.setdefault("JWT_SECRET", "test-only-secret-not-for-real-use-32chars")
os.environ.setdefault("SMTP_HOST", "localhost")
