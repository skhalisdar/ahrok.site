export async function makeResetSQL(password, derive, random = crypto.getRandomValues.bind(crypto)) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) throw Error('Use 12–128 characters.');
  const hex = bytes => Array.from(bytes, n => n.toString(16).padStart(2, '0')).join('');
  const salt = hex(random(new Uint8Array(16)));
  const encode = value => new TextEncoder().encode(value);
  // The server uses the hex salt as a UTF-8 string, not as raw random bytes.
  const bytes = encode(password);
  let key;
  try { key = await derive(bytes, encode(salt), 32768, 8, 1, 64); }
  finally { bytes.fill(0); }
  const hash = salt + ':' + hex(key);
  key.fill(0);
  return `BEGIN;
DO $reset$
BEGIN
  IF (SELECT count(*) FROM public.deployment_identity WHERE institution_id = 'nycmc-compass') <> 1 THEN
    RAISE EXCEPTION 'Unexpected institution; no changes made';
  END IF;
  IF (SELECT count(*) FROM public.users WHERE id = 'admin' AND role = 'admin' AND active = 1) <> 1 THEN
    RAISE EXCEPTION 'Expected active administrator not found; no changes made';
  END IF;
  UPDATE public.users SET password = '${hash}' WHERE id = 'admin' AND role = 'admin' AND active = 1;
  DELETE FROM public.sessions WHERE user_id = 'admin';
  DELETE FROM public.mobile_challenges WHERE account_id = 'admin';
  DELETE FROM public.auth_throttle WHERE bucket = 'aa73da63e26b40a1bb701c2b4c024870ec49264ba9c8372522459568fa8b5396';
END;
$reset$;
COMMIT;
SELECT id, role, active FROM public.users WHERE id = 'admin';`;
}

if (typeof document !== 'undefined') {
  const $ = id => document.getElementById(id);
  $('recovery').addEventListener('submit', async event => {
    event.preventDefault();
    $('result').hidden = true; $('sql').value = '';
    if ($('new-password').value !== $('confirmation').value) { $('status').textContent = 'The passwords do not match.'; return; }
    $('generate').disabled = true;
    try {
      if (!globalThis.scrypt?.scrypt) throw Error('The password helper did not load. Refresh this page.');
      $('status').textContent = 'Preparing the command privately in your browser…';
      $('sql').value = await makeResetSQL($('new-password').value, globalThis.scrypt.scrypt);
      $('recovery').reset();
      $('result').hidden = false;
      $('status').textContent = 'Command prepared. Your password is not reset until you run it in Neon.';
    } catch (error) { $('status').textContent = error.message; }
    finally { $('generate').disabled = false; }
  });
  $('copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('sql').value); $('status').textContent = 'Copied. Paste it into the production Neon SQL editor and click Run.'; }
    catch { $('sql').focus(); $('sql').select(); $('status').textContent = 'The command is selected. Press Ctrl+C (or Command+C) to copy it.'; }
  });
}
