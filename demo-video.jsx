/* Demo walkthrough video — user journey through goldenagewisdom.org */
const { SceneStage, useScene, clamp } = window;

const GOLD = '#e8c877', CREAM = '#fdf8ec', BG = '#332c63';

const AudioBus = { ctx: null, buffers: {} };
// hot-reload safety: silence any sources left playing by a previous copy of this module
if (window.__gawStopDemoAudio) { try { window.__gawStopDemoAudio(); } catch (e) {} }
window.__gawLiveSources = [];
window.__gawStopDemoAudio = () => { for (const s of (window.__gawLiveSources || [])) { try { s.stop(); } catch (e) {} } window.__gawLiveSources = []; };
function ensureCtx() {
  if (!AudioBus.ctx) {
    AudioBus.ctx = new (window.AudioContext || window.webkitAudioContext)();
    const resume = () => { AudioBus.ctx.resume(); };
    window.addEventListener('pointerdown', resume, true);
    window.addEventListener('keydown', resume, true);
  }
  return AudioBus.ctx;
}
function Music({ src = 'assets/score.wav', volume = 0.7 }) {
  const { time, playing, extPlaying } = window.useTimeline();
  const active = playing || extPlaying;
  window.__gawDebug = { time, playing: !!playing, extPlaying: !!extPlaying, wall: Date.now() };
  const ref = React.useRef({ source: null, gain: null, startCtx: 0, startTime: 0 });
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    const ctx = ensureCtx();
    if (!AudioBus.buffers[src]) fetch(src).then(r => r.arrayBuffer()).then(ab => ctx.decodeAudioData(ab)).then(b => { AudioBus.buffers[src] = b; force(); }).catch(() => {});
    const onState = () => force();
    ctx.addEventListener('statechange', onState);
    return () => ctx.removeEventListener('statechange', onState);
  }, [src]);
  React.useEffect(() => {
    const ctx = AudioBus.ctx, buf = AudioBus.buffers[src], st = ref.current;
    if (!ctx || !buf) return;
    const shouldPlay = active && ctx.state === 'running' && time < buf.duration;
    const target = Math.min(time, buf.duration - 0.05);
    // watchdog: if the playhead stops advancing (pause without a state flip), kill audio
    if (ref.lastTime !== time) { ref.lastTime = time; ref.lastWall = performance.now(); }
    if (ref.wd) clearTimeout(ref.wd);
    ref.wd = setTimeout(() => {
      const s2 = ref.current;
      if (s2.source && performance.now() - (ref.lastWall || 0) > 380) {
        try { s2.source.stop(); } catch (e) {}
        ref.current = { source: null, gain: null, startCtx: 0, startTime: 0 };
      }
    }, 450);
      const expected = st.source ? Math.min(st.startTime + (ctx.currentTime - st.startCtx), buf.duration) : null;
    const drift = expected == null ? Infinity : Math.abs(expected - target);
    if (shouldPlay && (!st.source || drift > 0.3)) {
      if (st.source) { try { st.source.stop(); } catch (e) {} }
      const s = ctx.createBufferSource(); s.buffer = buf; s.loop = false;
      window.__gawLiveSources.push(s);
      s.onended = () => { window.__gawLiveSources = (window.__gawLiveSources || []).filter(x => x !== s); };
      const g = ctx.createGain(); g.gain.value = volume;
      s.connect(g); g.connect(ctx.destination);
      s.start(0, target);
      ref.current = { source: s, gain: g, startCtx: ctx.currentTime, startTime: target };
    } else if (!shouldPlay && st.source) {
      try { st.source.stop(); } catch (e) {}
      ref.current = { source: null, gain: null, startCtx: 0, startTime: 0 };
    } else if (st.gain) st.gain.gain.value = volume;
  }, [time, active, volume, src]);
  React.useEffect(() => () => { const st = ref.current; if (st.source) { try { st.source.stop(); } catch (e) {} } }, []);
  // desktop app: play button lives outside the page, so no click ever unlocks audio — show an in-page unlock chip
  const [suspended, setSuspended] = React.useState(true);
  React.useEffect(() => {
    const id = setInterval(() => setSuspended(!AudioBus.ctx || AudioBus.ctx.state !== 'running'), 500);
    return () => clearInterval(id);
  }, []);
  if (!suspended) return null;
  return (
    <div onClick={() => { const c = ensureCtx(); c.resume(); setSuspended(false); }}
         style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 40, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 999, cursor: 'pointer', background: 'rgba(51,44,99,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(232,200,119,0.6)', boxShadow: '0 6px 30px rgba(0,0,0,0.35)', fontFamily: 'Outfit, sans-serif', fontSize: 17, fontWeight: 500, color: '#f5dfa4' }}>
      🔊 Tap once to enable sound
    </div>
  );
}

