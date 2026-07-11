---
id: "FE-007"
title: "Integrate Paraglide localization"
area: "Frontend"
epic: "Localization"
priority: "P0"
scope: "MVP"
estimate_hours: 5
owner: "Person 3 – Frontend"
status: "Not Started"
dependencies:
  - "FE-001"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# FE-007 — Integrate Paraglide localization

## User Story

As a language-community user, I want the delivery team to integrate Paraglide localization so that users and administrators can complete the workflow clearly on mobile and desktop.

## Description

Replace svelte-i18n with Paraglide and port the core interface messages required for the public and admin flows.

## Acceptance Criteria

- [ ] Locale selection persists, unsupported browser locales fall back cleanly, and UI strings are not embedded in components.

## Deliverable / Evidence

Paraglide configuration and core locales

## Dependencies

- `FE-001`

