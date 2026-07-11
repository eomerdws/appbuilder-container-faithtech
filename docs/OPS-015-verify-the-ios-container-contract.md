---
id: "OPS-015"
title: "Verify the iOS container contract"
area: "DevOps/Deployment"
epic: "Integration"
priority: "P0"
scope: "MVP"
estimate_hours: 4
owner: "Person 4 – Platform/Integration"
status: "Not Started"
dependencies:
  - "OPS-003"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# OPS-015 — Verify the iOS container contract

## User Story

As a integration engineer, I want the delivery team to verify the iOS container contract so that the service can be deployed, integrated, and operated consistently on Cloudflare.

## Description

Early spike: confirm from the brief and a Safari/sample-container test how the generated iOS app loads the search page and recognizes a package download URL (URL shape, content type, redirect behavior, file extension) before the result card and download action are finalized.

## Acceptance Criteria

- [ ] The public page is tested in Safari or a sample container and the download action matches the expected URL/content behavior.

## Deliverable / Evidence

iOS/web-view compatibility result

## Dependencies

- `OPS-003`

