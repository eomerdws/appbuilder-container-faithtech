---
id: "BE-018"
title: "Mirror packages or images to R2"
area: "Backend"
epic: "Storage"
priority: "P2"
scope: "Stretch"
estimate_hours: 8
owner: "Person 1 – Data/Backend"
status: "Not Started"
dependencies:
  - "OPS-013"
  - "BE-007"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# BE-018 — Mirror packages or images to R2

## User Story

As a service maintainer, I want the delivery team to mirror packages or images to R2 so that package publication, moderation, and discovery are secure and reliable.

## Description

If required by SIL, fetch trusted upstream objects into R2 and serve controlled downloads. Skip this if Scriptoria permalinks are sufficient.

## Acceptance Criteria

- [ ] Mirroring is explicitly enabled, validates source URLs, records object metadata, and serves the expected iOS download response.

## Deliverable / Evidence

Optional R2 mirroring service

## Dependencies

- `OPS-013`
- `BE-007`

