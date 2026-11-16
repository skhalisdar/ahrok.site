export const sqliteSchema = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, role TEXT NOT NULL CHECK(role IN ('admin','teacher')),
  password TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, grade TEXT NOT NULL, track TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 0 CHECK(level BETWEEN 0 AND 5), active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS student_groups (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, name_key TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS teacher_group_assignments (
  group_id INTEGER NOT NULL REFERENCES student_groups(id),
  teacher_id TEXT NOT NULL REFERENCES users(id),
  PRIMARY KEY(group_id, teacher_id)
);
CREATE INDEX IF NOT EXISTS teacher_group_by_teacher ON teacher_group_assignments(teacher_id);
CREATE TABLE IF NOT EXISTS student_group_memberships (
  student_id INTEGER PRIMARY KEY REFERENCES students(id),
  group_id INTEGER NOT NULL REFERENCES student_groups(id)
);
CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, name_key TEXT NOT NULL UNIQUE,
  teacher_id TEXT NOT NULL REFERENCES users(id), all_groups INTEGER NOT NULL CHECK(all_groups IN (0,1))
);
CREATE INDEX IF NOT EXISTS activities_teacher ON activities(teacher_id);
CREATE TABLE IF NOT EXISTS activity_groups (
  activity_id INTEGER NOT NULL REFERENCES activities(id), group_id INTEGER NOT NULL REFERENCES student_groups(id),
  PRIMARY KEY(activity_id, group_id)
);
CREATE TABLE IF NOT EXISTS activity_participation (
  activity_id INTEGER NOT NULL REFERENCES activities(id), student_id INTEGER NOT NULL REFERENCES students(id),
  day TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('Participated','Did Not Participate')),
  PRIMARY KEY(activity_id, day, student_id)
);
CREATE TABLE IF NOT EXISTS activity_progress (
  activity_id INTEGER NOT NULL REFERENCES activities(id), student_id INTEGER NOT NULL REFERENCES students(id),
  level INTEGER NOT NULL CHECK(level BETWEEN 0 AND 5), PRIMARY KEY(activity_id, student_id)
);
CREATE TABLE IF NOT EXISTS records (
  day TEXT NOT NULL, student INTEGER NOT NULL REFERENCES students(id),
  attendance TEXT NOT NULL DEFAULT 'Unmarked', homework TEXT NOT NULL DEFAULT 'Unmarked',
  note TEXT NOT NULL DEFAULT '', PRIMARY KEY(day, student)
);
CREATE TABLE IF NOT EXISTS staff_log (
  id INTEGER PRIMARY KEY, day TEXT NOT NULL, teacher TEXT NOT NULL REFERENCES users(id),
  signed_in INTEGER NOT NULL, at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS staff_log_day ON staff_log(day, teacher, id);
`;

