# Trium server

FastAPI application that owns authentication and all user data.

Auth, Tasks, time blocks (including recurrence expansion on read), and Notes are
implemented. Sessions last until password reset, logout, or account deletion.
Auth rate limiting is in-memory per process; a single API worker is assumed.

Run from this directory after starting PostgreSQL and configuring
`DATABASE_URL`:

```bash
python -m venv .venv
.venv/bin/pip install -r requirements-dev.txt          # POSIX
.venv/Scripts/pip install -r requirements-dev.txt     # Windows
.venv/bin/python scripts/migrate.py
.venv/bin/uvicorn app.main:app --reload
```

Health: <http://localhost:8000/api/health>  
OpenAPI: <http://localhost:8000/docs>

```bash
.venv/bin/python -m pytest          # POSIX
.venv/Scripts/python -m pytest      # Windows
```

Revoked refresh-token rows left behind by rotation can be cleaned with
`python scripts/purge_revoked_tokens.py`. Active sessions are not touched.

## Migrations

The application never creates tables at runtime. Alembic reads
`Settings.database_url`, so configuration comes from `DATABASE_URL` or the
server `.env` file.

```bash
python scripts/migrate.py
alembic current
```

`scripts/migrate.py` handles three cases before starting Uvicorn in both Docker
stacks:

- an empty database receives the normal upgrade to `head`;
- the exact unversioned schema formerly produced by `create_all` is validated,
  stamped at `20260831_0001`, and upgraded;
- a partial or unknown unversioned schema fails without stamping.

Already versioned databases receive the normal Alembic upgrade. Tests
intentionally create and drop their isolated SQLite schema in
`tests/conftest.py`.

In production use `ENVIRONMENT=production`, an HTTPS `CLIENT_ORIGIN`, a
non-empty `INSTANCE_CODE`, and a unique `SECRET_KEY` of at least 32 characters.
The production Compose stack keeps this service private behind Caddy at `/api`.
