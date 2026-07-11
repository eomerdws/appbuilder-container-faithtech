---
id: "OPS-006"
title: "Configure secrets and environment variables"
area: "DevOps/Deployment"
epic: "Secrets"
priority: "P0"
scope: "MVP"
estimate_hours: 3
owner: "Person 4 – Platform/Integration"
status: "Not Started"
dependencies:
  - "OPS-002"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# OPS-006 — Configure secrets and environment variables

## User Story

As a platform security operator, I want the delivery team to configure secrets and environment variables so that the service can be deployed, integrated, and operated consistently on Cloudflare.

## Description

Define required secret names, use local ignored secret files, and configure encrypted production secrets for auth, database, email, and credential hashing.

## Acceptance Criteria

- [ ] No secret is committed or exposed through PUBLIC variables.
- [ ] Deployment fails clearly when required secrets are missing.

## Deliverable / Evidence

Secret inventory and configured bindings

## Dependencies

- `OPS-002`

