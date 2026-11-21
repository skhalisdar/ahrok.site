-- Run as owner after creating a separate COMPASS login role named compass_runtime.
-- Create with SQL CREATE ROLE ... LOGIN NOCREATEDB NOCREATEROLE NOBYPASSRLS.
-- Neon console-created roles inherit neon_superuser and are not suitable.
-- Provision the password securely; never commit it.
BEGIN;
DO $$ BEGIN
 IF (SELECT institution_id FROM compass_deployment_identity WHERE id=1) IS DISTINCT FROM 'nycmc-compass-independent' THEN RAISE EXCEPTION 'Wrong database'; END IF;
END $$;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO compass_runtime;
GRANT SELECT ON compass_deployment_identity, compass_instructors TO compass_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON compass_students, compass_sessions, compass_throttle, compass_instructor_sessions TO compass_runtime;
COMMIT;
