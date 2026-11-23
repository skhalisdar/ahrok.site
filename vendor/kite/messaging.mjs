import {randomUUID} from 'node:crypto';

export const messagingSchema=`
CREATE TABLE IF NOT EXISTS group_messages (
 id TEXT PRIMARY KEY, group_id INTEGER NOT NULL REFERENCES student_groups(id),
 sender_id TEXT NOT NULL REFERENCES users(id), body TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS group_messages_group ON group_messages(group_id,created_at,id);
`;

export function createMessaging(db) {
  const sql=s=>db.prepare(s);
  async function authorize(user,group) {
    if(!Number.isSafeInteger(group)||!await sql('SELECT id FROM student_groups WHERE id=?').get(group))throw Object.assign(new Error('Group unavailable.'),{status:404});
    if(user.role!=='admin'&&!await sql('SELECT 1 FROM teacher_group_assignments WHERE group_id=? AND teacher_id=?').get(group,user.id))throw Object.assign(new Error('This group is outside your assignments.'),{status:403});
  }
  return {
    async list(user,group) {
      await authorize(user,group);
      const rows=await sql('SELECT id,group_id,sender_id,body,created_at FROM group_messages WHERE group_id=? ORDER BY created_at DESC,id DESC LIMIT 100').all(group);
      return {messages:rows.reverse()};
    },
    async send(user,input) {
      await authorize(user,input.group);
      if(typeof input.body!=='string'||!input.body.trim()||input.body.length>2000)throw Object.assign(new Error('Enter a message of 1–2,000 characters.'),{status:400});
      await sql('INSERT INTO group_messages VALUES (?,?,?,?,?)').run(randomUUID(),input.group,user.id,input.body.trim(),new Date().toISOString());
      return {};
    }
  };
}
