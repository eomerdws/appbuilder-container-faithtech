---
id: "OPS-004"
title: "Provision and bind the database"
area: "DevOps/Deployment"
epic: "Database"
priority: "P0"
scope: "MVP"
estimate_hours: 4
owner: "Person 4 – Platform/Integration"
status: "Not Started"
dependencies:
  - "OPS-001"
  - "OPS-002"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# OPS-004 — Provision and bind the database

## User Story

As a platform engineer, I want the delivery team to provision and bind the database so that the service can be deployed, integrated, and operated consistently on Cloudflare.

## Description

Create PostgreSQL plus Hyperdrive, or D1 for the hackathon path, and bind separate development/staging/production resources.

## Acceptance Criteria

- [ ] The Worker receives a typed database binding and cannot accidentally point staging at production.

## Deliverable / Evidence

Database and Worker bindings

## Dependencies

- `OPS-001`
- `OPS-002`

