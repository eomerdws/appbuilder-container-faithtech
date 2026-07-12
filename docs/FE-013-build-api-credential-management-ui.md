---
id: "FE-013"
title: "Build API credential management UI"
area: "Frontend"
epic: "Administration"
priority: "P1"
scope: "Target"
estimate_hours: 4
owner: "Person 3 – Frontend"
status: "Not Started"
dependencies:
  - "BE-014"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# FE-013 — Build API credential management UI

## User Story

As a regional application administrator, I want the delivery team to build API credential management UI so that users and administrators can complete the workflow clearly on mobile and desktop.

## Description

> **Deferred / optional (post-MVP).** Depends on `BE-014`, which is itself
> deferred: the MVP uses a single shared secret (`BE-006`) with no admin-managed
> keys, so this screen is not required to ship. The 2023 prototype mock
> (`Glocal Hackathon SIL.md`, "API Keys") showed full key values in the list —
> **do not replicate that.** If built, keys are shown once at creation and the
> list shows only safe metadata.

Allow administrators to create, copy once, name, rotate, and revoke notification credentials.

## Acceptance Criteria

- [ ] Plaintext is visible only immediately after creation (never re-displayed).
- [ ] The normal list shows safe metadata and last use.

## Deliverable / Evidence

Credential administration page

## Dependencies

- `BE-014`

