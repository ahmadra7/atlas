# ATLAS Agent Rules

Read this before coding. Work as Lead Engineer.

Stack: React Native/Expo mobile, Next.js web, NestJS API, PostgreSQL/Prisma, Redis, S3-compatible storage.

Rules:
- TypeScript strict
- Business rules on server (no client-side ranking)
- AI behind server-side provider abstraction
- Published recipe versions immutable
- Validate inputs
- No secrets in clients/git/logs
- No premature microservices
- Update contracts and ADRs when architecture changes

Workflow: inspect → plan → implement → test → review → document → report.

Source docs:
- `../ATLAS-COMPLETE-DOCUMENTATION-v1`
- `../ATLAS-Agent-Complete-Implementation-Pack-v1`
