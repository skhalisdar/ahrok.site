const icons = {
  dashboard:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="11" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="18" width="7" height="3" rx="1"/>',
  home:'<path d="m2 10 10-8 10 8v11h-7v-7H9v7H2z"/>',
  roster:'<circle cx="12" cy="7" r="4"/><path d="M3 22v-3a9 9 0 0 1 18 0v3"/>',
  attendance:'<rect x="4" y="3" width="16" height="19" rx="2"/><path d="m8 12 3 3 5-6"/>',
  activities:'<path d="m12 2 10 10-10 10L2 12z M12 12v10"/>',
  messages:'<path d="M3 4h18v13H9l-6 5z"/><path d="M7 9h10m-10 4h7"/>',
  reports:'<path d="M4 3v17h17M8 16v-4m5 4V8m5 8V4"/>',
  settings:'<circle cx="12" cy="12" r="4"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4M5 5l3 3m8 8 3 3M5 19l3-3m8-8 3-3"/>'
};
const menus = [['dashboard','Dashboard','dashboard'],['roster','Attendance & HW','attendance'],['courses','Course Progression','roster'],
  ['schedule','Schedule','home'],['activities','Activities','activities'],['staff','Staff Log','home'],['incidents','Incidents','messages'],['pickup','Pickup','roster'],['reports','Reports / Export','reports'],['admin','Manage Program','settings']];
export function mountShell(root, { mode, active, onNavigate }) {
  const items = menus.filter(([id]) => !['dashboard','admin','reports'].includes(id) || mode !== 'teacher');
  root.dataset.mode = mode;
  root.innerHTML = items.map(([id,label,icon]) => `<button type="button" data-tab="${id}"
    ${active === id ? 'aria-current="page"' : ''}>
    <svg viewBox="0 0 24 24" aria-hidden="true">${icons[icon]}</svg><span>${id==='staff'&&mode==='teacher'?'My Shift':label}</span></button>`).join('');
  root.onclick = event => {
    const button = event.target.closest('button[data-tab]');
    if (!button || !root.contains(button)) return;
    for (const item of root.querySelectorAll('[aria-current]')) item.removeAttribute('aria-current');
    button.setAttribute('aria-current','page');
    onNavigate(button.dataset.tab);
  };
}

