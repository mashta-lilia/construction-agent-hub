#!/bin/bash
# Generates the seed mail account from env vars at container start, instead
# of shipping a working credential in a committed file. Without at least one
# account Dovecot refuses to start and docker-mailserver self-terminates
# after a grace period — this exists to satisfy that, not as a real mailbox.
set -euo pipefail

if [ -n "${MAIL_SEED_ACCOUNT:-}" ] && [ -n "${MAIL_SEED_PASSWORD:-}" ]; then
  mkdir -p /tmp/docker-mailserver
  hash=$(doveadm pw -s SHA512-CRYPT -p "$MAIL_SEED_PASSWORD")
  printf '%s|%s\n' "$MAIL_SEED_ACCOUNT" "$hash" > /tmp/docker-mailserver/postfix-accounts.cf
fi

exec /usr/bin/dumb-init -- "$@"
