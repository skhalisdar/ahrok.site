-- Run once as the database owner before deploying schedule support.
-- The application keeps its existing DML-only database role.
BEGIN;
DO $$ BEGIN
 IF (SELECT institution_id FROM public.deployment_identity WHERE id=1) IS DISTINCT FROM 'nycmc-compass'
 THEN RAISE EXCEPTION 'Wrong institution database'; END IF;
END $$;
CREATE TABLE IF NOT EXISTS program_schedules (
      id TEXT PRIMARY KEY, group_id INTEGER NOT NULL REFERENCES student_groups(id), payload TEXT NOT NULL,
      version INTEGER NOT NULL, updated_by TEXT NOT NULL REFERENCES users(id), updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS program_schedule_history (
      id TEXT PRIMARY KEY, schedule_id TEXT NOT NULL, previous_payload TEXT, new_payload TEXT NOT NULL,
      changed_by TEXT NOT NULL REFERENCES users(id), changed_at TEXT NOT NULL
    );
GRANT SELECT, INSERT, UPDATE ON public.program_schedules TO kite_app;
GRANT INSERT ON public.program_schedule_history TO kite_app;
COMMIT;
