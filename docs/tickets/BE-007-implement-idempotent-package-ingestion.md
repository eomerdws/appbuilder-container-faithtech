---
id: "BE-007"
title: "Implement idempotent package ingestion"
area: "Backend"
epic: "Ingestion"
priority: "P0"
scope: "MVP"
estimate_hours: 5
owner: "Person 2 – API/Security"
status: "Not Started"
dependencies:
  - "BE-003"
  - "BE-005"
  - "BE-006"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# BE-007 — Implement idempotent package ingestion

## User Story

As a Scriptoria integration operator, I want the delivery team to implement idempotent package ingestion so that package publication, moderation, and discovery are secure and reliable.

## Description

Create or update a pending package using a stable Scriptoria product or permalink identity. Prevent notification retries from creating duplicates.

## Acceptance Criteria

- [ ] Submitting the same notification twice creates one logical package.
- [ ] Updates preserve history and do not auto-approve content.

## Deliverable / Evidence

POST notification endpoint

## Dependencies

- `BE-003`
- `BE-005`
- `BE-006`

