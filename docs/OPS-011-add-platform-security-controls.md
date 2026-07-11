---
id: "OPS-011"
title: "Add platform security controls"
area: "DevOps/Deployment"
epic: "Security"
priority: "P1"
scope: "Target"
estimate_hours: 4
owner: "Person 4 – Platform/Integration"
status: "Not Started"
dependencies:
  - "OPS-003"
  - "BE-006"
  - "BE-010"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# OPS-011 — Add platform security controls

## User Story

As a platform security operator, I want the delivery team to add platform security controls so that the service can be deployed, integrated, and operated consistently on Cloudflare.

## Description

Configure security headers, request-size limits, login and ingestion rate limits, and appropriate WAF rules.

## Acceptance Criteria

- [ ] Common browser protections are present and abusive authentication or notification traffic is throttled.

## Deliverable / Evidence

Security configuration and verification

## Dependencies

- `OPS-003`
- `BE-006`
- `BE-010`

