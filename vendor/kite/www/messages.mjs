export function messagesPanel({groups,selected,messages,e,heading}) {
  return heading('Group messages','Messages are visible to administrators and teachers assigned to the group.')+(groups.length?`
    <label>Student group<select id="message-group">${groups.map(g=>`<option value="${g.id}" ${g.id===selected?'selected':''}>${e(g.name)}</option>`).join('')}</select></label>
    <section class="card" aria-label="Group conversation">${messages.length?messages.map(m=>`<article class="message-entry"><strong>${e(m.sender_id)}</strong> <time datetime="${e(m.created_at)}">${e(new Date(m.created_at).toLocaleString())}</time><p style="white-space:pre-wrap;overflow-wrap:anywhere">${e(m.body)}</p></article>`).join(''):'<p>No messages yet.</p>'}</section>
    <form class="entry" data-form="group-message"><input type="hidden" name="group" value="${selected}"><label>Message<textarea name="body" required maxlength="2000" rows="4"></textarea></label><button class="primary">Send message</button><button type="button" data-refresh-messages>Refresh messages</button></form>`:'<p class="empty">No groups assigned. Ask your administrator to assign a group.</p>');
}
