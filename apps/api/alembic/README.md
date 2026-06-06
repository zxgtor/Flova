# Alembic — schema migrations

## Common commands

```bash
# Generate a new migration after model changes
alembic revision --autogenerate -m "add foo table"

# Apply pending migrations
alembic upgrade head

# Roll back one
alembic downgrade -1

# Show current revision
alembic current
```

## How the DB URL is resolved

`alembic/env.py` reads `flova_api.settings.get_settings().database_url` and
strips the async driver suffix (so `sqlite+aiosqlite` → `sqlite`,
`postgresql+asyncpg` → `postgresql+psycopg`). The migration always runs against
the same database the app does.

## First-run bootstrap (skeleton → migrations)

In a real environment, after pulling this branch:

```bash
# Drop the auto-created skeleton DB (if any)
rm flova.db
alembic upgrade head
```
