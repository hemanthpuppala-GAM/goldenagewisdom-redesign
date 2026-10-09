/* Golden Age Wisdom — shared member registry (Supabase).
   The database is the single source of truth for member numbers.
   Only three RPCs are exposed; the member table itself is unreadable publicly. */
(function () {
  const URL = 'https://aicjclttdubvaslootfz.supabase.co';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpY2pjbHR0ZHVidmFzbG9vdGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MDczNTYsImV4cCI6MjEwMTA4MzM1Nn0.FoUKbnAG2WczJW_ZhUm_g5C-rUxixs_TnGmx7LuX-9E';

  async function rpc(fn, args) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 9000);
    try {
      const r = await fetch(URL + '/rest/v1/rpc/' + fn, {
        method: 'POST', signal: ctl.signal,
        headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + KEY },
        body: JSON.stringify(args || {}),
      });
      clearTimeout(t);
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { clearTimeout(t); return null; }
  }

  window.GAW_BACKEND = {
    /* Registers (or recognises) an email and returns its permanent number.
       null = offline / backend unreachable — caller falls back to local. */
    signup: (name, email) => rpc('gaw_signup', { p_name: name || '', p_email: email || '' }),
    sealFounder: (name, email) => rpc('gaw_seal_founder', { p_name: name || '', p_email: email || '' }),
    count: () => rpc('gaw_count', {}),
    /* Practice history (sits, journal, event registrations) keyed by email,
       so a member's streak follows them across phone, tablet and laptop. */
    practiceGet: (email) => rpc('gaw_practice_get', { p_email: email || '' }),
    /* Full member list for the Admin Panel — requires the private registry
       key (admin_keys table). Wrong key returns {ok:false}. */
    membersList: (key) => rpc('gaw_members_list', { p_key: key || '' }),
    practicePut: (email, data) => rpc('gaw_practice_put', { p_email: email || '', p_data: data || {} }),
    /* Support Desk — core team signs in with phone + own password (backend/support-desk.sql).
       Every call RPC takes the session token returned by supportLogin. */
    supportLogin: (phone, password) => rpc('gaw_support_login', { p_phone: phone || '', p_password: password || '' }),
    supportSetPassword: (phone, password, email) => rpc('gaw_support_set_password', { p_phone: phone || '', p_password: password || '', p_email: email || '' }),
    supportLogout: (token) => rpc('gaw_support_logout', { p_token: token || '' }),
    supportList: (token) => rpc('gaw_support_list', { p_token: token || '' }),
    supportPut: (token, call) => rpc('gaw_support_put', { p_token: token || '', p_call: call || {} }),
    supportResolve: (token, id) => rpc('gaw_support_resolve', { p_token: token || '', p_id: id }),
    supportDelete: (token, id) => rpc('gaw_support_delete', { p_token: token || '', p_id: id }),
  };
})();
