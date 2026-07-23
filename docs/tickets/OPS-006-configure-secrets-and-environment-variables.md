---
id: "OPS-006"
title: "Configure secrets and environment variables"
area: "DevOps/Deployment"
epic: "Secrets"
priority: "P0"
scope: "MVP"
estimate_hours: 3
owner: "Person 4 – Platform/Integration"
status: "Not Started"
dependencies:
  - "OPS-002"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# OPS-006 — Configure secrets and environment variables

## User Story

As a platform security operator, I want the delivery team to configure secrets and environment variables so that the service can be deployed, integrated, and operated consistently on Cloudflare.

## Description

Define required secret names, use local ignored secret files, and configure encrypted production secrets for auth, database, email, and credential hashing.

Required Worker secrets (set with `wrangler secret put`, mirrored in `.dev.vars`
for local dev, never committed):

- `SESSION_SECRET` — signs administrator session cookies.
- `SCRIPTORIA_API_KEY` — shared secret the Scriptoria publishing service
  presents on the notification intake endpoint (`BE-006`).

## Acceptance Criteria

- [ ] No secret is committed or exposed through PUBLIC variables.
- [ ] Missing required secrets fail closed at runtime — the Scriptoria intake
      rejects and session-dependent routes error, rather than degrading to an
      unauthenticated or insecure state. (`wrangler deploy` does not verify that
      secrets exist, so this is enforced in-app, not at deploy time.)

## Deliverable / Evidence

Secret inventory and configured bindings

## Dependencies

- `OPS-002`

