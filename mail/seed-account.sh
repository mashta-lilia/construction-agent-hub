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

umask 077
mkdir -p /tmp/docker-mailserver
hash=$(doveadm pw -s SHA512-CRYPT -p "$MAIL_SEED_PASSWORD")
tmp_file=$(mktemp /tmp/docker-mailserver/postfix-accounts.cf.XXXXXX)
printf '%s|%s\n' "$MAIL_SEED_ACCOUNT" "$hash" > "$tmp_file"
mv "$tmp_file" /tmp/docker-mailserver/postfix-accounts.cf

exec /usr/bin/dumb-init -- "$@"
