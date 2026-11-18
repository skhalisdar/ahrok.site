import { mountShell } from './shell.mjs';
import {mobileHeaders,mobileOrigin,apiResult} from './mobile-auth.mjs';
import {programPanel,dashboardPanel,summarizeDesk,weekDays,uiIcon,richEmpty,teacherShiftPanel} from './program-panels.mjs';
import {schedulePanel,scheduleRow,schedulePayload,changeScheduleEditor,captureScheduleDraft,resetScheduleDrafts,updateScheduleNow} from './schedule-view.mjs';
import {parseStudentCSV, studentKey, MAX_CSV_BYTES} from './student-csv.mjs';

const native = Boolean(window.Capacitor?.isNativePlatform());
const $ = id => document.getElementById(id);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const statuses = {attendance:['Unmarked','Present','Absent','Tardy'],
  homework:['Unmarked','Complete','Needs Help','No Homework']};
let session, data, tab = 'roster', busy = false;
let expiryTimer;
let scheduleData=null;
let dashboardHistory=[],dashboardHistoryStatus="idle",dashboardSchedule=null,dashboardScheduleUnavailable=false,dashboardUpdatedAt=null;
setInterval(()=>{if(session&&tab==='schedule'&&!busy)updateScheduleNow(scheduleData,$('panel'));},30000);
let studentImport = null;
function expireMobileSession() {
  if(native&&session?.expiresAt<=Date.now()) {
    loggedOut();message('Your mobile session expired. Sign in again.',true);return true;
  }
  return false;
}
function setSession(value) {
  if(native&&(!Number.isFinite(value.expiresAt)||value.expiresAt<=Date.now()))throw new Error('Your mobile session expired. Sign in again.');
  session=value;
  if(native){window.clearTimeout(expiryTimer);expiryTimer=window.setTimeout(expireMobileSession,Math.max(0,value.expiresAt-Date.now()));}
}
if(native)document.addEventListener('visibilitychange',expireMobileSession);
let activityId = null, activityGroup = '';
function message(text, error = false) {
  $('message').textContent = text;
  $('message').classList.toggle('error', error);
}
function today(key) {
  const date = key ? new Date(key + 'T12:00:00') : new Date();
  $('today').textContent = date.toLocaleDateString(undefined, {dateStyle:'full'});
}
today();
$('login-title').textContent = native ? 'Staff login' : 'Administrator login';
$('identity').textContent = native ? 'Staff workspace' : 'Administrator portal';
function loggedOut() {
  scheduleData=null;resetScheduleDrafts();
  dashboardHistory=[];dashboardHistoryStatus="idle";dashboardSchedule=null;dashboardScheduleUnavailable=false;dashboardUpdatedAt=null;
  studentImport = null;
  window.clearTimeout(expiryTimer);
  session = data = null;
  activityId = null;
  activityGroup = '';
  $('desk').hidden = $('logout').hidden = true;
  $('login').hidden = false;
  $('identity').textContent = native ? 'Staff workspace' : 'Administrator portal';
  $('panel').replaceChildren();
  $('metrics').replaceChildren();
  $('search').value = '';
}
async function api(path, payload) {
  const origin = native ? mobileOrigin(window.DESK_API_ORIGIN) : '';
  if(expireMobileSession())throw new Error('Your mobile session expired. Sign in again.');
  const requestSession=session;
  let headers={};
  if(native)try {headers=await mobileHeaders({origin,path,payload,session});}
  catch(error){if(session&&[401,403].includes(error.status))loggedOut();throw error;}
  const stale=()=>native&&requestSession&&session!==requestSession;
  if(stale())throw new Error('Your mobile session ended. Sign in again.');
  if (payload !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch((native ? origin + '/api/mobile/' : '/kite/api/admin/') + path, {
    credentials:native ? 'omit' : 'same-origin',
    method:payload === undefined ? 'GET' : 'POST', headers,
    body:payload === undefined ? undefined : JSON.stringify(payload)
  });
  const result = await apiResult(response);
  if(stale())throw new Error('Your mobile session ended. Sign in again.');
  if (!response.ok) {
    if (response.status === 401 && session) loggedOut();
    throw new Error(result.error);
  }
  return result;
}
async function task(work) {
  if (busy) return;
  busy = true;
  $('desk').inert = $('login').inert = true;
  $('logout').disabled = true;
  try { await work(); }
  catch (error) { message(error.message, true); }
  finally {
    busy = false;
    $('desk').inert = $('login').inert = false;
    $('logout').disabled = false;
  }
}
function options(values, selected) {
  return values.map(value => `<option ${value === selected ? 'selected' : ''}>${value}</option>`).join('');
}
function heading(title, text, action = '') {
  const icon={dashboard:'dashboard',roster:'attendance',courses:'trend',schedule:'schedule',activities:'activity',staff:'staff',incidents:'incident',pickup:'shield',reports:'report',admin:'dashboard'}[tab]??'dashboard';
  return `<div class="heading"><div><h2><span class="module-title-icon">${uiIcon(icon)}</span>${title}</h2><p class="muted">${text}</p></div>${action}</div>`;
}
function metric(label, count, detail) {
  return `<div class="card metric"><small>${label}</small><strong>${count}</strong><small>${detail}</small></div>`;
}
function groupLabel(student) {
  return student.group_name ? ' · ' + escapeHTML(student.group_name) : '';
}

function groupedStudentSections(students, section, renderStudents) {
  const groups = new Map(data.groups.map(group => [group.id, {id:group.id,name:group.name,students:[]}]));
  for (const student of students) {
    const id = student.group_id ?? 'unassigned';
    if (!groups.has(id)) groups.set(id, {id,name:student.group_name ?? 'Unassigned students',students:[]});
    groups.get(id).students.push(student);
  }
  const searching = Boolean($('search').value.trim());
  return [...groups.values()].filter(group => group.students.length || (!searching && ['roster','courses','pickup'].includes(section))).map(group =>
    `<details class="managed-group roster-group" data-manage-key="${section}-group-${group.id}" ${searching?'open':''}>
      <summary class="group-summary"><strong>${escapeHTML(group.name)}</strong><span class="badge">${group.students.length} students</span>${groupProgress(group.students,section)}</summary>
      <div class="roster-group-content">${group.students.length ? renderStudents(group.students) : '<p class="empty">No students in this group.</p>'}</div>
    </details>`).join('');
}
function groupProgress(students,section) {
  const active=students.filter(s=>s.active),total=active.length;if(!total)return '';
  const meter=(label,value,tone)=>`<span class="group-meter ${tone}"><span>${label}<b>${Math.round(value)}%</b></span><span class="mini-track"><i style="width:${Math.max(0,Math.min(100,value))}%"></i></span></span>`;
  if(section==='roster')return `<span class="group-summary-progress">${meter('Present',active.filter(s=>s.attendance==='Present').length/total*100,'attendance-meter')}${meter('HW done',active.filter(s=>s.homework==='Complete').length/total*100,'homework-meter')}</span>`;
  if(section==='courses')return `<span class="group-summary-progress">${meter('Average progress',active.reduce((sum,s)=>sum+s.level,0)/total/5*100,'mastery-meter')}</span>`;
  return '';
}
function roster(students, admin) {
  return heading('Attendance and homework', 'Open a group to view students. ' + students.length + ' matching students.', admin ?
    '<button class="primary" data-action="all">Mark all groups present</button>' : '') +
    groupedStudentSections(students, 'roster', rosterRows);
}
function courses(students) {
  return heading('Skill milestones','Open a group to view student progress. Steps carry across dates.') +
    groupedStudentSections(students, 'courses', courseCards);
}

function rosterRows(students) {
  return students.map(s => {
      const name = escapeHTML(s.name);
      const select = field => `<label><small>${field === 'attendance' ? 'Attendance' : 'Homework'}</small>
        <select data-student="${s.id}" data-field="${field}" aria-label="${field} for ${name}"
        data-tone="${escapeHTML(s[field] ?? 'Unmarked')}" ${s.active ? '' : 'disabled'}>${options(statuses[field],s[field])}</select></label>`;
      return `<div class="row"><div class="name">${name}<small>Grade ${escapeHTML(s.grade)}${groupLabel(s)}${s.active ? '' : ' · Archived'}</small></div>
        ${select('attendance')}${select('homework')}
        <label><small>Assignment note</small><input data-student="${s.id}" data-field="note" aria-label="Assignment note for ${name}"
        maxlength="140" value="${escapeHTML(s.note)}" placeholder="Optional" ${s.active ? '' : 'disabled'}></label>
        ${s.active ? `<button data-action="note" data-student="${s.id}" aria-label="Save note for ${name}">Save Note</button>` : ''}</div>`;
    }).join('');
}
function courseCards(students) {
  return '<div class="course-grid">' +
    students.map(s => `<article class="course card">
      <div class="name">${escapeHTML(s.name)}<small>Grade ${escapeHTML(s.grade)}${groupLabel(s)}</small></div>
      <div class="step-track" aria-hidden="true">${Array.from({length:5},(_,i)=>`<span class="${i<s.level?'step-done':''}">${i<s.level?'✓':i+1}</span>`).join('')}</div><p>Step ${s.level} / 5</p><progress max="5" value="${s.level}" aria-label="${escapeHTML(s.name)} skill progress"></progress>
      <div class="steps"><button data-action="step" data-student="${s.id}" data-delta="-1" ${s.level === 0 ? 'disabled' : ''}>−1 Step</button>
      <button data-action="step" data-student="${s.id}" data-delta="1" ${s.level === 5 ? 'disabled' : ''}>+1 Step</button></div></article>`).join('') + '</div>';
}
function staff(admin, ownShift) {
  const action = admin ? '' : `<button class="primary" data-action="shift" data-in="${ownShift ? '0' : '1'}"
    ${$('date').value === data.today ? '' : 'disabled'}>${ownShift ? 'Sign Out of Shift' : 'Sign In to Shift'}</button>`;
  return heading(admin ? 'Staff log' : 'My staff log', admin ? 'Teacher check-ins and check-outs for the selected date.' :
    "Select today's date to record your shift.", action) + `<div class="shift-summary"><div><span class="status-dot"></span><strong>${summarizeDesk(data).onShift}</strong> On Shift</div><div><strong>${summarizeDesk(data).completedShifts}</strong> Completed</div><span class="muted">Latest status per staff member</span></div>` + (data.staff.length ? data.staff.map(event =>
    `<div class="staff"><div class="name">${escapeHTML(event.teacher)}</div>
      <span class="badge ${event.signed_in ? 'in' : ''}">${event.signed_in ? 'Signed In' : 'Signed Out'}</span>
      <time datetime="${escapeHTML(event.at)}">${new Date(event.at).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}</time></div>`).join('') :
    richEmpty('No shift activity yet',"Staff check-ins and check-outs for the selected date will appear here.",'staff'));
}
function studentEditor(s) {
  return `<details class="student-editor" data-manage-key="student-${s.id}"><summary class="student-summary">
      <strong>${escapeHTML(s.name)}</strong><span>Grade ${escapeHTML(s.grade)}</span>
</summary><div class="student-controls"><p class="muted">Edit student</p><form data-form="student-details"><input name="student" type="hidden" value="${s.id}"><label>Name<input name="name" value="${escapeHTML(s.name)}" maxlength="80" required></label><label>Grade<input name="grade" value="${escapeHTML(s.grade)}" maxlength="60" required></label><button>Save student</button></form>
      ${data.groups.length ? `<form data-form="student-group">
        <input name="student" type="hidden" value="${s.id}">
        <label>Group<select name="group" aria-label="Group for ${escapeHTML(s.name)}">${groupOptions(s.group_id)}</select></label><button>Save Group</button></form>` : ''}
      <button data-action="archive" data-student="${s.id}">Archive Student</button></div></details>`;
}
function unassignedStudents() {
  const students = data.students.filter(s => s.active && (s.group_id == null || !data.groups.some(g => g.id === s.group_id)));
  if (!students.length) return '';
  return `<details class="managed-group" data-manage-key="unassigned"><summary class="group-summary"><strong>Unassigned students</strong><span class="badge">${students.length} students</span></summary><div class="group-content">${students.map(studentEditor).join('')}</div></details>`;
}
function groupCard(group) {
  const name = escapeHTML(group.name);
  const assigned = new Set(data.assignments.filter(a => a.group_id === group.id).map(a => a.teacher_id));
  const available = data.teachers.filter(t => t.active && !assigned.has(t.id));
  const students = data.students.filter(s => s.active && s.group_id === group.id);
  return `<details class="managed-group" data-manage-key="group-${group.id}">
    <summary class="group-summary"><strong>${name}</strong><span class="badge">${students.length} students</span></summary>
    <div class="group-content"><h3>Students</h3>
    ${students.length ? students.map(studentEditor).join('') : '<p class="muted">No students in this group yet.</p>'}
    <details class="group-settings"><summary>Group settings and teachers</summary><div class="controls">
    <form data-form="rename-group"><input type="hidden" name="group" value="${group.id}"><label>Group name<input name="name" maxlength="60" required value="${name}"></label><button>Rename group</button></form>
    ${assigned.size ? [...assigned].map(id => `<form class="tools" data-form="teacher-group">
      <input type="hidden" name="group" value="${group.id}"><input type="hidden" name="teacher" value="${escapeHTML(id)}">
      <input type="hidden" name="assigned" value="false">
      <span>${escapeHTML(id)}${data.teachers.some(t => t.id === id && t.active) ? '' : ' (disabled)'}</span>
      <button aria-label="Remove ${escapeHTML(id)} from ${name}">Remove Teacher</button></form>`).join('') :
      '<p class="muted">No teachers assigned.</p>'}
    ${available.length ? `<form data-form="teacher-group">
      <input type="hidden" name="group" value="${group.id}"><input type="hidden" name="assigned" value="true">
      <label>Teacher<select name="teacher" required aria-label="Teacher for ${name}">
        <option value="">Choose a teacher</option>${available.map(t => `<option>${escapeHTML(t.id)}</option>`).join('')}
      </select></label><button>Assign Teacher</button></form>` : ''}
  </div></details></div></details>`;
}
function groupOptions(selected) {
  return '<option value="">No group</option>' + data.groups.map(group =>
    `<option value="${group.id}" ${selected === group.id ? 'selected' : ''}>${escapeHTML(group.name)}</option>`).join('');
}
function teacherGroupEditor(teacher) {
  const assigned=new Set(data.assignments.filter(a=>a.teacher_id===teacher.id).map(a=>a.group_id));
  const names=data.groups.filter(g=>assigned.has(g.id)).map(g=>g.name);
  return `<details data-manage-key="teacher-groups-${escapeHTML(teacher.id)}"><summary>Assigned groups: ${names.length?names.map(escapeHTML).join(', '):'None'}</summary>
    ${teacher.active&&data.groups.length?`<form data-form="teacher-groups" style="display:block">
      <input type="hidden" name="teacher" value="${escapeHTML(teacher.id)}">
      <fieldset><legend>Groups for ${escapeHTML(teacher.id)}</legend>
      ${data.groups.map(group=>`<label class="group-choice"><input type="checkbox" name="groups" value="${group.id}" ${assigned.has(group.id)?'checked':''}>${escapeHTML(group.name)}</label>`).join('')}
      </fieldset><p class="muted">Select any number of groups. Uncheck a group to remove the assignment.</p>
      <button class="primary">Save teacher groups</button></form>`:`<p class="muted">${teacher.active?'Create a student group first.':'Enable this account before changing its groups.'}</p>`}
    </details>`;
}
function adminPanel() {
  return `<div class="manage-dashboard">` + heading('Manage program','Organize your groups, students and team from one workspace.') +
    `<div class="manage-grid"><section class="manage-section card" aria-label="Groups and students">
      <div class="manage-section-header"><div><span class="eyebrow">Enrollment</span><h2>Groups &amp; Students</h2><p class="muted">Open a group, then a student to make changes.</p></div><span class="manage-total">${data.groups.length} groups</span></div>
      <div class="manage-enrollment-tools">
        <details class="manage-tool" data-manage-key="add-student"><summary class="manage-tool-trigger">+ Add Student</summary>
          <div class="entry manage-tool-body"><h3>Add a student</h3><form data-form="students">
            <label>Student name<input name="name" required maxlength="80"></label>
            <label>Grade<input type="text" name="grade" required maxlength="60"></label>
            <label>Student Group<select name="group">${groupOptions()}</select></label>
            <button class="primary">Add Student</button></form></div></details>
        <details class="manage-tool" data-manage-key="import-csv" ${studentImport ? 'open' : ''}><summary class="manage-tool-trigger">Import CSV</summary>${studentImportPanel()}</details>
        <details class="manage-tool manage-create-group" data-manage-key="create-group"><summary class="manage-tool-trigger">+ Create Group</summary>
          <div class="entry manage-tool-body"><h3>Create a student group</h3><form data-form="groups">
            <label>Group name<input type="text" name="name" required maxlength="60"></label>
            <button class="primary">Create Group</button></form>
            <p class="muted">Click a group to view its students. Click a student to edit their name, grade or group.</p></div></details>
      </div>
      <div class="manage-group-list">${data.groups.map(groupCard).join('') + unassignedStudents()}</div>
    </section>
    <section class="manage-section card" aria-label="Teachers and access">
      <div class="manage-section-header"><div><span class="eyebrow">Team management</span><h2>Teachers &amp; Access</h2><p class="muted">Manage accounts and the groups each teacher can access.</p></div><span class="manage-total">${data.teachers.length} teachers</span></div>
      <details class="manage-tool manage-create-teacher" data-manage-key="create-teacher"><summary class="manage-tool-trigger">+ Create Teacher</summary>
        <div class="entry manage-tool-body"><h3>Teacher accounts and groups</h3><p>Assign each teacher to one or more groups. Teachers can view and work with students in their assigned groups.</p><form data-form="teachers">
          <label>User ID<input name="id" required minlength="3" maxlength="32" autocapitalize="none" spellcheck="false"></label>
          <label>Password<input name="password" type="password" required minlength="6" maxlength="128" autocomplete="new-password"></label>
          <button class="primary">Create Teacher</button></form></div></details>
      <div class="teacher-list"><div class="teacher-list-heading" aria-hidden="true"><span>Teacher</span><span>Status</span><span>Assigned groups</span><span>Actions</span></div>
      ${data.teachers.map(t => {
        const assignedGroups=data.groups.filter(group=>data.assignments.some(a=>a.teacher_id===t.id&&a.group_id===group.id));
        return `<details class="entry controls teacher-account" data-manage-key="teacher-account-${escapeHTML(t.id)}">
          <summary class="teacher-overview"><strong>${escapeHTML(t.id)}</strong><span class="badge teacher-status ${t.active ? 'teacher-active' : 'teacher-disabled'}">${t.active ? 'Active' : 'Disabled'}</span>
            <span class="teacher-group-pills">${assignedGroups.map(group=>`<span class="teacher-group-pill">${escapeHTML(group.name)}</span>`).join('') || '<span class="muted">No groups assigned</span>'}</span><span class="teacher-manage-label">Manage<span aria-hidden="true"> ⌄</span></span></summary>
          <div class="teacher-drawer"><div class="teacher-drawer-heading"><h3>Manage ${escapeHTML(t.id)}</h3><p class="muted">Update group access or account credentials.</p></div>
            ${teacherGroupEditor(t)}
            ${t.active ? `<details class="teacher-password" data-manage-key="teacher-password-${escapeHTML(t.id)}"><summary>Reset Password</summary>
              <form data-form="teacher-access"><input name="id" type="hidden" value="${escapeHTML(t.id)}">
                <input name="action" type="hidden" value="reset">
                <label>New password for ${escapeHTML(t.id)}<input name="password" type="password" required minlength="6" maxlength="128" autocomplete="new-password"></label>
                <button>Reset Password</button></form></details>
              <div class="tools teacher-danger-actions"><button class="manage-danger" data-action="disable" data-id="${escapeHTML(t.id)}">Disable Account</button></div>` : ''}
          </div></details>`;
      }).join('')}
      </div>
      <details class="manage-devices" data-manage-key="registered-devices"><summary><span>Registered mobile devices</span><span class="manage-total">${(data.devices??[]).length}</span></summary>
        <div class="entry"><h2>Registered mobile devices</h2>${(data.devices??[]).map(device=>`<p>${escapeHTML(device.platform)} · ${escapeHTML(device.id.slice(0,12))} · ${device.active?'Active':'Revoked'} ${device.active?`<button class="manage-danger" data-action="device-revoke" data-id="${escapeHTML(device.id)}">Revoke device and sessions</button>`:''}</p>`).join('')||'<p>No mobile devices enrolled.</p>'}</div></details>
    </section></div>`+
    (data.workspace ? `<div class="entry manage-workspace"><h2>${escapeHTML(data.workspace.name)}</h2>
      <p class="muted">Sponsored access through ${new Intl.DateTimeFormat(undefined, {dateStyle:'medium',timeStyle:'short',timeZone:'America/New_York'}).format(data.workspace.expiresAt)} ET</p></div>` : '') + `</div>`;
}
function studentImportPanel() {
  const preview = studentImport;
  return `<div class="entry"><h2>Import students from CSV</h2>
    <p>Include a Name column, or First Name and Last Name. Grade is optional if you enter a default grade below. Maximum 500 students, 100 KB. Export spreadsheets as CSV UTF-8.</p>
    <p>Matching names and grades are skipped, including archived students. Existing records and group assignments are kept. Review students with identical names and grades separately.</p>
    <form data-form="student-csv-preview">
      <label>CSV file<input name="file" type="file" accept=".csv,text/csv" required></label>
      <label>Default grade<input name="grade" maxlength="60" placeholder="Used when the CSV has no grade"></label>
      <label>Group for imported students<select name="group">${groupOptions()}</select></label>
      <button>Preview CSV</button>
    </form>
    ${preview ? `<h3>Preview: ${preview.rows.length} students</h3><p>${preview.added} new; ${preview.skipped} matching rows will be skipped. Group: ${escapeHTML(preview.groupName)}.</p>
      <div style="overflow:auto;max-height:320px" tabindex="0" aria-label="Student import preview"><table><thead><tr><th>Name</th><th>Grade</th><th>Action</th></tr></thead><tbody>${preview.rows.map(row=>`<tr><td>${escapeHTML(row.name)}</td><td>${escapeHTML(row.grade)}</td><td>${row.skip?'Skip matching row':'Add'}</td></tr>`).join('')}</tbody></table></div>
      <button class="primary" data-action="import-students" ${preview.added ? '' : 'disabled'}>Import ${preview.added} students</button>
      <button data-action="cancel-student-import">Cancel preview</button>` : ''}
  </div>`;
}
const participation = ['Unmarked','Participated','Did Not Participate'];
function activityForm(activity) {
  const teachers = data.teachers.filter(t => t.active);
  if (!teachers.length) return '<p class="muted">Create an active teacher account in Manage Program to set up an activity.</p>';
  const all = activity ? Boolean(activity.all_groups) : true;
  return `<form class="activity-settings" data-form="activities">
    ${activity ? `<input type="hidden" name="id" value="${activity.id}">` : ''}
    <label>Activity name<input name="name" maxlength="60" required value="${escapeHTML(activity?.name)}"></label>
    <label>Instructor<select name="teacher" required>
      <option value="">Choose an instructor</option>
      ${teachers.map(t => `<option ${t.id === activity?.teacher_id ? 'selected' : ''}>${escapeHTML(t.id)}</option>`).join('')}
    </select></label>
    <label>Participation scope<select name="scope" data-activity-scope>
      <option value="all" ${all ? 'selected' : ''}>All groups</option>
      <option value="selected" ${all ? '' : 'selected'}>Selected groups</option>
    </select></label>
    <fieldset data-activity-groups ${all ? 'hidden' : ''}><legend>Participating groups</legend>
      ${data.groups.map(g => `<label class="group-choice"><input type="checkbox" name="groups" value="${g.id}"
        ${activity?.groups.includes(g.id) ? 'checked' : ''}>${escapeHTML(g.name)}</label>`).join('') ||
        '<p class="muted">Create a student group in Manage Program first.</p>'}
    </fieldset>
    <button class="primary">${activity ? 'Save Activity' : 'Create Activity'}</button>
  </form>`;
}

function activityPanel(admin, query) {
  const activities = data.activities;
  const activity = activities.find(a => a.id === activityId) ?? activities[0];
  const setup = admin ? `<div class="entry"><details class="activity-details" >
    <summary>+ New Activity</summary>${activityForm()}</details></div>` : '';
  const header = heading(admin ? 'Activities' : 'My activities','Record participation by date and track progress for each activity.');
  if (!activity) return header + setup + richEmpty('Room for something great','Your assigned activities and student participation will appear here.','activity');
  activityId = activity.id;
  const groups = new Map(activity.students.map(s => [String(s.group_id),s.group_name]));
  if (activityGroup && !groups.has(activityGroup)) activityGroup = '';
  const students = activity.students.filter(s => (!activityGroup || String(s.group_id) === activityGroup) &&
    (s.name + ' ' + s.group_name).toLowerCase().includes(query));
  const cards=`<div class="activity-catalog">${activities.map(item=>`<button type="button" class="activity-tile ${item.id===activity.id?'selected':''}" data-activity-card="${item.id}" aria-pressed="${item.id===activity.id}"><span class="instructor-avatar">${escapeHTML(item.teacher_id.slice(0,2).toUpperCase())}</span><span><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.teacher_id)}</small><span class="activity-group-badges">${[...new Map(item.students.map(student=>[student.group_id,student.group_name])).values()].map(name=>`<span>${escapeHTML(name)}</span>`).join('')||'<span>No enrolled groups</span>'}</span></span></button>`).join('')}</div>`;
  return header + setup + cards + `<div class="entry controls">
    <div class="tools activity-controls">
      <label>Activity<select id="activity-choice">${activities.map(a =>
        `<option value="${a.id}" ${a.id === activity.id ? 'selected' : ''}>${escapeHTML(a.name)}</option>`).join('')}</select></label>
      <label>Group<select id="activity-group"><option value="">All participating groups</option>
        ${[...groups].map(([id,name]) => `<option value="${id}" ${id === activityGroup ? 'selected' : ''}>${escapeHTML(name)}</option>`).join('')}
      </select></label>
    </div>
    <p class="muted activity-title">Instructor ${escapeHTML(activity.teacher_id)}${activity.teacher_active ? '' : ' (disabled)'} ·
      ${activity.all_groups ? 'All groups, including future groups' : 'Selected groups'}</p>
    ${admin ? `<details class="activity-details"><summary>Edit activity settings</summary>${activityForm(activity)}</details>` : ''}
  </div>` + (students.length ? groupedStudentSections(students, 'activity-'+activity.id, members=>members.map(s => `<div class="entry tools">
    <div class="name">${escapeHTML(s.name)}<small>${escapeHTML(s.group_name)}</small></div>
    <label>Participation<select data-activity-student="${s.id}" aria-label="Participation for ${escapeHTML(s.name)}">
      ${options(participation,s.status ?? 'Unmarked')}</select></label>
    <span class="badge">Step ${s.level} / 5</span>
    <button data-action="activity-step" data-student="${s.id}" data-delta="-1" ${s.level === 0 ? 'disabled' : ''}
      aria-label="Remove a step for ${escapeHTML(s.name)}">−1 Step</button>
    <button data-action="activity-step" data-student="${s.id}" data-delta="1" ${s.level === 5 ? 'disabled' : ''}
      aria-label="Add a step for ${escapeHTML(s.name)}">+1 Step</button>
  </div>`).join('')) : '<p class="empty">No enrolled students match this activity view.</p>');
}

