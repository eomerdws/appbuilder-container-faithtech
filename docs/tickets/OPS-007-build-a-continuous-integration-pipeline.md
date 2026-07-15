---
id: "OPS-007"
title: "Build a continuous-integration pipeline"
area: "DevOps/Deployment"
epic: "CI"
priority: "P0"
scope: "MVP"
estimate_hours: 4
owner: "Person 4 – Platform/Integration"
status: "Not Started"
dependencies:
  - "OPS-002"
  - "BE-019"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# OPS-007 — Build a continuous-integration pipeline

## User Story

As a platform engineer, I want the delivery team to build a continuous-integration pipeline so that the service can be deployed, integrated, and operated consistently on Cloudflare.

## Description

Run install, formatting, lint, type check, generated types, unit tests, build, and selected browser tests.

## Acceptance Criteria

- [ ] Pull requests cannot merge when a required check fails.
- [ ] The workflow uses the same Node and build assumptions as deployment.

## Deliverable / Evidence

Required GitHub checks

## Dependencies

- `OPS-002`
- `BE-019`