const PARTS = Array.from({ length: 26 }, (_, i) => ({ x: (i * 47.3) % 100, y: (i * 71.7) % 100, s: 2 + (i % 3), d: 8 + (i % 5) * 3, delay: -(i * 1.3) }));
function FloatingMotes() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 3 }}>
      {PARTS.map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: p.x + '%', top: p.y + '%', width: p.s, height: p.s, borderRadius: '50%', background: 'rgba(245,223,164,0.5)', boxShadow: '0 0 6px rgba(232,200,119,0.6)', animation: `demoFloat ${p.d}s ease-in-out ${p.delay}s infinite` }} />
      ))}
    </div>
  );
}
const M = {
  fade(p, i0, i1, o0, o1) { if (p <= i0) return 0; if (p < i1) return (p - i0) / (i1 - i0); if (p <= o0) return 1; if (p < o1) return 1 - (p - o0) / (o1 - o0); return 0; },
  lerp(p, a, b) { return a + (b - a) * clamp(p, 0, 1); },
  smooth(p) { p = clamp(p, 0, 1); return p * p * (3 - 2 * p); },
};

function Shot({ src, from = 1, to = 1.08, origin = '50% 30%', label }) {
  const { progress } = useScene();
  const o = M.fade(progress, 0, 0.08, 0.92, 1);
  const s = M.lerp(M.smooth(progress), from, to);
  return (
    <div style={{ position: 'absolute', inset: 0, background: BG }}>
      <div style={{ position: 'absolute', inset: 40, borderRadius: 22, overflow: 'hidden', border: '1px solid rgba(232,200,119,0.4)', boxShadow: '0 30px 90px rgba(0,0,0,0.45)', opacity: o }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 38, background: '#251f4d', display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', zIndex: 2 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e5484d' }} /><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f2d032' }} /><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ec97a' }} />
          <span style={{ marginLeft: 14, padding: '4px 18px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#cfc8ba' }}>www.goldenagewisdom.org</span>
        </div>
        <img src={src} style={{ position: 'absolute', top: 38, left: 0, width: '100%', height: 'calc(100% - 38px)', objectFit: 'cover', objectPosition: '50% 0%', transform: `scale(${s})`, transformOrigin: origin }} />
      </div>
      {label ? <Caption text={label.text} sub={label.sub} /> : null}
    </div>
  );
}

function Caption({ text, sub }) {
  const { progress } = useScene();
  const o = M.fade(progress, 0.06, 0.16, 0.86, 0.96);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 60, display: 'flex', justifyContent: 'center', opacity: o, zIndex: 5 }}>
      <div style={{ maxWidth: 820, textAlign: 'center', padding: '15px 34px', borderRadius: 20, background: 'rgba(37,31,77,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(232,200,119,0.35)' }}>
        <div style={{ fontFamily: 'Marcellus, serif', fontSize: 27, color: CREAM, lineHeight: 1.3 }}>{text}</div>
        {sub ? <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16.5, fontWeight: 300, color: '#c4bcab', marginTop: 6, lineHeight: 1.45 }}>{sub}</div> : null}
      </div>
    </div>
  );
}

function STitle() {
  const { progress } = useScene();
  const o1 = M.fade(progress, 0.05, 0.2, 0.85, 0.96);
  const o2 = M.fade(progress, 0.2, 0.38, 0.85, 0.96);
  return (
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 120%, #8a7ab8, #4a4183 55%, ${BG})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <img src="assets/logo.jpeg" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(232,200,119,0.6)', boxShadow: '0 0 50px rgba(232,200,119,0.4)', opacity: o1 }} />
      <div style={{ textAlign: 'center', opacity: o2 }}>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, letterSpacing: '0.3em', color: '#c99a3f' }}>PRODUCT DEMO — A SEEKER'S JOURNEY</div>
        <div style={{ fontFamily: 'Marcellus, serif', fontSize: 52, color: CREAM, marginTop: 10 }}>goldenagewisdom.org</div>
      </div>
    </div>
  );
}

