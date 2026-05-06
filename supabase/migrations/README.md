## Tellinex prod baseline migration

This directory holds the single baseline migration that gives fresh Supabase
branches a complete starting point for the `public` schema of project
`egztpclpcnizcdtfugsv` (Tellinex-command-centre).

### Why this exists

Prod accumulated 280+ migrations applied directly via SQL outside the Supabase
migration system. Multiple tables (e.g. `activity_log`) and 30+ columns existed
on prod but were not created by any tracked migration. As a result, fresh
branches failed to apply migration history because later `ALTER TABLE` /
`ALTER COLUMN` statements referenced objects that were never created.

The fix is a single baseline migration, dated **before** every existing
migration, that creates the entire current `public` schema using idempotent
DDL. Subsequent migrations (which previously produced drift) become mostly
no-ops on fresh branches because everything they create or alter already
exists.

### Files

- `20260403000000_baseline_prod_schema_dump_6may2026.sql` — the baseline DDL.
  385 tables, 192 user functions, 86 triggers, 463 policies, 384 indexes,
  1434 constraints, 8 extensions, 1 event trigger.
- `_extractor.sql` — the PL/pgSQL extractor that produced the baseline by
  scanning `pg_catalog`. Stored for reproducibility.

### Production state

The same DDL is stored as a row in
`supabase_migrations.schema_migrations` on prod at version
`20260403000000`. The `INSERT` was non-destructive — prod schema was not
modified, only the migration history table got a new row that fresh branches
will replay.

### Generation method

The standard plan was to run `supabase db dump --schema-only --linked` from a
Mac with the Supabase CLI. That path was unavailable in this CI session
(Linux container, no DB password, local `pg_dump` is v16 against a v17
server). Instead the dump was generated server-side using a temporary
PL/pgSQL function (`public._tx_dump_public_schema`) that scans `pg_catalog`
and emits idempotent DDL via the built-in `pg_get_*def(...)` functions. The
helper functions were dropped after use.

### Idempotency

Every emitted statement is safe to run against a database that already has
the object:

| Object        | Idempotency mechanism                                  |
|---------------|--------------------------------------------------------|
| Extensions    | `CREATE EXTENSION IF NOT EXISTS`                       |
| Schemas       | `CREATE SCHEMA IF NOT EXISTS`                          |
| Sequences     | `CREATE SEQUENCE IF NOT EXISTS`                        |
| Tables        | `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ENABLE RLS`|
| Constraints   | wrapped in `DO $$ ... EXCEPTION WHEN duplicate_object` |
| Indexes       | `CREATE [UNIQUE] INDEX IF NOT EXISTS`                  |
| Functions     | `CREATE OR REPLACE FUNCTION`                           |
| Views         | `CREATE OR REPLACE VIEW`                               |
| Triggers      | `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER`            |
| Event triggers| `DROP EVENT TRIGGER IF EXISTS` + `CREATE EVENT TRIGGER`|
| Policies      | `DROP POLICY IF EXISTS` + `CREATE POLICY`              |

### Things this baseline does NOT cover

- Other schemas (`auth`, `storage`, `realtime`, `vault`, `pgmq`, etc.) — those
  are managed by Supabase platform defaults and don't need re-creation.
- Custom types in `public` — none exist on prod.
- Materialised views — none exist on prod.
- `COMMENT ON ...` statements — not preserved (cosmetic).
- `GRANT` / `REVOKE` statements — Supabase platform defaults are sufficient.
- Data — schema only, by design.

### Cross-version note

Prod runs PostgreSQL 17.6.1.084. The local CLI environment had `pg_dump` 16
which would have refused the dump even if credentials had been available. The
SQL-only extractor sidesteps the version skew because everything is computed
inside the server.
