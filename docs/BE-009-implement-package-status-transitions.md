---
id: "BE-009"
title: "Implement package status transitions"
area: "Backend"
epic: "Moderation"
priority: "P0"
scope: "MVP"
estimate_hours: 4
owner: "Person 1 – Data/Backend"
status: "Not Started"
dependencies:
  - "BE-003"
  - "BE-010"
  - "BE-011"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# BE-009 — Implement package status transitions

## User Story

As a regional application administrator, I want the delivery team to implement package status transitions so that package publication, moderation, and discovery are secure and reliable.

## Description

Provide approve, reject, deactivate, and reactivate operations with transition rules and timestamps.

## Acceptance Criteria

- [ ] Invalid transitions are rejected.
- [ ] Every successful transition records the actor and time.
- [ ] Submitted payloads cannot set status.

## Deliverable / Evidence

Moderation service and server actions

## Dependencies

- `BE-003`
- `BE-010`
- `BE-011`

