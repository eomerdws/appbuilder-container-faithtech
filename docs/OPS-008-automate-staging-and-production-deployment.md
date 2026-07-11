---
id: "OPS-008"
title: "Automate staging and production deployment"
area: "DevOps/Deployment"
epic: "CD"
priority: "P1"
scope: "Target"
estimate_hours: 4
owner: "Person 4 – Platform/Integration"
status: "Not Started"
dependencies:
  - "OPS-003"
  - "OPS-004"
  - "OPS-007"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# OPS-008 — Automate staging and production deployment

## User Story

As a platform engineer, I want the delivery team to automate staging and production deployment so that the service can be deployed, integrated, and operated consistently on Cloudflare.

## Description

Deploy reviewed changes to staging and provide an approved production release path with migration ordering.

## Acceptance Criteria

- [ ] Staging deploys are repeatable.
- [ ] Production requires an explicit approval.
- [ ] Database migrations run safely before incompatible code.

## Deliverable / Evidence

Deployment workflows

## Dependencies

- `OPS-003`
- `OPS-004`
- `OPS-007`

