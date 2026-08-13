-- Run as the postgres superuser to create the application role and database.
-- Example: psql -U postgres -f scripts/setup-db.sql

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'root') THEN
    CREATE ROLE root WITH LOGIN PASSWORD 'secured_login_dev';
  END IF;
END
$$;

SELECT 'CREATE DATABASE secured_login OWNER root'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'secured_login')\gexec

GRANT ALL PRIVILEGES ON DATABASE secured_login TO root;
