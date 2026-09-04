# Trium

Command center for the day: tasks, time blocks, and notes in one place.

Current product status:

- Email/password auth, instance-code verification/reset, sessions, and account
  deletion are implemented.
- Tasks, calendar/time blocks (including recurrence), and notes are implemented
  end to end, including Home’s today list, around-now preview, and recent notes.

The stack is Vite + React + TypeScript in [`client/`](client/), FastAPI +
SQLAlchemy + PostgreSQL in [`server/`](server/), and Alembic migrations.

## Development with Docker

Requirements: Docker with Compose.

```bash
cp .env.example .env
docker compose up --build
```

- App: <http://localhost:5173>
- API health: <http://localhost:8000/api/health>
- API docs: <http://localhost:8000/docs>

```bash
cd server
pip install -r requirements-dev.txt
python scripts/migrate.py
pytest

cd ../client
npm ci
npm run lint
npm test
npm run build
```

## Run without Docker

Start PostgreSQL, then run the API from `server/`:

```bash
python -m venv .venv
.venv/bin/pip install -r requirements-dev.txt   # POSIX
.venv/Scripts/pip install -r requirements-dev.txt  # Windows
.venv/bin/python scripts/migrate.py
.venv/bin/python -m pytest
uvicorn app.main:app --reload
```

In another terminal, from `client/`:

```bash
npm ci
npm run dev
```

## Production HTTPS deployment

Create `.env` from `.env.example` and replace every production placeholder.
`DOMAIN`, `INSTANCE_CODE`, `SECRET_KEY`, and `POSTGRES_PASSWORD` are required;
production validation rejects an empty instance code or weak secret key. Point
the domain’s DNS records at the VPS and allow inbound TCP 80/443 and UDP 443.

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

The production stack runs the safe migration wrapper before the API, serves
the built SPA through Caddy, redirects to and renews HTTPS automatically, and
proxies `/api` on the same origin. PostgreSQL and FastAPI have no public ports.
Back up the `postgres_data` volume before upgrades.

Apply migrations manually when needed:

```bash
cd server
python scripts/migrate.py
```

The wrapper recognizes the exact unversioned schema previously created by
SQLAlchemy `create_all`, stamps it at the legacy baseline, and then upgrades
it. Empty and already versioned databases follow normal Alembic upgrades.
Unknown or partial unversioned schemas stop with an error instead of being
stamped.

See [`docs/product.md`](docs/product.md) and
[`docs/execution.md`](docs/execution.md) for locked product decisions.

License: [GNU GPL v3](LICENSE).
