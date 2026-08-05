#!/bin/bash
# Generates the seed mail account from env vars at container start, instead
# of shipping a working credential in a committed file. Without at least one
# account Dovecot refuses to start and docker-mailserver self-terminates
# after a grace period — this exists to satisfy that, not as a real mailbox.
set -euo pipefail

if [ -z "${MAIL_SEED_ACCOUNT:-}" ] || [ -z "${MAIL_SEED_PASSWORD:-}" ]; then
  echo "MAIL_SEED_ACCOUNT and MAIL_SEED_PASSWORD must both be set — refusing" \
       "to start with zero mail accounts (Dovecot self-terminates anyway)." >&2
  exit 1
fi

mkdir -p /tmp/docker-mailserver
accounts_file=/tmp/docker-mailserver/postfix-accounts.cf
touch "$accounts_file"

# /tmp/docker-mailserver is a persistent volume (docker-compose.yml) holding
# every project mailbox added since via `setup email add`, not just this
# seed account — only append the seed line if it's missing, never truncate
# the file, or every real mailbox added after the first start gets wiped on
# the next restart.
if ! grep -q "^${MAIL_SEED_ACCOUNT}|" "$accounts_file"; then
  umask 077
  hash=$(doveadm pw -s SHA512-CRYPT -p "$MAIL_SEED_PASSWORD")
  printf '%s|%s\n' "$MAIL_SEED_ACCOUNT" "$hash" >> "$accounts_file"
fi

exec /usr/bin/dumb-init -- "$@"
