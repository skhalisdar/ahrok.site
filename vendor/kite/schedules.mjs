import {randomUUID} from 'node:crypto';

const emptyWeek=()=>Object.fromEntries(Array.from({length:7},(_,i)=>[i,[]]));
const error=(status,message)=>{throw Object.assign(Error(message),{status});};
export function starterWeek(name) {
  const match=String(name).match(/(k|2|4|6)\s*[-–]\s*(1|3|5|8)/i);
  const week=emptyWeek();if(!match)return week;
  const band=match[1].toLowerCase();
  const rows=band==='6'?[['15:00','15:10','Arrival & Snack'],['15:10','16:00','Rooftop Sports'],['16:00','17:00','Coding'],['17:00','17:50','Homework Help'],['17:50','18:00','Dismissal']]:[
    ['15:00','15:15','Arrival & Snack'],['15:15','16:00',band==='2'?'Coding':'Gym Time'],['16:00','16:45','Homework Help'],['16:45','17:30',band==='k'?'Literacy':'SEL'],['17:30','17:50','Life Skills'],['17:50','18:00','Dismissal']];
  for(let day=1;day<=5;day++)week[day]=rows.map(([start,end,activity])=>({start,end,activity,note:''}));
  return week;
}
export function validateSlots(slots) {
  if(!Array.isArray(slots)||slots.length>12)error(400,'Use up to 12 schedule blocks per day.');
  const result=slots.map(slot=>{
    if(!slot||!['start','end'].every(key=>typeof slot[key]==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(slot[key]))||slot.start>=slot.end)error(400,'Each activity needs a valid start time before its end time.');
    const activity=typeof slot.activity==='string'?slot.activity.trim():'';
    const note=typeof slot.note==='string'?slot.note.trim():'';
    if(!activity||activity.length>80||note.length>160||/[\u0000-\u001f\u007f]/.test(activity+note))error(400,'Enter an activity up to 80 characters and an optional note up to 160 characters.');
    return {start:slot.start,end:slot.end,activity,note};
  }).sort((a,b)=>a.start.localeCompare(b.start));
  for(let i=1;i<result.length;i++)if(result[i].start<result[i-1].end)error(400,'Activities for the same group cannot overlap. Combine labels such as Homework / Cleanup when needed.');
  return result;
}
function validDay(day){if(typeof day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(+new Date(day+'T00:00:00Z'))||new Date(day+'T00:00:00Z').toISOString().slice(0,10)!==day)error(400,'Choose a valid schedule date.');return day;}

export const scheduleSchema = `CREATE TABLE IF NOT EXISTS program_schedules (
      id TEXT PRIMARY KEY, group_id INTEGER NOT NULL REFERENCES student_groups(id), payload TEXT NOT NULL,
      version INTEGER NOT NULL, updated_by TEXT NOT NULL REFERENCES users(id), updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS program_schedule_history (
      id TEXT PRIMARY KEY, schedule_id TEXT NOT NULL, previous_payload TEXT, new_payload TEXT NOT NULL,
      changed_by TEXT NOT NULL REFERENCES users(id), changed_at TEXT NOT NULL
    );`;

export function createScheduleStore(db) {
  let ready;
  // Production PostgreSQL uses a DML-only role; schema setup belongs to the owner migration.
  async function ensure(){
    if(db.dialect==='postgres')return;
    if(!ready)ready=Promise.resolve().then(()=>db.exec(scheduleSchema)).catch(e=>{ready=undefined;throw e;});
    await ready;
  }
  async function read(user,day){
    validDay(day);await ensure();
    const groups=user.role==='admin'?await db.prepare('SELECT id,name FROM student_groups ORDER BY name_key').all():await db.prepare('SELECT g.id,g.name FROM student_groups g JOIN teacher_group_assignments a ON a.group_id=g.id WHERE a.teacher_id=? ORDER BY g.name_key').all(user.id);
    const documents=await db.prepare('SELECT * FROM program_schedules').all();
    const weekday=new Date(day+'T00:00:00Z').getUTCDay();
    return {day,weekday,groups:groups.map(group=>{
      const weekly=documents.find(d=>d.id==='weekly:'+group.id),exception=documents.find(d=>d.id==='date:'+group.id+':'+day);
      const weeklyPayload=weekly?JSON.parse(weekly.payload):null,datePayload=exception?JSON.parse(exception.payload):null;
      const published=Boolean(datePayload||weeklyPayload),source=datePayload?'date':weeklyPayload?'weekly':'draft';
      const week=weeklyPayload??(user.role==='admin'?starterWeek(group.name):emptyWeek());
      const current=datePayload?exception:weekly;
      return {...group,slots:datePayload??week[weekday]??[],source,published,updatedBy:current?.updated_by??null,updatedAt:current?.updated_at??null,
        ...(user.role==='admin'?{week,weeklyVersion:weekly?.version??0,dateVersion:exception?.version??0,dateSlots:datePayload}: {})};
    })};
  }
  async function save(user,input){
    if(user.role!=='admin')error(403,'Administrator access required.');
    if(input.confirmed!==true)error(400,'Confirm that you would like to alter the current schedule.');
    if(!Number.isSafeInteger(input.group)||!['weekly','date'].includes(input.scope)||!Number.isSafeInteger(input.expectedVersion)||input.expectedVersion<0)error(400,'Invalid schedule edit.');
    let payload;
    if(input.scope==='weekly'){
      if(!input.week||typeof input.week!=='object'||Array.isArray(input.week))error(400,'Provide a weekly schedule.');
      payload=emptyWeek();for(let day=0;day<7;day++)payload[day]=validateSlots(input.week[day]??[]);
    }else{validDay(input.day);payload=input.reset===true?null:validateSlots(input.slots);}
    await ensure();
    const id=input.scope==='weekly'?'weekly:'+input.group:'date:'+input.group+':'+input.day;
    await db.exec('BEGIN IMMEDIATE');
    try{
      if(!await db.prepare('SELECT id FROM student_groups WHERE id=?').get(input.group))error(404,'Student group is unavailable.');
      const before=await db.prepare('SELECT payload,version FROM program_schedules WHERE id=?').get(id);
      if((before?.version??0)!==input.expectedVersion)error(409,'The schedule changed while you were editing. Reload the schedule and review the latest version.');
      const now=new Date().toISOString(),json=JSON.stringify(payload);
      const saved=await db.prepare(`INSERT INTO program_schedules (id,group_id,payload,version,updated_by,updated_at) VALUES (?,?,?,1,?,?)
        ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,version=program_schedules.version+1,updated_by=excluded.updated_by,updated_at=excluded.updated_at
        WHERE program_schedules.version=? RETURNING version`).get(id,input.group,json,user.id,now,input.expectedVersion);
      if(!saved)error(409,'Another administrator updated this schedule. Reload and review the latest version.');
      await db.prepare('INSERT INTO program_schedule_history (id,schedule_id,previous_payload,new_payload,changed_by,changed_at) VALUES (?,?,?,?,?,?)').run(randomUUID(),id,before?.payload??null,json,user.id,now);
      await db.exec('COMMIT');return {version:saved.version};
    }catch(e){await db.exec('ROLLBACK');throw e;}
  }
  return {read,save};
}
