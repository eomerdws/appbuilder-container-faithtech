---
id: "BE-019"
title: "Add backend unit and integration tests"
area: "Backend"
epic: "Quality"
priority: "P0"
scope: "MVP"
estimate_hours: 5
owner: "Person 2 – API/Security"
status: "Not Started"
dependencies:
  - "BE-005"
  - "BE-006"
  - "BE-007"
  - "BE-008"
  - "BE-009"
  - "BE-010"
  - "BE-011"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# BE-019 — Add backend unit and integration tests

## User Story

As a service maintainer, I want the delivery team to add backend unit and integration tests so that package publication, moderation, and discovery are secure and reliable.

## Description

Test validation, authorization, API credentials, ingestion, duplicate notifications, status transitions, and public filtering.

## Acceptance Criteria

- [ ] Critical backend paths run in CI and include negative authorization and malformed-input cases.

## Deliverable / Evidence

Automated backend test suite

## Dependencies

- `BE-005`
- `BE-006`
- `BE-007`
- `BE-008`
- `BE-009`
- `BE-010`
- `BE-011`
