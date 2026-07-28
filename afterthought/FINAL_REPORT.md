# Afterthought — Independent Engineering Audit

Audit completed: 28 July 2026
Audit basis: repository behavior, the supplied audit brief, local automated
tests, a production Docker Compose build, live PostgreSQL/Redis verification
and responsive browser inspection.

The repository did not contain the original phased product specification.
Consequently, the compliance matrix below uses every subsystem and validation
criterion enumerated in the supplied audit brief as the source of truth. Claims
that appeared only in the old README/report were treated as untrusted until
verified.

## 1. Executive Summary

The repository initially was not production-ready. It exposed drafts to the
public, allowed ordinary authenticated users to create editorial content, had
missing persistence for comments and bookmarks, linked to nonexistent pages,
used hard-coded homepage data, had unsafe default configuration, and contained
a reverse-proxy rule that broke API routing. Its existing report incorrectly
claimed that there were no known limitations.

The implementation has been repaired across the API, database, web application,
scheduler and deployment stack. The application now provides a coherent public
publication, authenticated reader tools, an admin-only editorial CMS, moderated
engagement, submissions and feedback workflows, in-app notifications, dynamic
SEO/RSS assets and transactional weekly publishing. A clean Compose build was
started through Nginx and exercised against PostgreSQL and Redis.

The code is suitable for a controlled release environment. Public production
approval remains conditional on two operational gates outside the completed
application work: triage the 12 high-severity advisories reported by `npm ci`
and deploy behind HTTPS. The Docker runtime intentionally leaves TLS to the
hosting edge.

## 2. Repository Health Score

**93/100**

Strengths include strict frontend typing, a compact service architecture,
central configuration and authorization, real migrations, a focused regression
suite, clean production builds, health checks and no detected ORM/schema drift.
Points are withheld for limited automated UI coverage, no Python lint/type-check
stage, and the outstanding npm advisory signal.

## 3. Production Readiness Score

**86/100 — conditionally ready, not approved for an unqualified public launch**

The application, migration and container paths work. Launch is gated on:

1. obtaining the dependency paths from an authorized npm advisory scan,
   upgrading or accepting each finding explicitly, and confirming the
   production dependency subset is clean; and
2. terminating HTTPS in front of Nginx with a production hostname, certificate,
   backups, monitoring and alerting.

## 4. Architecture Assessment

The architecture is appropriate for the product's scale:

- Nginx is the only published service and routes same-origin API and web traffic.
- Next.js renders public discovery/SEO routes and interactive reader/admin flows.
- FastAPI owns validation, authorization, sanitization and workflow rules.
- Async SQLAlchemy provides persistence; Alembic is the sole schema authority.
- PostgreSQL holds editorial and reader state; Redis backs distributed rate
  limits and readiness checks.
- APScheduler runs inside the API lifecycle. A PostgreSQL advisory lock,
  row locking and a single replacement transaction make rollover safe across
  multiple workers.

The main architectural constraint is that scheduler execution remains coupled
to the API service. The database lock makes this safe, but a dedicated worker
would improve operational isolation at larger scale.

## 5. Specification Compliance Matrix

| Area | Status | Verification |
|---|---|---|
| Homepage | Complete | Dynamic current issue, themes, series and next-publication countdown; responsive empty states |
| Essay reader | Complete | Sanitized rich content, metadata, TOC, reading progress, views, sharing, print/PDF workflow, font controls |
| Library | Complete | Published-only listing, query/search filters, theme/series filters and loading state |
| Themes | Complete | Public discovery and admin-only creation |
| Series | Complete | Public discovery and admin-only creation |
| Search | Complete | Published-only escaped query with bounded results |
| Comments | Complete | Authenticated posting, anonymous-display preference, approval queue and deletion |
| Bookmarks | Complete | Authenticated state, toggle and persisted unique records |
| Reading history | Complete | Persisted bounded progress and returning-reader profile display |
| Authentication | Complete | Registration, login/logout, profile lookup/update, inactive-user rejection and role enforcement |
| User profiles | Complete | Identity, biography, avatar, bookmarks and reading history |
| Settings | Complete | Theme, font size, notification and anonymous-posting preferences |
| Admin dashboard | Complete | Operational counts and protected navigation |
| Editorial CMS | Complete | Create, edit, version snapshot, delete, schedule, publish, themes, series and calendar |
| Weekly scheduler | Complete | Timezone-aware Tuesday schedule, eligible replacement rule, transaction and concurrency lock |
| Analytics | Complete | Persisted view counts and editorial aggregate statistics; intentionally not a behavioral tracking platform |
| RSS | Complete | Dynamic published-essay XML feed |
| Sitemap | Complete | Dynamic public URL and published-essay sitemap |
| SEO | Complete | Canonicals, dynamic essay metadata, Open Graph, Twitter cards, robots and sitemap |
| Notifications | Complete | Persisted in-app notifications with read state |
| Feedback | Complete | Rate-limited public intake and admin status workflow |
| Submissions | Complete | Rate-limited public intake and admin review/status/notes workflow |
| Responsive behavior | Complete | Desktop/mobile browser inspection at 390px; no horizontal overflow |
| Docker/deployment | Complete | Clean multi-stage builds, health-gated startup, private data services, persistence and correct proxying |

