const drafts=new Map();
const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const copy=value=>JSON.parse(JSON.stringify(value));
const clock=time=>{const [h,m]=time.split(':').map(Number);return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;};
export function resetScheduleDrafts(group){if(group===undefined)drafts.clear();else for(const key of drafts.keys())if(key.split(':')[1]===String(group))drafts.delete(key);}
function draftFor(schedule,group){
  const key=[schedule.day,group.id,group.weeklyVersion,group.dateVersion].join(':');
  if(!drafts.has(key))drafts.set(key,{scope:group.source==='date'?'date':'weekly',weekday:schedule.weekday,week:copy(group.week),slots:copy(group.dateSlots??group.slots)});
  return drafts.get(key);
}
export function scheduleRow(slot={},e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c])) {
  return `<div class="entry tools" data-schedule-row><label>Start<input type="time" name="start" value="${e(slot.start)}"></label><label>End<input type="time" name="end" value="${e(slot.end)}"></label><label>Activity<input name="activity" maxlength="80" value="${e(slot.activity)}" placeholder="Homework / Cleanup"></label><label>Location or staff note (optional)<input name="scheduleNote" maxlength="160" value="${e(slot.note)}"></label><button type="button" data-action="schedule-remove-row">Remove block</button></div>`;
}
function readRows(form){
  return [...form.querySelectorAll('[data-schedule-row]')].map(row=>({start:row.querySelector('[name=start]').value,end:row.querySelector('[name=end]').value,activity:row.querySelector('[name=activity]').value.trim(),note:row.querySelector('[name=scheduleNote]').value.trim()})).filter(row=>Object.values(row).some(Boolean));
}
function capture(form,schedule){
  const group=schedule.groups.find(g=>g.id===Number(form.dataset.group));
  if(!group)throw Error('Reload the schedule and choose a group.');
  const draft=draftFor(schedule,group),rows=readRows(form);
  if(form.dataset.scope==='weekly')draft.week[Number(form.dataset.weekday)]=rows;else draft.slots=rows;
  return {group,draft};
}
export function captureScheduleDraft(form,schedule){capture(form,schedule);}
export function changeScheduleEditor(form,schedule){
  const {draft}=capture(form,schedule);
  draft.scope=form.elements.scope.value;draft.weekday=Number(form.elements.weekday.value);
  form.dataset.scope=draft.scope;form.dataset.weekday=draft.weekday;
  form.querySelector('[data-weekly-controls]').hidden=draft.scope!=='weekly';
  const rows=draft.scope==='weekly'?draft.week[draft.weekday]:draft.slots;
  form.querySelector('[data-schedule-rows]').innerHTML=rows.map(row=>scheduleRow(row)).join('');
}
export function schedulePayload(form,schedule){
  const {group,draft}=capture(form,schedule);
  if(draft.scope==='weekly'&&form.elements.allWeekdays.checked){const rows=copy(draft.week[draft.weekday]);for(let d=1;d<=5;d++)draft.week[d]=copy(rows);}
  const lists=draft.scope==='weekly'?Object.values(draft.week):[draft.slots];
  for(const rows of lists){
    if(rows.length>12)throw Error('Use up to 12 blocks per day.');
    for(const row of rows)if(!row.start||!row.end||!row.activity||row.start>=row.end)throw Error('Complete each block with an activity and a start time before its end time.');
    const sorted=[...rows].sort((a,b)=>a.start.localeCompare(b.start));
    for(let i=1;i<sorted.length;i++)if(sorted[i].start<sorted[i-1].end)throw Error('Activities within the same group cannot overlap. Combine the activity labels if needed.');
  }
  return {group:group.id,scope:draft.scope,day:schedule.day,expectedVersion:draft.scope==='weekly'?group.weeklyVersion:group.dateVersion,...(draft.scope==='weekly'?{week:copy(draft.week)}:{slots:copy(draft.slots)})};
}
function currentSummary(schedule,group){
  if(!group.published)return 'Not published';
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
  if(schedule.day!==parts.year+'-'+parts.month+'-'+parts.day)return 'View timetable';
  const time=parts.hour+':'+parts.minute,current=group.slots.find(s=>s.start<=time&&time<s.end),next=group.slots.find(s=>s.start>time);
  return `Now: ${current?.activity??'No activity in progress'} · Next: ${next?clock(next.start)+' '+next.activity:'None'}`;
}
export function updateScheduleNow(schedule,root){
  if(!schedule)return;
  for(const group of schedule.groups){const target=root.querySelector('[data-schedule-now="'+group.id+'"]');if(target)target.textContent=currentSummary(schedule,group);}
}
export function schedulePanel({schedule,admin,today,e,heading}){
  if(!schedule)return heading('Schedule','Loading the selected day’s timetable…');
  return heading('Schedule',`${days[schedule.weekday]}, ${schedule.day}. Times are Eastern Time. Open your group to view the day.`)+
    (!schedule.groups.length?'<p class="empty">No groups assigned. Administrators can create groups in Manage Program and assign teachers.</p>':'')+
    schedule.groups.map(group=>{
      const summary=currentSummary(schedule,group);
      const draft=admin?draftFor(schedule,group):null,rows=admin?(draft.scope==='weekly'?draft.week[draft.weekday]:draft.slots):[];
      return `<details class="managed-group schedule-group" data-manage-key="schedule-group-${group.id}"><summary class="group-summary"><strong>${e(group.name)}</strong><span class="schedule-status ${group.published?'schedule-published':'schedule-draft'}">${group.published?'Published':'Draft / Not published'}</span><small class="block" data-schedule-now="${group.id}">${e(summary)}</small></summary><div class="group-content">
        ${!group.published?`<p class="muted">${admin?'Draft starting timetable from the supplied schedule. Review it, then save to publish.':'The administrator has not published a schedule yet.'}</p>`:`<p class="muted">${group.source==='date'?'Change for this date only':'Regular weekly timetable'}</p>`}
        ${group.slots.length?group.slots.map(s=>`<div class="entry schedule-block"><strong>${e(clock(s.start))}–${e(clock(s.end))}</strong><p>${e(s.activity)}</p>${s.note?`<small>${e(s.note)}</small>`:''}</div>`).join(''):'<p class="empty">No activities scheduled for this day.</p>'}
        ${group.updatedAt?`<p class="muted">Last changed by ${e(group.updatedBy)} · ${e(new Date(group.updatedAt).toLocaleString('en-US',{timeZone:'America/New_York'}))} ET</p>`:''}
        ${admin?`<details data-manage-key="schedule-editor-${group.id}"><summary>Edit schedule</summary><p class="muted">Weekly edits repeat on the selected weekdays. Use a date-only change for a one-day exception. Shared gym time across groups is allowed. Cleanup may be combined with another activity.</p>
          <form data-form="schedule" data-group="${group.id}" data-scope="${draft.scope}" data-weekday="${draft.weekday}" style="display:block">
            <div class="tools"><label>Change applies to<select name="scope" data-schedule-control><option value="weekly" ${draft.scope==='weekly'?'selected':''}>Regular weekly timetable</option><option value="date" ${draft.scope==='date'?'selected':''}>${e(schedule.day)} only</option></select></label>
            <div data-weekly-controls ${draft.scope==='weekly'?'':'hidden'}><label>Weekday<select name="weekday" data-schedule-control>${days.map((name,d)=>`<option value="${d}" ${draft.weekday===d?'selected':''}>${name}</option>`).join('')}</select></label><label class="group-choice"><input type="checkbox" name="allWeekdays">Use this day’s blocks Monday–Friday</label></div></div>
            <div data-schedule-rows>${rows.map(row=>scheduleRow(row,e)).join('')}</div>
            <div class="tools"><button type="button" data-action="schedule-add-row">Add activity block</button><button type="submit" class="primary">Save schedule</button><button type="button" data-action="schedule-cancel">Cancel editing</button></div>
          </form></details>
          ${group.source==='date'?`<button data-action="schedule-reset-date" data-group="${group.id}">Use weekly timetable for this date</button>`:''}`:''}
      </div></details>`;
    }).join('');
}
