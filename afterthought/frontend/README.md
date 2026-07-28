# Afterthought web application

This directory contains the Next.js App Router frontend. Use the repository
root [README](../README.md) for setup, deployment and verification instructions.

Server-rendered data uses `INTERNAL_API_URL`. Client requests use same-origin
`/api/*` paths through Nginx; do not put secrets in `NEXT_PUBLIC_*` variables.
