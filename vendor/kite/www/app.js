import { mountShell } from './shell.mjs';
import {mobileHeaders,mobileOrigin,apiResult} from './mobile-auth.mjs';
import {programPanel} from './program-panels.mjs';
import {parseStudentCSV, studentKey, MAX_CSV_BYTES} from './student-csv.mjs';

const native = Boolean(window.Capacitor?.isNativePlatform());
const $ = id => document.getElementById(id);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const statuses = {attendance:['Unmarked','Present','Absent','Tardy'],
  homework:['Unmarked','Complete','Needs Help','No Homework']};
let session, data, tab = 'roster', busy = false;
let expiryTimer;
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
  return `<div class="heading"><div><h2>${title}</h2><p class="muted">${text}</p></div>${action}</div>`;
}
function metric(label, count, detail) {
  return `<div class="card metric"><small>${label}</small><strong>${count}</strong><small>${detail}</small></div>`;
}
function groupLabel(student) {
  return student.group_name ? ' · ' + escapeHTML(student.group_name) : '';
}
function roster(students, admin) {
  return heading('Student roster', students.length + ' matching students', admin ?
    '<button class="primary" data-action="all">Mark All Present</button>' : '') +
    students.map(s => {
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
function courses(students) {
  return heading('Skill milestones','Steps carry across dates') + '<div class="course-grid">' +
    students.map(s => `<article class="course card">
      <div class="name">${escapeHTML(s.name)}<small>Grade ${escapeHTML(s.grade)}${groupLabel(s)}</small></div>
      <p>Step ${s.level} / 5</p><progress max="5" value="${s.level}" aria-label="${escapeHTML(s.name)} skill progress"></progress>
      <div class="steps"><button data-action="step" data-student="${s.id}" data-delta="-1" ${s.level === 0 ? 'disabled' : ''}>−1 Step</button>
      <button data-action="step" data-student="${s.id}" data-delta="1" ${s.level === 5 ? 'disabled' : ''}>+1 Step</button></div></article>`).join('') + '</div>';
}
function staff(admin, ownShift) {
  const action = admin ? '' : `<button class="primary" data-action="shift" data-in="${ownShift ? '0' : '1'}"
    ${$('date').value === data.today ? '' : 'disabled'}>${ownShift ? 'Sign Out of Shift' : 'Sign In to Shift'}</button>`;
  return heading(admin ? 'Staff log' : 'My staff log', admin ? 'Teacher check-ins and check-outs for the selected date.' :
    "Select today's date to record your shift.", action) + (data.staff.length ? data.staff.map(event =>
    `<div class="staff"><div class="name">${escapeHTML(event.teacher)}</div>
      <span class="badge ${event.signed_in ? 'in' : ''}">${event.signed_in ? 'Signed In' : 'Signed Out'}</span>
      <time datetime="${escapeHTML(event.at)}">${new Date(event.at).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}</time></div>`).join('') :
    '<p class="empty">No shift activity for this date.</p>');
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
function adminPanel() {
  return heading('Manage program','Manage student enrollment, groups and teacher access.') +
    `<div class="entry"><h2>Registered mobile devices</h2>${(data.devices??[]).map(device=>`<p>${escapeHTML(device.platform)} · ${escapeHTML(device.id.slice(0,12))} · ${device.active?'Active':'Revoked'} ${device.active?`<button data-action="device-revoke" data-id="${escapeHTML(device.id)}">Revoke device and sessions</button>`:''}</p>`).join('')||'<p>No mobile devices enrolled.</p>'}</div>`+
    (data.workspace ? `<div class="entry"><h2>${escapeHTML(data.workspace.name)}</h2>
      <p class="muted">Sponsored access through ${new Intl.DateTimeFormat(undefined, {dateStyle:'medium',timeStyle:'short',timeZone:'America/New_York'}).format(data.workspace.expiresAt)} ET</p></div>` : '') +
    `<div class="entry"><h2>Student groups</h2><form data-form="groups">
      <label>Group name<input type="text" name="name" required maxlength="60"></label>
      <button class="primary">Create Group</button></form>
      <p class="muted">Click a group to view its students. Click a student to edit their name, grade or group.</p>
      </div>` + data.groups.map(groupCard).join('') + unassignedStudents() +
    studentImportPanel() + `<div class="entry"><h2>Students</h2><form data-form="students">
      <label>Student name<input name="name" required maxlength="80"></label>
      <label>Grade<input type="text" name="grade" required maxlength="60"></label>
      <label>Student Group<select name="group">${groupOptions()}</select></label>
      <button class="primary">Add Student</button></form></div>` +
    `<div class="entry"><h2>Teacher accounts</h2><form data-form="teachers">
      <label>User ID<input name="id" required minlength="3" maxlength="32" autocapitalize="none" spellcheck="false"></label>
      <label>Password<input name="password" type="password" required minlength="12" maxlength="128" autocomplete="new-password"></label>
      <button class="primary">Create Teacher</button></form></div>` +
    data.teachers.map(t => `<div class="entry controls"><div class="tools"><strong>${escapeHTML(t.id)}</strong>
      <span class="badge">${t.active ? 'Active' : 'Disabled'}</span>
      ${t.active ? `<button data-action="disable" data-id="${escapeHTML(t.id)}">Disable Account</button></div>
        <form data-form="teacher-access"><input name="id" type="hidden" value="${escapeHTML(t.id)}">
        <input name="action" type="hidden" value="reset">
        <label>New password for ${escapeHTML(t.id)}<input name="password" type="password" required minlength="12" maxlength="128" autocomplete="new-password"></label>
        <button>Reset Password</button></form>` : '</div>'}</div>`).join('');
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
  const setup = admin ? `<div class="entry"><details class="activity-details" ${activities.length ? '' : 'open'}>
    <summary>Create an activity</summary>${activityForm()}</details></div>` : '';
  const header = heading(admin ? 'Activities' : 'My activities','Record participation by date and track progress for each activity.');
  if (!activity) return header + setup + '<p class="empty">No activities assigned yet.</p>';
  activityId = activity.id;
  const groups = new Map(activity.students.map(s => [String(s.group_id),s.group_name]));
  if (activityGroup && !groups.has(activityGroup)) activityGroup = '';
  const students = activity.students.filter(s => (!activityGroup || String(s.group_id) === activityGroup) &&
    (s.name + ' ' + s.group_name).toLowerCase().includes(query));
  return header + setup + `<div class="entry controls">
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
  </div>` + (students.length ? students.map(s => `<div class="entry tools">
    <div class="name">${escapeHTML(s.name)}<small>${escapeHTML(s.group_name)}</small></div>
    <label>Participation<select data-activity-student="${s.id}" aria-label="Participation for ${escapeHTML(s.name)}">
      ${options(participation,s.status ?? 'Unmarked')}</select></label>
    <span class="badge">Step ${s.level} / 5</span>
    <button data-action="activity-step" data-student="${s.id}" data-delta="-1" ${s.level === 0 ? 'disabled' : ''}
      aria-label="Remove a step for ${escapeHTML(s.name)}">−1 Step</button>
    <button data-action="activity-step" data-student="${s.id}" data-delta="1" ${s.level === 5 ? 'disabled' : ''}
      aria-label="Add a step for ${escapeHTML(s.name)}">+1 Step</button>
  </div>`).join('') : '<p class="empty">No enrolled students match this activity view.</p>');
}

function render() {
  if (!session || !data) return;
  const admin = session.role === 'admin';
  const groupNames = admin || !data.groups.length ? '' : ' · Groups: ' + data.groups.map(g => g.name).join(', ');
  const institution = data.workspace ? data.workspace.name + ' · ' : '';
  $('identity').textContent = institution + (admin ? 'Administrator' : 'Teacher') + ' · ' + session.id + groupNames;
  const active = data.students.filter(s => s.active);
  const recent = new Map();
  for (const event of data.staff) if (!recent.has(event.teacher)) recent.set(event.teacher,event.signed_in);
  const ownShift = Boolean(recent.get(session.id));
  $('metrics').innerHTML = metric('Students present',active.filter(s => s.attendance === 'Present').length + ' / ' + active.length,
    active.filter(s => s.attendance === 'Tardy').length + ' tardy · ' + active.filter(s => s.attendance === 'Absent').length + ' absent') +
    metric('Homework complete',active.filter(s => s.homework === 'Complete').length + ' / ' + active.length,
      active.filter(s => s.homework === 'Needs Help').length + ' need help') +
    (admin ? metric('Staff signed in',[...recent.values()].filter(Boolean).length,'For the selected date') :
      metric('My shift',ownShift ? 'Signed In' : 'Signed Out','For the selected date'));
  $('search-wrap').hidden = !['roster','courses','activities'].includes(tab);
  const query = $('search').value.trim().toLowerCase();
  const students = (tab === 'courses' ? active : data.students).filter(s =>
    (s.name + ' grade ' + s.grade + ' ' + (s.group_name ?? '')).toLowerCase().includes(query));
  for (const item of $('tabs').querySelectorAll('button')) item.dataset.tab === tab ? item.setAttribute('aria-current','page') : item.removeAttribute('aria-current');
  const openEditors = [...$('panel').querySelectorAll('details[data-manage-key][open]')].map(element => element.dataset.manageKey);
  $('panel').innerHTML = programPanel(tab,{data,admin,day:$('date').value,escapeHTML,heading}) ?? (tab === 'admin' ? adminPanel() : tab === 'staff' ? staff(admin,ownShift) :
    tab === 'activities' ? activityPanel(admin,query) :
    (tab === 'roster' ? roster(students,admin) : courses(students)) +
      (!students.length ? '<p class="empty">No students match this view.</p>' : ''));
  if (tab === 'admin') for (const element of $('panel').querySelectorAll('details[data-manage-key]')) element.open = openEditors.includes(element.dataset.manageKey);
}
async function refresh() {
  data = await api('desk?day=' + encodeURIComponent($('date').value));
  today(data.today);
  render();
}
async function change(route, payload, label) {
  await api(route,payload);
  message(label);
  await refresh();
}
async function enterWorkspace() {
  $('date').value = $('date').dataset.last = session.today;
  tab = 'roster';
  try { await refresh(); }
  catch (error) { loggedOut(); throw error; }
  $('login').hidden = true;
  $('desk').hidden = $('logout').hidden = false;
  mountShell($('tabs'), {
    mode:session.role === 'teacher' ? 'teacher' : native ? 'admin-mobile' : 'admin',
    active:tab,
    onNavigate(screen) { if (busy) return; tab = screen; render(); }
  });
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
$('panel').addEventListener('submit',event => {
  event.preventDefault();
  const route = event.target.dataset.form;
  if (!route) return;
  const form = new FormData(event.target);
  const payload = Object.fromEntries(form);
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
    task(async()=>{
      const path='export?'+new URLSearchParams(payload);
      const origin=native?mobileOrigin(window.DESK_API_ORIGIN):'';
      const headers=native?await mobileHeaders({origin,path,session}):{};
      const response=await fetch((native?origin+'/api/mobile/':'/kite/api/admin/')+path,{headers,credentials:native?'omit':'same-origin'});
      if(!response.ok)throw new Error((await response.json()).error??'Export failed.');
      const filename=`kite-${payload.type}-${payload.from}-${payload.to}.csv`;
      if(native){const result=await window.Capacitor.registerPlugin('KiteDevice').saveCsv({filename,content:await response.text()});message(result.saved?'CSV saved':'CSV save cancelled');return;}
      const blob=await response.blob(),link=document.createElement('a'),url=URL.createObjectURL(blob);
      link.href=url;link.download=`kite-${payload.type}-${payload.from}-${payload.to}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('CSV downloaded');
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
  if (route === 'teacher-group') {
    payload.group = Number(payload.group);
    payload.assigned = payload.assigned === 'true';
  }
  task(async () => {
    await change(route,payload,{'rename-group':'Group renamed','student-details':'Student saved',incident:'Incident recorded','resolve-incident':'Incident resolved',pickup:'Pickup recorded','pickup-contact':'Pickup contact authorized','void-pickup':'Pickup corrected',activities:payload.id ? 'Activity updated' : 'Activity created','teacher-group':payload.assigned ? 'Teacher assigned' : 'Teacher removed from group',groups:'Group created','student-group':'Student group saved',students:'Student added',teachers:'Teacher created','teacher-access':'Password reset and sessions revoked'}[route]);
  });
});
$('panel').addEventListener('click',event => {
  const button = event.target.closest('[data-action]');
  if (!button || busy) return;
  const {action,student,id,delta} = button.dataset;
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


