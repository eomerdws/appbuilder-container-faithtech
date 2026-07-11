---
id: "BE-011"
title: "Enforce role checks on the server"
area: "Backend"
epic: "Authorization"
priority: "P0"
scope: "MVP"
estimate_hours: 4
owner: "Person 2 – API/Security"
status: "Not Started"
dependencies:
  - "BE-010"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# BE-011 — Enforce role checks on the server

## User Story

As a regional application administrator, I want the delivery team to enforce role checks on the server so that package publication, moderation, and discovery are secure and reliable.

## Description

Centralize authorization behind a security helper on locals so every admin load, server action, and API mutation verifies the current user and required role, and make a missing check fail closed (via a lint rule and/or a runtime guard) rather than silently allow access. Minimal MVP authorization only needs the role on the authenticated administrator; full user administration is BE-013.

## Acceptance Criteria

- [ ] Direct requests cannot bypass UI restrictions.
- [ ] A server route that omits an authorization check fails closed.
- [ ] User-only and administrator permissions are covered by tests.

## Deliverable / Evidence

Route guards and authorization helpers

## Dependencies

- `BE-010`

