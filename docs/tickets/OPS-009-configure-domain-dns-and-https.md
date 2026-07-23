---
id: "OPS-009"
title: "Configure domain, DNS, and HTTPS"
area: "DevOps/Deployment"
epic: "Networking"
priority: "P1"
scope: "Target"
estimate_hours: 3
owner: "Person 4 – Platform/Integration"
status: "Not Started"
dependencies:
  - "OPS-003"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# OPS-009 — Configure domain, DNS, and HTTPS

## User Story

As a platform engineer, I want the delivery team to configure domain, DNS, and HTTPS so that the service can be deployed, integrated, and operated consistently on Cloudflare.

## Description

Attach the agreed regional search/admin domain and verify TLS and routing.

## Acceptance Criteria

- [ ] Public and admin routes load over HTTPS on the final domain and the iOS configuration uses that stable URL.

## Deliverable / Evidence

Production domain

## Dependencies

- `OPS-003`

