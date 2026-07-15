---
id: "OPS-002"
title: "Add Cloudflare build configuration"
area: "DevOps/Deployment"
epic: "Worker setup"
priority: "P0"
scope: "MVP"
estimate_hours: 3
owner: "Person 4 – Platform/Integration"
status: "Not Started"
dependencies:
  - "OPS-001"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# OPS-002 — Add Cloudflare build configuration

## User Story

As a platform engineer, I want the delivery team to add Cloudflare build configuration so that the service can be deployed, integrated, and operated consistently on Cloudflare.

## Description

Install Wrangler and the Cloudflare SvelteKit adapter; create configuration, scripts, compatibility settings, and generated binding types.

## Acceptance Criteria

- [ ] Local preview and production build use the Cloudflare runtime configuration rather than adapter-auto.

## Deliverable / Evidence

wrangler configuration and deploy scripts

## Dependencies

- `OPS-001`

