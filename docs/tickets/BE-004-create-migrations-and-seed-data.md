---
id: "BE-004"
title: "Create migrations and seed data"
area: "Backend"
epic: "Data model"
priority: "P0"
scope: "MVP"
estimate_hours: 4
owner: "Person 1 – Data/Backend"
status: "Not Started"
dependencies:
  - "BE-002"
  - "BE-003"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# BE-004 — Create migrations and seed data

## User Story

As a service maintainer, I want the delivery team to create migrations and seed data so that package publication, moderation, and discovery are secure and reliable.

## Description

Create repeatable migrations and representative seed data using the sample Gumawana notification. On the Postgres path use prisma migrate; on the D1 fallback generate SQL with Prisma but version and apply it through wrangler d1 migrations. Keep seed data reusable across the chosen driver.

## Acceptance Criteria

- [ ] A clean database can be migrated and seeded through documented commands.
- [ ] Rerunning the process is safe.

## Deliverable / Evidence

Migration files and demo seed

## Dependencies

- `BE-002`
- `BE-003`

