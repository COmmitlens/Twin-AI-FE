#!/bin/sh
set -e

: "${NEXT_PUBLIC_API_URL:?NEXT_PUBLIC_API_URL must be set}"
: "${NEXT_PUBLIC_ENVIRONMENT:?NEXT_PUBLIC_ENVIRONMENT must be set}"

grep -rl "__RUNTIME_NEXT_PUBLIC_API_URL__" /app/.next /app/public 2>/dev/null | while read -r file; do
  sed -i "s|__RUNTIME_NEXT_PUBLIC_API_URL__|${NEXT_PUBLIC_API_URL}|g" "$file"
done

grep -rl "__RUNTIME_NEXT_PUBLIC_ENVIRONMENT__" /app/.next /app/public 2>/dev/null | while read -r file; do
  sed -i "s|__RUNTIME_NEXT_PUBLIC_ENVIRONMENT__|${NEXT_PUBLIC_ENVIRONMENT}|g" "$file"
done

exec "$@"
