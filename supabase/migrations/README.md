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

### Replay verification

A fresh Supabase development branch (`staging-baseline-test`) was created
and rebased through the full migration history. Result: the baseline ran
cleanly, populating the public schema (386 tables, 936 functions, 86
triggers, 482 policies, all expected key tables — `alarms`, `audit_log`,
`activity_log`, etc.). The branch reports `preview_project_status:
ACTIVE_HEALTHY`. Subsequent migrations in the existing 336-row chain replay
on top with one known drift point (see "Known follow-on drift" below).

### Ordering subtleties handled by the extractor

Four sequencing pitfalls surfaced during replay and are now handled:

1. **`SET check_function_bodies = false`** at the top — lets SQL-language
   functions reference tables that don't exist yet (validated at runtime).
2. **Two-pass functions** around the table block:
   - Early pass: functions whose signatures don't use user-table row types.
     Required because tables can have `GENERATED ALWAYS AS (some_fn(...))
     STORED` columns (e.g. `safe_make_point` in `alarms.geog`).
   - Deferred pass (after tables): functions whose signatures DO use a
     user-table row type (e.g. `RETURNS audit_log`, `arg fp_jobs`). These
     need the table type to exist first.
3. **Sequences include SERIAL-backing** (`pg_depend.deptype='a'`); only
   IDENTITY-backing (`'i'`) is excluded, since the column-level GENERATED
   IDENTITY clause recreates those automatically. `ALTER SEQUENCE … OWNED
   BY …` runs after tables to restore SERIAL ownership.
4. **Constraints / indexes / triggers on extension-owned tables** (postgis
   `spatial_ref_sys`, `geography_columns`, `geometry_columns`) are
   filtered. The TABLE itself is flagged extension-owned, but its
   CONSTRAINTS and INDEXES aren't — so naive filters slip them through and
   the migration fails with `must be owner of table spatial_ref_sys`.

### Known follow-on drift (not a baseline issue)

Migration `20260405133253 create_forecast_functions` does
`CREATE OR REPLACE FUNCTION get_average_velocity(...)` with a `RETURNS
TABLE(...)` shape that differs from the current prod definition. PostgreSQL
disallows `OR REPLACE` to change return type — needs a `DROP FUNCTION
IF EXISTS` first. This is unrelated to the baseline; fixing it is the
next patch.

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
