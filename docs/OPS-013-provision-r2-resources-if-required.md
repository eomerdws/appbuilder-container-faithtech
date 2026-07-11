---
id: "OPS-013"
title: "Provision R2 resources if required"
area: "DevOps/Deployment"
epic: "Storage"
priority: "P2"
scope: "Stretch"
estimate_hours: 4
owner: "Person 4 – Platform/Integration"
status: "Not Started"
dependencies:
  - "OPS-001"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# OPS-013 — Provision R2 resources if required

## User Story

As a platform engineer, I want the delivery team to provision R2 resources if required so that the service can be deployed, integrated, and operated consistently on Cloudflare.

## Description

Create environment-specific buckets and Worker bindings, keeping objects private unless a deliberate public delivery design is approved.

## Acceptance Criteria

- [ ] Local simulation and production bindings work.
- [ ] Access policy and object naming are documented.

## Deliverable / Evidence

Optional R2 buckets and bindings

## Dependencies

- `OPS-001`

