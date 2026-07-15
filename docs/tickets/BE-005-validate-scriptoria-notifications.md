---
id: "BE-005"
title: "Validate Scriptoria notifications"
area: "Backend"
epic: "Ingestion"
priority: "P0"
scope: "MVP"
estimate_hours: 4
owner: "Person 2 – API/Security"
status: "Not Started"
dependencies:
  - "BE-001"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# BE-005 — Validate Scriptoria notifications

## User Story

As a Scriptoria integration operator, I want the delivery team to validate Scriptoria notifications so that package publication, moderation, and discovery are secure and reliable.

## Description

Define a Valibot schema for the notification payload and normalize file sizes, URLs, language metadata, images, and localized listings.

## Acceptance Criteria

- [ ] Valid sample payloads are accepted.
- [ ] Missing or malformed required fields return clear 4xx responses and never crash the service.

## Deliverable / Evidence

Validated notification DTO and tests

## Dependencies

- `BE-001`

