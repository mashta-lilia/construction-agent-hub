# Base: docker-mailserver (Postfix + Dovecot, actively maintained, self-hosted).
# Skeleton only: no per-project account provisioning yet — that's a follow-up
# ticket. This Dockerfile proves the service builds and starts; real
# per-project mailbox setup (S2-DOCKER-01's mail/ deliverable is
# infrastructure, not mail logic) is out of scope here.
FROM ghcr.io/docker-mailserver/docker-mailserver:latest@sha256:af51b15dd3fc72153c0e90eb7692bb5e3a463212d87959a80fa7aa89b617d44a

# Placeholder for future per-project config templates (DKIM keys, etc.) —
# intentionally empty for now.
COPY config/ /tmp/docker-mailserver/

# The seed account (see seed-account.sh) is generated at container start from
# MAIL_SEED_ACCOUNT/MAIL_SEED_PASSWORD, not committed here — without at least
# one account Dovecot refuses to start and docker-mailserver self-terminates
# after a grace period, but a real credential has no business being in git.
COPY seed-account.sh /usr/local/bin/seed-account.sh
RUN chmod +x /usr/local/bin/seed-account.sh
ENTRYPOINT ["/usr/local/bin/seed-account.sh"]
CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
