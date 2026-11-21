-- Apply once as the owner of the existing NYCMC/COMPASS database.
-- This adds only portal tables and scoped DML grants for the existing app role.
BEGIN;
DO $$ BEGIN
 IF (SELECT institution_id FROM public.deployment_identity WHERE id=1)
    IS DISTINCT FROM 'nycmc-compass'
 THEN RAISE EXCEPTION 'Wrong institution database'; END IF;
END $$;
SET LOCAL search_path = public;

CREATE TABLE IF NOT EXISTS compass_students (id TEXT PRIMARY KEY, nickname TEXT NOT NULL, grade INTEGER NOT NULL CHECK(grade BETWEEN 6 AND 8), pin TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, state TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS compass_sessions (token TEXT PRIMARY KEY, student_id TEXT NOT NULL REFERENCES compass_students(id), expires BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS compass_throttle (bucket TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires BIGINT NOT NULL);

GRANT SELECT, INSERT, UPDATE, DELETE ON
 public.compass_students, public.compass_sessions, public.compass_throttle
 TO kite_app;
COMMIT;
