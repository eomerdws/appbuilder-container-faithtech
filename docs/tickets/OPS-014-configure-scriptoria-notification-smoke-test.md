---
id: "OPS-014"
title: "Configure Scriptoria notification smoke test"
area: "DevOps/Deployment"
epic: "Integration"
priority: "P0"
scope: "MVP"
estimate_hours: 4
owner: "Person 4 – Platform/Integration"
status: "Not Started"
dependencies:
  - "BE-007"
  - "OPS-003"
  - "OPS-006"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# OPS-014 — Configure Scriptoria notification smoke test

## User Story

As a integration engineer, I want the delivery team to configure Scriptoria notification smoke test so that the service can be deployed, integrated, and operated consistently on Cloudflare.

## Description

Coordinate the server name and PUBLISH_NOTIFY configuration, then exercise the notification endpoint with a representative payload.

## Acceptance Criteria

- [ ] A Scriptoria-style request creates one pending package in staging and a retry does not duplicate it.

## Deliverable / Evidence

End-to-end ingestion evidence

## Dependencies

- `BE-007`
- `OPS-003`
- `OPS-006`

