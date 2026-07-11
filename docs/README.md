# Glocal Hackathon Tickets

This folder contains one Markdown story/ticket for every row in the `Tickets` worksheet of `Glocal_Hackathon_Implementation_Tickets.xlsx`.

- Ticket count: 52
- Backend: 19
- Frontend: 17
- DevOps/Deployment: 16

Each file includes spreadsheet metadata, a user story, description, checkbox acceptance criteria, expected deliverable, and dependencies.

## Backend

- [BE-001 — Define backend boundaries](BE-001-define-backend-boundaries.md) — P0 · MVP · 2h
- [BE-002 — Design the relational schema](BE-002-design-the-relational-schema.md) — P0 · MVP · 4h
- [BE-003 — Configure Prisma for the Worker runtime](BE-003-configure-prisma-for-the-worker-runtime.md) — P0 · MVP · 5h
- [BE-004 — Create migrations and seed data](BE-004-create-migrations-and-seed-data.md) — P0 · MVP · 4h
- [BE-005 — Validate Scriptoria notifications](BE-005-validate-scriptoria-notifications.md) — P0 · MVP · 4h
- [BE-006 — Implement secure API credential verification](BE-006-implement-secure-api-credential-verification.md) — P0 · MVP · 4h
- [BE-007 — Implement idempotent package ingestion](BE-007-implement-idempotent-package-ingestion.md) — P0 · MVP · 5h
- [BE-008 — Implement public package queries](BE-008-implement-public-package-queries.md) — P0 · MVP · 4h
- [BE-009 — Implement package status transitions](BE-009-implement-package-status-transitions.md) — P0 · MVP · 4h
- [BE-010 — Implement administrator sessions](BE-010-implement-administrator-sessions.md) — P0 · MVP · 6h
- [BE-011 — Enforce role checks on the server](BE-011-enforce-role-checks-on-the-server.md) — P0 · MVP · 4h
- [BE-012 — Handle package versions and republishing](BE-012-handle-package-versions-and-republishing.md) — P1 · Target · 5h
- [BE-013 — Implement user and role services](BE-013-implement-user-and-role-services.md) — P1 · Target · 5h
- [BE-014 — Implement API credential lifecycle](BE-014-implement-api-credential-lifecycle.md) — P1 · Target · 5h
- [BE-015 — Implement interface settings service](BE-015-implement-interface-settings-service.md) — P1 · Target · 3h
- [BE-016 — Record an administrative audit log](BE-016-record-an-administrative-audit-log.md) — P1 · Target · 4h
- [BE-017 — Send new-package administrator alerts](BE-017-send-new-package-administrator-alerts.md) — P2 · Stretch · 4h
- [BE-018 — Mirror packages or images to R2](BE-018-mirror-packages-or-images-to-r2.md) — P2 · Stretch · 8h
- [BE-019 — Add backend unit and integration tests](BE-019-add-backend-unit-and-integration-tests.md) — P0 · MVP · 5h

## Frontend

- [FE-001 — Upgrade the application scaffold](FE-001-upgrade-the-application-scaffold.md) — P0 · MVP · 5h
- [FE-002 — Define mobile-first information architecture](FE-002-define-mobile-first-information-architecture.md) — P0 · MVP · 2h
- [FE-003 — Build the responsive app shell](FE-003-build-the-responsive-app-shell.md) — P0 · MVP · 3h
- [FE-004 — Build unified package search](FE-004-build-unified-package-search.md) — P0 · MVP · 5h
- [FE-005 — Build result cards and download action](FE-005-build-result-cards-and-download-action.md) — P0 · MVP · 4h
- [FE-006 — Add public package details](FE-006-add-public-package-details.md) — P1 · Target · 4h
- [FE-007 — Integrate Paraglide localization](FE-007-integrate-paraglide-localization.md) — P0 · MVP · 5h
- [FE-008 — Complete RTL and all supplied locales](FE-008-complete-rtl-and-all-supplied-locales.md) — P1 · Target · 5h
- [FE-009 — Build login and session UI](FE-009-build-login-and-session-ui.md) — P0 · MVP · 4h
- [FE-010 — Build package queue dashboard](FE-010-build-package-queue-dashboard.md) — P0 · MVP · 5h
- [FE-011 — Build package review and actions](FE-011-build-package-review-and-actions.md) — P0 · MVP · 5h
- [FE-012 — Build user and role management UI](FE-012-build-user-and-role-management-ui.md) — P1 · Target · 4h
- [FE-013 — Build API credential management UI](FE-013-build-api-credential-management-ui.md) — P1 · Target · 4h
- [FE-014 — Build interface settings UI](FE-014-build-interface-settings-ui.md) — P1 · Target · 4h
- [FE-015 — Implement loading, empty, error, and confirmation states](FE-015-implement-loading-empty-error-and-confirmation-states.md) — P0 · MVP · 3h
- [FE-016 — Perform accessibility and mobile web-view QA](FE-016-perform-accessibility-and-mobile-web-view-qa.md) — P0 · MVP · 4h
- [FE-017 — Replace stale browser tests](FE-017-replace-stale-browser-tests.md) — P1 · Target · 4h

## DevOps / Deployment

- [OPS-001 — Choose deployment and environment topology](OPS-001-choose-deployment-and-environment-topology.md) — P0 · MVP · 2h
- [OPS-002 — Add Cloudflare build configuration](OPS-002-add-cloudflare-build-configuration.md) — P0 · MVP · 3h
- [OPS-003 — Provision a staging Worker](OPS-003-provision-a-staging-worker.md) — P0 · MVP · 3h
- [OPS-004 — Provision and bind the database](OPS-004-provision-and-bind-the-database.md) — P0 · MVP · 4h
- [OPS-005 — Create local development and migration workflow](OPS-005-create-local-development-and-migration-workflow.md) — P0 · MVP · 3h
- [OPS-006 — Configure secrets and environment variables](OPS-006-configure-secrets-and-environment-variables.md) — P0 · MVP · 3h
- [OPS-007 — Build a continuous-integration pipeline](OPS-007-build-a-continuous-integration-pipeline.md) — P0 · MVP · 4h
- [OPS-008 — Automate staging and production deployment](OPS-008-automate-staging-and-production-deployment.md) — P1 · Target · 4h
- [OPS-009 — Configure domain, DNS, and HTTPS](OPS-009-configure-domain-dns-and-https.md) — P1 · Target · 3h
- [OPS-010 — Enable logs and error monitoring](OPS-010-enable-logs-and-error-monitoring.md) — P1 · Target · 3h
- [OPS-011 — Add platform security controls](OPS-011-add-platform-security-controls.md) — P1 · Target · 4h
- [OPS-012 — Document backup, rollback, and recovery](OPS-012-document-backup-rollback-and-recovery.md) — P2 · Stretch · 4h
- [OPS-013 — Provision R2 resources if required](OPS-013-provision-r2-resources-if-required.md) — P2 · Stretch · 4h
- [OPS-014 — Configure Scriptoria notification smoke test](OPS-014-configure-scriptoria-notification-smoke-test.md) — P0 · MVP · 4h
- [OPS-015 — Verify the iOS container contract](OPS-015-verify-the-ios-container-contract.md) — P0 · MVP · 4h
- [OPS-016 — Create deployment and operations documentation](OPS-016-create-deployment-and-operations-documentation.md) — P1 · Target · 3h


