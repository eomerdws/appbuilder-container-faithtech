---
id: "BE-014"
title: "Implement API credential lifecycle"
area: "Backend"
epic: "Security"
priority: "P1"
scope: "Target"
estimate_hours: 5
owner: "Person 2 – API/Security"
status: "Not Started"
dependencies:
  - "BE-006"
  - "BE-011"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# BE-014 — Implement API credential lifecycle

## User Story

As a regional application administrator, I want the delivery team to implement API credential lifecycle so that package publication, moderation, and discovery are secure and reliable.

## Description

> **Deferred / optional (post-MVP).** The MVP authenticates the Scriptoria
> intake with a single shared secret (`SCRIPTORIA_API_KEY`, see `BE-006`), which
> needs no credential store. Only build this managed, per-user credential
> lifecycle if multiple rotatable publisher keys are actually required. When it
> is built, credential values are hashed at rest and shown once — never stored
> or displayed in plaintext.

Support creating, naming, rotating, revoking, and recording last use of Scriptoria credentials.

## Acceptance Criteria

- [ ] Credential values are shown once, revocation is immediate, and the admin list reveals only safe metadata.

## Deliverable / Evidence

Credential management server actions

## Dependencies

- `BE-006`
- `BE-011`

