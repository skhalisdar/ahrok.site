-- Run only as owner of a dedicated, empty COMPASS database. Never on Kite.
BEGIN;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE') THEN
  RAISE EXCEPTION 'Expected an empty dedicated database; refusing to modify existing data';
 END IF;
END $$;
CREATE TABLE compass_deployment_identity(id INTEGER PRIMARY KEY CHECK(id=1),institution_id TEXT NOT NULL);
INSERT INTO compass_deployment_identity VALUES (1,'nycmc-compass-independent');

CREATE TABLE IF NOT EXISTS compass_instructors (id TEXT PRIMARY KEY, password TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS compass_instructor_sessions (token TEXT PRIMARY KEY, instructor_id TEXT NOT NULL REFERENCES compass_instructors(id), expires BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS compass_students (id TEXT PRIMARY KEY, nickname TEXT NOT NULL, grade INTEGER NOT NULL CHECK(grade BETWEEN 6 AND 8), pin TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, state TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS compass_sessions (token TEXT PRIMARY KEY, student_id TEXT NOT NULL REFERENCES compass_students(id), expires BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS compass_throttle (bucket TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires BIGINT NOT NULL);

COMMIT;