function S40Days() {
  const { progress } = useScene();
  const o = M.fade(progress, 0, 0.1, 0.9, 0.98);
  const fill = M.smooth((progress - 0.1) / 0.65);
  const day = Math.round(M.lerp(fill, 1, 40));
  return (
    <div style={{ position: 'absolute', inset: 0, background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: o }}>
      <div style={{ fontFamily: 'Marcellus, serif', fontSize: 40, color: CREAM }}>The 40-day challenge</div>
      <div style={{ position: 'relative', width: 210, height: 210 }}>
        <svg width="210" height="210" viewBox="0 0 210 210">
          <circle cx="105" cy="105" r="92" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="12" />
          <circle cx="105" cy="105" r="92" fill="none" stroke={GOLD} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${578 * fill} 578`} transform="rotate(-90 105 105)" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'Marcellus, serif', fontSize: 56, color: '#f5dfa4', lineHeight: 1 }}>{day}</div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, color: '#9a927f' }}>of 40 days</div>
        </div>
      </div>
      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 19, fontWeight: 300, color: '#c4bcab', maxWidth: 620, textAlign: 'center', lineHeight: 1.5 }}>30 minutes of silence a day. The dashboard tracks every sit — streaks, total stillness, journey stage.</div>
    </div>
  );
}

function SEnd() {
  const { progress } = useScene();
  const o = M.fade(progress, 0.05, 0.25, 0.9, 0.98);
  const items = ['Join as a volunteer', 'Support with a donation', 'Join live group events'];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 120%, #8a7ab8, #4a4183 55%, ${BG})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
      <div style={{ fontFamily: 'Marcellus, serif', fontSize: 42, color: CREAM, opacity: o, textAlign: 'center' }}>Day 40: healed, calm, radiant.<br />What next?</div>
      <div style={{ display: 'flex', gap: 16, opacity: o }}>
        {items.map((t, i) => {
          const oo = M.fade(progress, 0.25 + i * 0.1, 0.35 + i * 0.1, 0.9, 0.98);
          return <div key={t} style={{ opacity: oo, padding: '16px 26px', borderRadius: 18, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(232,200,119,0.4)', fontFamily: 'Outfit, sans-serif', fontSize: 18, color: '#f2e3bb' }}>{t}</div>;
        })}
      </div>
      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 17, fontWeight: 300, color: '#c99a3f', letterSpacing: '0.08em', opacity: o }}>goldenagewisdom.org — come, join</div>
    </div>
  );
}

function SceneHome() { return <Shot src="assets/demo/01-home.png" label={{ text: '1 · A seeker lands on the homepage', sub: 'Golden cosmic design, the mission, and one clear call: begin your journey.' }} />; }
function SceneFilm() { return <Shot src="assets/demo/film.png" from={1.04} to={1.14} label={{ text: '2 · They watch the 70-second intro film', sub: 'Silence → breath → sahasrara → kundalini → Satya Yugam, with score and narration.' }} />; }
function SceneLogin() { return <Shot src="assets/demo/01-member.png" from={1} to={1.06} label={{ text: '3 · One-tap sign up', sub: 'Google, Facebook or Apple — OAuth 2.0, no passwords stored, encrypted data.' }} />; }
function SceneDash() { return <Shot src="assets/demo/02-member.png" label={{ text: '4 · Their dashboard tracks the journey', sub: 'Streak, weekly sits, journey stage — and one button to meditate now.' }} />; }
function SceneBot() { return <Shot src="assets/demo/04-member.png" from={1.05} to={1.18} origin="85% 70%" label={{ text: '5 · Questions? The Wisdom Guide answers', sub: '"I felt light at my crown…" — it explains experiences, shares reference videos, knows your streak.' }} />; }
function SceneJournal() { return <Shot src="assets/demo/05-member.png" label={{ text: '6 · Private journal & photo gallery', sub: 'Encrypted entries after each sit; photos from gatherings, safely uploaded.' }} />; }

window.DemoVideo = function DemoVideo() {
  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 64px)', minHeight: 420, background: BG }}>
      <SceneStage width={1280} height={720} bg={BG} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}
                  persistent={<React.Fragment><Music src="assets/demo-music.mp4" volume={0.85} /><FloatingMotes /></React.Fragment>}>
        {{ Title: STitle, Home: SceneHome, Film: SceneFilm, Login: SceneLogin, Dash: SceneDash, FortyDays: S40Days, Bot: SceneBot, Journal: SceneJournal, End: SEnd }}
      </SceneStage>
    </div>
  );
};