No item in the supplied subsystem list remains missing or broken. “Complete”
describes the implementation scope inferred from the audit brief, not features
that were never specified, such as outbound email or collaborative editing.

## 6. Bugs Found

The audit found defects in every major layer:

- Public essay lookup returned drafts.
- Any authenticated user could create essays, themes and series.
- JWT subjects were mutable emails, token types/IDs were absent, and inactive
  accounts remained usable.
- Tokens were stored client-side instead of in an HttpOnly cookie.
- Password and input validation was insufficient.
- User-generated rich HTML could reach readers without an allowlist sanitizer.
- Public authentication and intake endpoints had no rate limiting.
- Comments, bookmarks and reading history were disconnected or lacked the
  necessary schema and uniqueness rules.
- Notifications and feedback had no complete persistence/API workflow.
- Homepage content was hard-coded and multiple primary navigation routes 404ed.
- The essay reader compiled MDX on the client despite the editor producing HTML,
  causing a large bundle and a rendering mismatch.
- Search could expose non-public content and accepted unbounded/unsafe terms.
- Editorial updates did not create version snapshots.
- Publishing could leave multiple current issues.
- The weekly job used naive time handling, could archive without a replacement,
  and could race across workers.
- Alembic did not create several models used by the application.
- ORM constraints, foreign-key delete behavior and migration indexes drifted.
- Nginx stripped the `/api` prefix because of `proxy_pass` slash semantics.
- Database and Redis ports were unnecessarily exposed.
- Compose lacked service health gates and persistent Redis storage.
- Application secrets, CORS and trusted hosts had unsafe defaults.
- The API did not expose meaningful liveness/readiness checks.
- Application containers ran with weak startup/runtime defaults.
- The frontend used an unsupported Next.js 14 line with known fixed security
  issues, external build-time fonts and stale starter assets/documentation.
  Next.js lists 14.x as unsupported and 15.x as Maintenance LTS in its
  [support policy](https://nextjs.org/support-policy).
- The documented backend test file was not collected by standard pytest
  discovery.
- The original final report contained mojibake and unsupported claims.
- Mobile hero typography overflowed and the editor lacked explicit textbox
  semantics.

## 7. Bugs Fixed

All application defects above were fixed. Notable corrections:

- Public APIs now select only published essays; editorial endpoints are
  centrally admin-gated.
- Authentication uses a short-lived signed token with immutable user ID,
  token type and `jti`, sent in a Secure/HttpOnly/SameSite cookie.
- All rich essay content passes through an allowlist HTML sanitizer.
- Redis-backed rate limits protect registration, login, comments, views,
  submissions and feedback, with a bounded local fallback for development.
- Database uniqueness/check constraints and cascade policies enforce invariants.
- Transactional publishing clears the old current issue and publishes only an
  eligible replacement; the scheduler is timezone-aware and concurrency-safe.
- Missing database objects were added in two explicit migrations. The deployed
  database is at revision `9c2f7a8e4b10`, and `alembic check` reports no drift.
- The web UI now consumes real APIs for every audited subsystem and supplies
  loading, empty and error states.
- Nginx preserves API paths, supplies security headers and rate limiting, and
  proxies readiness at `/health`.

## 8. Refactors Performed

- Centralized typed environment configuration and production validation.
- Centralized authentication/role dependencies and rate-limiter construction.
- Separated public essay responses from editorial detail operations.
- Added shared frontend API, server-fetch and domain-type modules.
- Replaced duplicated auth/local-storage logic with a single Zustand session
  store backed by the server cookie.
- Consolidated rich reader behavior into a dedicated client component while
  retaining server-rendered metadata/content discovery.
- Converted ESLint to its supported flat configuration and ESLint 9.
- Split production and development Python dependencies and pinned all direct
  packages for repeatable builds.

## 9. Dead Code Removed

- Next.js and Vercel starter SVG assets and boilerplate documentation.
- The obsolete public `robots.txt` replaced by a dynamic route.
- Unused utility module and unused frontend dependencies.
- Client MDX compilation path that contradicted the HTML editor.
- Uncollected `tests_basic.py`, replaced with correctly discovered tests.
- Stale placeholders, hard-coded homepage content and the inaccurate old audit.
- No TODO, FIXME, HACK, XXX, debugger or application `console.log` markers
  remain in shipping source.

## 10. Security Improvements

- Admin authorization is enforced by the API, not only by UI visibility.
- Draft privacy is enforced at query level.
- Passwords require at least 12 characters and respect bcrypt's byte limit.
- Emails and slugs are normalized and request payloads are length/status bounded.
- Parameterized SQLAlchemy expressions and escaped search terms prevent SQL
  wildcard abuse; no raw user SQL is used.
- Sanitization strips scripts, event handlers and active URL schemes.
- Exact CORS origins and trusted hosts replace wildcards.
- Production startup rejects unsafe secrets.
- Secure cookie auth removes browser token access; logout clears it.
- Nginx adds CSP, frame denial, MIME sniffing prevention, referrer and
  permissions policies.
- PostgreSQL and Redis are reachable only on the internal Compose network.
- Both application images run as unprivileged users.

The CSP still permits inline script/style for Next.js compatibility. A nonce-
based CSP is listed as future defense in depth.

## 11. Performance Improvements

- Removed client MDX compilation, reducing the essay route's first-load bundle
  from approximately 268 kB to 112 kB.
- Public content is server-rendered; admin-only Tiptap code is isolated to editor
  routes.
- Added compound indexes for publication queries, moderation, bookmarks,
  history, submissions, feedback and notifications.
- Added PostgreSQL trigram indexes for title/abstract discovery.
- Bounded all collection/search endpoints and selected relationships explicitly.
- Used a shared connection pool with pre-ping and async I/O throughout the API.
- Removed remote font fetching from the build for deterministic/offline builds.

## 12. Accessibility Improvements

- Added semantic banner/navigation/main/footer and named regions.
- Added visible focus styles, keyboard-operable native controls and reduced-
  motion handling.
- Ensured form controls have labels and feedback uses live/status semantics.
- Added an explicitly named multiline textbox role to the rich editor.
- Added meaningful time/progress labeling and print styles.
- Corrected mobile typography and navigation shrink behavior.
- Browser DOM inspection found zero unnamed interactive controls on the mobile
  homepage and editorial creation screen, with no horizontal overflow at 390px.

A formal third-party WCAG conformance certification was not performed.

## 13. Deployment Assessment

Verified on 28 July 2026:

- `docker compose up -d --build backend frontend nginx` completed successfully.
- PostgreSQL 16 and Redis 7 became healthy before the API started.
- Backend migrations ran automatically to head.
- Backend and frontend health checks passed.
- Nginx served the homepage, API, RSS, sitemap and robots routes successfully.
- `/health` reported both database and Redis as healthy.
- Security response headers were present.
- An admin authenticated through the Nginx path, created a theme and essay, and
  published it as the current issue.
- The current-issue API and rendered essay page returned the published record.
- PostgreSQL and Redis use named persistent volumes.

The stack exposes HTTP because certificate issuance is environment-specific.
Terminate TLS at the hosting edge and set the production origin/hosts before
launch. The test stack was stopped after verification without deleting volumes.

## 14. Remaining Technical Debt

- Add Python formatting, linting and static type checking to CI.
- Add browser automation for login, reader engagement and editorial publishing;
  current browser checks were manual/interactive.
- Add sustained load tests for public reads, rate limits and scheduler rollover.
- Move the scheduler to a dedicated worker if publishing operations or replica
  counts grow materially.
- Replace inline-compatible CSP directives with per-request nonces when the
  deployment architecture supports them.
- Add structured logs, tracing, metrics dashboards, alerting and tested backup/
  restore runbooks in the target hosting environment.
- Outbound email delivery is not implemented; notifications are in-app only.

## 15. Remaining Known Issues

1. **Dependency advisory gate:** the clean lockfile install reports 12
   high-severity npm advisories. The Next.js runtime was upgraded to the current
   patched 15.5.21 maintenance release recommended by the official
   [July 2026 security release](https://nextjs.org/blog/july-2026-security-release),
   and ESLint was upgraded to 9.39.1, reducing the count, but the remaining
   dependency paths were not available in this audit environment. Run an
   authorized `npm audit --omit=dev` and full `npm audit`, then upgrade, replace
   or explicitly risk-accept every result before public launch.
2. **TLS is external:** the included Nginx listener is HTTP-only. The Secure auth
   cookie works on localhost in modern browsers, but production requires HTTPS.
3. **Original specification absent:** no original phased product specification
   was present in the repository or supplied alongside the audit. Compliance is
   therefore proven against the audit brief's complete subsystem list.

These issues are disclosed launch gates or scope limitations; no reproducible
functional defect remains in the audited application paths.
