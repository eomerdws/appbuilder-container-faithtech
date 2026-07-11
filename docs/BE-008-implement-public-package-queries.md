---
id: "BE-008"
title: "Implement public package queries"
area: "Backend"
epic: "Catalogue"
priority: "P0"
scope: "MVP"
estimate_hours: 4
owner: "Person 1 – Data/Backend"
status: "Not Started"
dependencies:
  - "BE-003"
  - "BE-004"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# BE-008 — Implement public package queries

## User Story

As a catalogue consumer, I want the delivery team to implement public package queries so that package publication, moderation, and discovery are secure and reliable.

## Description

Return only active packages and support search over local names, alternate names, ISO codes, and regions.

## Acceptance Criteria

- [ ] Search is case-insensitive, bounded, localized, and never returns pending, rejected, or inactive packages.

## Deliverable / Evidence

Public catalogue query service

## Dependencies

- `BE-003`
- `BE-004`

