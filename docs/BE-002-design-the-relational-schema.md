---
id: "BE-002"
title: "Design the relational schema"
area: "Backend"
epic: "Data model"
priority: "P0"
scope: "MVP"
estimate_hours: 4
owner: "Person 1 – Data/Backend"
status: "Not Started"
dependencies:
  - "BE-001"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# BE-002 — Design the relational schema

## User Story

As a service maintainer, I want the delivery team to design the relational schema so that package publication, moderation, and discovery are secure and reliable.

## Description

Model packages, localized listings, images, package status, users, roles, API credentials, settings, and audit events.

## Acceptance Criteria

- [ ] Schema supports pending, active, inactive, and rejected states.
- [ ] Localized listings.
- [ ] Stable external IDs.
- [ ] And approval metadata.

## Deliverable / Evidence

Reviewed schema diagram and ORM schema

## Dependencies

- `BE-001`

