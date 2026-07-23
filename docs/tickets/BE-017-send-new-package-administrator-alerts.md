---
id: "BE-017"
title: "Send new-package administrator alerts"
area: "Backend"
epic: "Notifications"
priority: "P2"
scope: "Stretch"
estimate_hours: 4
owner: "Person 2 – API/Security"
status: "Not Started"
dependencies:
  - "BE-007"
  - "OPS-006"
  - "OPS-010"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# BE-017 — Send new-package administrator alerts

## User Story

As a service maintainer, I want the delivery team to send new-package administrator alerts so that package publication, moderation, and discovery are secure and reliable.

## Description

Replace unawaited Nodemailer behavior with a Workers-compatible email integration and reliable failure handling.

## Acceptance Criteria

- [ ] A new pending package creates one administrator notification.
- [ ] Email failure is logged and does not corrupt ingestion.

## Deliverable / Evidence

Email notification integration

## Dependencies

- `BE-007`
- `OPS-006`
- `OPS-010`

