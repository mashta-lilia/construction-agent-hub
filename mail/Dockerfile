# Base: docker-mailserver (Postfix + Dovecot, actively maintained, self-hosted).
# Skeleton only: no per-project account provisioning yet — that's a follow-up
# ticket. This Dockerfile proves the service builds and starts; real
# per-project mailbox setup (S2-DOCKER-01's mail/ deliverable is
# infrastructure, not mail logic) is out of scope here.
FROM ghcr.io/docker-mailserver/docker-mailserver:latest

# config/postfix-accounts.cf seeds ONE dummy account (placeholder@reconstruction-hub.local,
# password "placeholder-change-me") — without at least one account, Dovecot
# refuses to start and docker-mailserver self-terminates after a grace period.
# This account is a placeholder to keep the container running, not a real
# mailbox. Per-project account provisioning is a follow-up ticket.
COPY config/ /tmp/docker-mailserver/
