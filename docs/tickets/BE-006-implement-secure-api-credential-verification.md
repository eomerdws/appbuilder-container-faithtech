---
id: "BE-006"
title: "Verify the shared Scriptoria notification secret"
area: "Backend"
epic: "Security"
priority: "P0"
scope: "MVP"
estimate_hours: 2
owner: "Person 2 – API/Security"
status: "Not Started"
dependencies:
  - "BE-005"
  - "OPS-006"
source: "Glocal_Hackathon_Implementation_Tickets.xlsx"
---

# BE-006 — Verify the shared Scriptoria notification secret

## User Story

As a Scriptoria integration operator, I want the notification intake endpoint to
authenticate the publishing service so that only Scriptoria can submit packages
for moderation.

## Description

The Scriptoria build engine (`appbuilder-buildengine-api`, `publish.sh`,
configured on Scriptoria's side via `PUBLISH_NOTIFY`) sends the REST package
notification with a shared secret in the `Authorization: Bearer <secret>`
header. `POST /api/v1/notifications/scriptoria` must verify that secret before
ingesting anything.

For the MVP this is a **single shared secret**, not a managed per-user credential
store:

- The secret lives only as the `SCRIPTORIA_API_KEY` Worker secret (set with
  `wrangler secret put`, mirrored in `.dev.vars` for local dev). It is **never**
  stored in D1, never returned by any endpoint, and never rendered in the admin
  UI — so there is nothing to leak. (This intentionally supersedes the 2023
  prototype's "API Keys" screen, which displayed live key values in a table.)
- Compare the presented token to the configured secret in **constant time**
  (`crypto.subtle.timingSafeEqual`).
- **Fail closed:** if `SCRIPTORIA_API_KEY` is unset, reject rather than accept
  traffic, so the endpoint can never be unauthenticated by accident.

The per-user, rotatable, generate-and-revoke credential model and its admin UI
are deferred — see `BE-014` and `FE-013`, now optional/`Target` scope.

> Header contract: Scriptoria's build engine reads the notify URL and headers
> from a per-receiver config (`notify/<server>/endpoint.json` in the build-engine
> secrets, consumed by `publish.sh`), so the header is agreed, not hard-coded.
> This service requires `Authorization: Bearer <secret>`, and the **same secret**
> must be set as `SCRIPTORIA_API_KEY` here and written into Scriptoria's
> `endpoint.json` `headers` for our server.

## Acceptance Criteria

- [ ] A notification with the correct bearer secret is accepted; a missing,
      malformed, or incorrect one is rejected with `401` before any DB work.
- [ ] The secret exists only as a Worker secret — never stored in D1, logged, or
      returned in a response.
- [ ] The comparison is timing-safe.
- [ ] An unset `SCRIPTORIA_API_KEY` fails closed (the endpoint rejects; the
      misconfiguration is surfaced, not silently ignored).

## Deliverable / Evidence

`verifyScriptoriaSecret` helper, the auth check on the intake endpoint, and
verification tests (accept / wrong / missing / non-bearer / unset-fails-closed).

## Dependencies

- `BE-005`
- `OPS-006`
