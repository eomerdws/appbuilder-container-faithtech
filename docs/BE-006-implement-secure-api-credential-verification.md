---
id: "BE-006"
title: "Implement secure API credential verification"
area: "Backend"
epic: "Security"
priority: "P0"
scope: "MVP"
estimate_hours: 4
owner: "Person 2 – API/Security"
status: "Not Started"
dependencies:
  - "BE-002"
  - "OPS-006"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# BE-006 — Implement secure API credential verification

## User Story

As a regional application administrator, I want the delivery team to implement secure API credential verification so that package publication, moderation, and discovery are secure and reliable.

## Description

Generate credentials with Web Crypto, display secrets once, store only a hash and metadata, and verify an exact Bearer token.

## Acceptance Criteria

- [ ] No plaintext secret is stored or returned after creation.
- [ ] Missing, malformed, revoked, and incorrect credentials are rejected.

## Deliverable / Evidence

Credential service and verification tests

## Dependencies

- `BE-002`
- `OPS-006`

