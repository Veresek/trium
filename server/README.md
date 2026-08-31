# Trium server

FastAPI application that owns authentication and all user data.

Auth and Tasks are implemented. Time blocks and Notes remain authenticated
scaffolds: collection reads return empty lists and mutations return HTTP 501.

Run from this directory after starting PostgreSQL and configuring
`DATABASE_URL`:

```bash
python -m venv .venv
.venv/Scripts/pip install -r requirements-dev.txt
.venv/Scripts/python scripts/migrate.py
uvicorn app.main:app --reload
```

Health: <http://localhost:8000/api/health>  
OpenAPI: <http://localhost:8000/docs>

```bash
.venv/Scripts/python -m pytest
```

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