function render() {
  if (!session || !data) return;
  const admin = session.role === 'admin';
  $('panel').dataset.module=tab;
  $('metrics').hidden=true;
  $('date-wrap').hidden=['admin','reports','courses'].includes(tab);
  const groupNames = admin || !data.groups.length ? '' : ' · Groups: ' + data.groups.map(g => g.name).join(', ');
  const institution = data.workspace ? data.workspace.name + ' · ' : '';
  $('identity').textContent = institution + (admin ? 'Administrator' : 'Teacher') + ' · ' + session.id + groupNames;
  const active = data.students.filter(s => s.active);
  const recent = new Map();
  for (const event of data.staff) if (!recent.has(event.teacher)) recent.set(event.teacher,event.signed_in);
  const ownShift = Boolean(recent.get(session.id));
  $('logout').textContent = admin ? 'Log out' : 'Log out of app';
  $('metrics').innerHTML = metric('Students present',active.filter(s => s.attendance === 'Present').length + ' / ' + active.length,
    active.filter(s => s.attendance === 'Tardy').length + ' tardy · ' + active.filter(s => s.attendance === 'Absent').length + ' absent') +
    metric('Homework complete',active.filter(s => s.homework === 'Complete').length + ' / ' + active.length,
      active.filter(s => s.homework === 'Needs Help').length + ' need help') +
    (admin ? metric('Staff signed in',[...recent.values()].filter(Boolean).length,'For the selected date') :
      metric('My shift',ownShift ? 'Signed In' : 'Signed Out','For the selected date'));
  $('search-wrap').hidden = !['roster','courses','activities','pickup','incidents'].includes(tab);
  const query = $('search').value.trim().toLowerCase();
  const students = (tab === 'courses' ? active : data.students).filter(s =>
    (s.name + ' grade ' + s.grade + ' ' + (s.group_name ?? '')).toLowerCase().includes(query));
  for (const item of $('tabs').querySelectorAll('button')) item.dataset.tab === tab ? item.setAttribute('aria-current','page') : item.removeAttribute('aria-current');
  const openEditors = [...$('panel').querySelectorAll('details[data-manage-key][open]')].map(element => element.dataset.manageKey);
  $('panel').innerHTML = (tab==='dashboard'&&admin ? dashboardPanel({data,day:$('date').value,history:dashboardHistory,historyStatus:dashboardHistoryStatus,schedule:dashboardSchedule,scheduleUnavailable:dashboardScheduleUnavailable,updatedAt:dashboardUpdatedAt,e:escapeHTML,heading}) : null) ?? programPanel(tab,{data,admin,day:$('date').value,escapeHTML,heading,renderGroups:groupedStudentSections,query,schedule:scheduleData,schedulePanel,today:data.today}) ?? (tab === 'admin' ? adminPanel() : tab === 'staff' ? staff(admin,ownShift) :
    tab === 'activities' ? activityPanel(admin,query) :
    (tab === 'roster' ? roster(students,admin) : courses(students)) +
      (!students.length ? '<p class="empty">No students match this view.</p>' : ''));
  $('panel').insertAdjacentHTML('afterbegin',teacherShiftPanel({role:session.role,day:$('date').value,today:data.today,events:data.staff,id:session.id,e:escapeHTML}));
  for (const element of $('panel').querySelectorAll('details[data-manage-key]')) if (openEditors.includes(element.dataset.manageKey)) element.open = true;
}
async function refresh(loadDashboard=true) {
  data = await api('desk?day=' + encodeURIComponent($('date').value));
  today(data.today);
  if(tab==='schedule')scheduleData=await api('schedule?day='+encodeURIComponent($('date').value));
  if(tab==='dashboard'&&session?.role==='admin'){dashboardHistoryStatus='loading';dashboardUpdatedAt=new Date();}
  render();
  if(loadDashboard&&tab==='dashboard'&&session?.role==='admin')await loadDashboardDetails();
}
async function loadDashboardDetails() {
  if(session?.role!=='admin'||tab!=='dashboard')return;
  const owner=session,day=$('date').value;
  dashboardHistoryStatus='loading';dashboardHistory=weekDays(day).map(date=>({day:date,stats:date===day?summarizeDesk(data):null}));render();
  const dates=weekDays(day).slice(0,6),requests=dates.map(date=>()=>api('desk?day='+encodeURIComponent(date)));
  requests.push(()=>api('schedule?day='+encodeURIComponent(day)));
  let results;
  if(native){results=[];for(const request of requests){if(session!==owner)return;try{results.push({status:'fulfilled',value:await request()});}catch(reason){results.push({status:'rejected',reason});}}}
  else results=await Promise.allSettled(requests.map(request=>request()));
  if(session!==owner||tab!=='dashboard'||$('date').value!==day)return;
  dashboardHistory=dates.map((date,index)=>({day:date,stats:results[index].status==='fulfilled'?summarizeDesk(results[index].value):null}));dashboardHistory.push({day,stats:summarizeDesk(data)});
  dashboardHistoryStatus=results.slice(0,6).some(result=>result.status==='rejected')?'partial':'ready';
  dashboardSchedule=results[6].status==='fulfilled'?results[6].value:null;dashboardScheduleUnavailable=results[6].status==='rejected';render();
}
async function change(route, payload, label) {
  await api(route,payload);
  message(label);
  await refresh();
}
async function enterWorkspace() {
  $('date').value = $('date').dataset.last = session.today;
  tab = session.role==='admin'?'dashboard':'roster';
  try { await refresh(false); }
  catch (error) { loggedOut(); throw error; }
  $('login').hidden = true;
  $('desk').hidden = $('logout').hidden = false;
  mountShell($('tabs'), {
    mode:session.role === 'teacher' ? 'teacher' : native ? 'admin-mobile' : 'admin',
    active:tab,
    onNavigate(screen) { if (busy) return; tab = screen; if(['schedule','dashboard'].includes(tab))task(refresh);else render(); }
  });
  if(session.role==='admin')await loadDashboardDetails();
}
$('login-form').addEventListener('submit',event => {
  event.preventDefault();
  const form = event.target;
  task(async () => {
    const credentials = Object.fromEntries(new FormData(form));
    form.reset();
    setSession(await api('login',credentials));
    await enterWorkspace();
    message('Logged in');
  });
});
$('logout').addEventListener('click',() => task(async () => {
  try { await api('logout',{}); }
  finally { loggedOut(); }
  message('Logged out');
}));
$('date').addEventListener('change',() => task(async () => {
  const old = $('date').dataset.last || session.today;
  if (!$('date').value) { $('date').value = old; return; }
  try { await refresh(); $('date').dataset.last = $('date').value; }
  catch (error) { $('date').value = old; throw error; }
}));
$('search').addEventListener('input',render);
$('panel').addEventListener('change',event => {
  const target = event.target;
  if(target.matches('form[data-form="export"] select[name="type"]')){for(const card of $('panel').querySelectorAll('[data-report-choice]'))card.setAttribute('aria-pressed',String(card.dataset.reportChoice===target.value));return;}
  if(target.hasAttribute('data-schedule-control')){changeScheduleEditor(target.form,scheduleData);return;}
  if (target.id === 'activity-choice') {
    activityId = Number(target.value);
    activityGroup = '';
    render();
    $('activity-choice').focus();
    return;
  }
  if (target.id === 'activity-group') {
    activityGroup = target.value;
    render();
    $('activity-group').focus();
    return;
  }
  if (target.hasAttribute('data-activity-scope')) {
    target.form.querySelector('[data-activity-groups]').hidden = target.value === 'all';
    return;
  }
  if (target.dataset.activityStudent) {
    const student = Number(target.dataset.activityStudent);
    task(async () => {
      try {
        await change('activity-record',{activity:activityId, student, field:'participation',
          day:$('date').value, value:target.value},'Participation saved');
      } catch (error) { render(); throw error; }
      $('panel').querySelector('[data-activity-student="' + student + '"]')?.focus();
    });
    return;
  }

  const {student,field} = event.target.dataset;
  if (!field || field === 'note') return;
  task(async () => {
    const value = event.target.value;
    const current = data.students.find(s => s.id === Number(student));
    try { await api('record',{student:Number(student), field, value, day:$('date').value}); }
    catch (error) { event.target.value = current?.[field] ?? (field === 'note' ? '' : 'Unmarked'); throw error; }
    current[field] = value;
    message('Student record saved');
    render();
  });
});
$('panel').addEventListener('input',event=>{const form=event.target.closest('form[data-form="schedule"]');if(form&&scheduleData)captureScheduleDraft(form,scheduleData);});
$('panel').addEventListener('submit',event => {
  event.preventDefault();
  const route = event.target.dataset.form;
  if (!route) return;
  const form = new FormData(event.target);
  const payload = Object.fromEntries(form);
  if(route==='schedule'){
    const editor=event.target;
    task(async()=>{
      const changes=schedulePayload(editor,scheduleData);
      if(!confirm('Are you sure you would like to alter the current schedule?'))return;
      await api('schedule',{...changes,confirmed:true});
      resetScheduleDrafts(changes.group);await refresh();message('Schedule updated');
    });return;
  }
  if (route === 'student-csv-preview') {
    task(async () => {
      studentImport = null;
      const file = form.get('file');
      if (!file || !file.size || file.size > MAX_CSV_BYTES) throw Error('Choose a nonempty CSV file smaller than 100 KB.');
      const text = new TextDecoder('utf-8', {fatal:true}).decode(await file.arrayBuffer());
      const students = parseStudentCSV(text, String(form.get('grade') ?? ''));
      const seen = new Set(data.students.map(studentKey));
      const rows = students.map(row => { const key = studentKey(row), skip = seen.has(key); seen.add(key); return {...row,skip}; });
      const group = payload.group ? Number(payload.group) : null;
      studentImport = {rows, group, groupName:data.groups.find(g=>g.id===group)?.name ?? 'No group', added:rows.filter(r=>!r.skip).length, skipped:rows.filter(r=>r.skip).length};
      render(); message('CSV preview ready. Review the names before importing.');
    }); return;
  }
  if(route==='export') {
    payload.format = event.submitter?.value === 'pdf' ? 'pdf' : 'csv';
    task(async()=>{
      const path='export?'+new URLSearchParams(payload);
      const origin=native?mobileOrigin(window.DESK_API_ORIGIN):'';
      const headers=native?await mobileHeaders({origin,path,session}):{};
      const response=await fetch((native?origin+'/api/mobile/':'/kite/api/admin/')+path,{headers,credentials:native?'omit':'same-origin'});
      if(!response.ok)throw new Error((await response.json()).error??'Export failed.');
      const filename=`nycmc-wellspring-compass-after-school-${payload.type}-${payload.from}-${payload.to}.${payload.format}`;
      if(native){
        const plugin=window.Capacitor.registerPlugin('KiteDevice');
        let result;
        if(payload.format==='pdf'){
          const bytes=new Uint8Array(await response.arrayBuffer());let binary='';
          for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));
          result=await plugin.savePdf({filename,base64:btoa(binary)});
        }else result=await plugin.saveCsv({filename,content:await response.text()});
        message(result.saved?'Report saved':'Report save cancelled');return;
      }
      const blob=await response.blob(),link=document.createElement('a'),url=URL.createObjectURL(blob);
      link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message(payload.format.toUpperCase()+' downloaded');
    });return;
  }
  if(['incident','pickup','pickup-contact'].includes(route))payload.student=Number(payload.student);
  if(['incident','pickup'].includes(route))payload.day=$('date').value;
  if(route==='pickup')payload.identityChecked=form.has('identityChecked');
  if (route === 'activities') {
    payload.allGroups = payload.scope === 'all';
    payload.groups = form.getAll('groups').map(Number);
    if (payload.id) payload.id = Number(payload.id);
  }
  if (route === 'student-group') payload.student = Number(payload.student);
  if(route==='student-details')payload.student=Number(payload.student);
  if(route==='rename-group')payload.group=Number(payload.group);
  if (route === 'students' || route === 'student-group') {
    payload.group = payload.group ? Number(payload.group) : null;
  }
  if(route==='teacher-groups')payload.groups=form.getAll('groups').map(Number);
  if (route === 'teacher-group') {
    payload.group = Number(payload.group);
    payload.assigned = payload.assigned === 'true';
  }
  task(async () => {
    await change(route,payload,{'teacher-groups':'Teacher groups saved','rename-group':'Group renamed','student-details':'Student saved',incident:'Incident recorded','resolve-incident':'Incident resolved',pickup:'Pickup recorded','pickup-contact':'Pickup contact authorized','void-pickup':'Pickup corrected',activities:payload.id ? 'Activity updated' : 'Activity created','teacher-group':payload.assigned ? 'Teacher assigned' : 'Teacher removed from group',groups:'Group created','student-group':'Student group saved',students:'Student added',teachers:'Teacher created','teacher-access':'Password reset and sessions revoked'}[route]);
  });
});
$('panel').addEventListener('click',event => {
  if(event.target.closest('[data-shift-today]')&&!busy){$('date').value=data.today;$('date').dispatchEvent(new Event('change',{bubbles:true}));return;}
  const shortcut=event.target.closest('[data-dashboard-go]');
  if(shortcut&&!busy){$('tabs').querySelector('[data-tab="'+shortcut.dataset.dashboardGo+'"]')?.click();if(shortcut.dataset.dashboardGo==='incidents'){const drawer=$('panel').querySelector('[data-manage-key="record-incident"]');if(drawer)drawer.open=true;}$('panel').querySelector('form[data-form="incident"] select')?.focus();return;}
  if(event.target.closest('[data-dashboard-refresh]')){task(refresh);return;}
  const activityCard=event.target.closest('[data-activity-card]');
  if(activityCard&&!busy){$('activity-choice').value=activityCard.dataset.activityCard;$('activity-choice').dispatchEvent(new Event('change',{bubbles:true}));return;}
  const reportCard=event.target.closest('[data-report-choice]');
  if(reportCard&&!busy){const select=reportCard.closest('form').querySelector('select[name="type"]');select.value=reportCard.dataset.reportChoice;select.dispatchEvent(new Event('change',{bubbles:true}));return;}
  const button = event.target.closest('[data-action]');
  if (!button || busy) return;
  const {action,student,id,delta} = button.dataset;
  if(action.startsWith('schedule-')){
    if(session?.role!=='admin')return;
    const editor=button.closest('form[data-form="schedule"]');
    if(action==='schedule-add-row'){
      if(editor.querySelectorAll('[data-schedule-row]').length>=12){message('Use up to 12 blocks per day.',true);return;}
      editor.querySelector('[data-schedule-rows]').insertAdjacentHTML('beforeend',scheduleRow());captureScheduleDraft(editor,scheduleData);
    }else if(action==='schedule-remove-row'){button.closest('[data-schedule-row]').remove();captureScheduleDraft(editor,scheduleData);}
    else if(action==='schedule-cancel'){resetScheduleDrafts(Number(editor.dataset.group));editor.closest('details').open=false;render();}
    else if(action==='schedule-reset-date')task(async()=>{
      const group=scheduleData.groups.find(g=>g.id===Number(button.dataset.group));
      if(!confirm('Are you sure you would like to alter the current schedule?'))return;
      await api('schedule',{group:group.id,scope:'date',day:scheduleData.day,expectedVersion:group.dateVersion,reset:true,confirmed:true});
      resetScheduleDrafts(group.id);await refresh();message('Weekly timetable restored for this date');
    });return;
  }
  if (action === 'cancel-student-import') { studentImport = null; render(); return; }
  if (action === 'import-students' && studentImport && session?.role === 'admin') {
    const preview = studentImport;
    task(async () => {
      const result = await api('import-students', {students:preview.rows.map(({name,grade})=>({name,grade})), group:preview.group});
      studentImport = null;
      await refresh();
      message(`${result.imported} students imported; ${result.skipped} matching rows skipped.`);
    }); return;
  }
  if(action==='device-revoke'){if(confirm('Revoke this device and its active sessions?'))task(()=>change('revoke-device',{id},'Device revoked'));return;}
  if(action==='contact-disable'){if(confirm('Revoke this pickup authorization?'))task(()=>change('pickup-contact-disable',{id},'Pickup authorization revoked'));return;}
  const day = $('date').value;
  if (action === 'archive' && !confirm('Archive this student and keep their prior records?')) return;
  if (action === 'disable' && !confirm('Disable this teacher account and end all sessions?')) return;
  if (action === 'all' && !confirm('Mark all enrolled students present for ' + day + '?')) return;
  const note = action === 'note' ? button.closest('.row').querySelector('[data-field=note]').value : undefined;
  if (action === 'note') {
    task(async () => {
      await api('record',{day, student:Number(student), field:'note', value:note});
      data.students.find(s => s.id === Number(student)).note = note;
      message('Assignment note saved');
    });
    return;
  }
  const operation = {
    'activity-step':['activity-record',{activity:activityId, student:Number(student), field:'progress',value:Number(delta)},'Activity progress saved'],
    all:['all-present',{day},'Attendance saved'],
    step:['step',{student:Number(student),delta:Number(delta)},'Progress saved'],
    shift:['shift',{day,signedIn:button.dataset.in === '1'},'Shift saved'],
    archive:['archive-student',{student:Number(student)},'Student archived'],
    disable:['teacher-access',{id,action:'disable'},'Account disabled']
  }[action];
  task(() => change(...operation));
});
async function restoreAdminSession() {
  await task(async()=>{
    // The HttpOnly cookie is the sole authority; no token is put in web storage.
    const response=await fetch('/kite/api/admin/session',{credentials:'same-origin'});
    if(response.status===401||response.status===403)return;
    if(!response.ok)throw new Error('Could not restore your administrator session.');
    session=await response.json();
    await enterWorkspace();
    message('Administrator session restored');
  });
}
if (!native) await restoreAdminSession();




