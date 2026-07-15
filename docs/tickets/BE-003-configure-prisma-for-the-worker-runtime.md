---
id: "BE-003"
title: "Configure Prisma for the Worker runtime"
area: "Backend"
epic: "Data access"
priority: "P0"
scope: "MVP"
estimate_hours: 5
owner: "Person 1 – Data/Backend"
status: "Not Started"
dependencies:
  - "BE-002"
  - "OPS-004"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# BE-003 — Configure Prisma for the Worker runtime

## User Story

As a service maintainer, I want the delivery team to configure Prisma for the Worker runtime so that package publication, moderation, and discovery are secure and reliable.

## Description

Configure Prisma and the selected database driver for Cloudflare Workers. Prefer PostgreSQL through Hyperdrive (standard prisma migrate). D1 is a fallback only if no Postgres is reachable: prove the Prisma D1 driver adapter early and apply migrations via wrangler d1 migrations, since prisma migrate cannot target D1.

## Acceptance Criteria

- [ ] A Worker route can create and read a record locally and in the staging environment without using Firebase.

## Deliverable / Evidence

Working database client and typed repository layer

## Dependencies

- `BE-002`
- `OPS-004`

