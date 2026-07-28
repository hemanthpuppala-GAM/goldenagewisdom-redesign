/* Golden Age Wisdom — roles, privacy and telemetry configuration.
   Edit ONLY this file to change who can reach the admin panel.
   Front-end gating is convenience, not security: the Laravel backend must
   re-check every role server-side before returning member data. */
window.GAW_CONFIG = {
  // Highest privilege: full member management, cleanup, telemetry.
  superAdminEmails: [
    'gamadmin@gmail.com',
  ],
  // Day-to-day moderation: member list + profile cleanup, no telemetry.
  adminEmails: [],

  // Preview mode would let ANY signed-in member grant themselves a role locally.
  // It stays OFF: the panel is reachable only by the emails listed above,
  // after a real OAuth sign-in.
  previewMode: false,

  // Telemetry retention (days) kept in the browser until the backend takes over.
  telemetryRetentionDays: 90,

  privacyEmail: 'info@goldenagewisdom.org',
};

window.GAW_ROLE = function (email) {
  const c = window.GAW_CONFIG, e = String(email || '').trim().toLowerCase();
  if (c.superAdminEmails.some(x => x.toLowerCase() === e)) return 'super_admin';
  if (c.adminEmails.some(x => x.toLowerCase() === e)) return 'admin';
  if (c.previewMode) {
    try {
      const o = localStorage.getItem('gaw_role_preview');
      if (o === 'super_admin' || o === 'admin') return o;
    } catch (err) {}
  }
  return 'member';
};
