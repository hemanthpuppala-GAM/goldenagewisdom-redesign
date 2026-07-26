/* Intro film — "What Meditation Awakens" — built on animations-v2 SceneStage */
const { SceneStage, useScene, clamp } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle } = window;

const GOLD = '#e8c877', GOLD_D = '#c99a3f', CREAM = '#fdf8ec', BG = '#332c63';
let SHOW_CAPTIONS = true;

const MOTION = {
  // 0→1→0 window; 0 at progress 0 and 1 (frame-match contract)
  fade(p, i0, i1, o0, o1) {
    if (p <= i0) return 0;
    if (p < i1) return (p - i0) / (i1 - i0);
    if (p <= o0) return 1;
    if (p < o1) return 1 - (p - o0) / (o1 - o0);
    return 0;
  },
  lerp(p, a, b) { return a + (b - a) * clamp(p, 0, 1); },
  smooth(p) { p = clamp(p, 0, 1); return p * p * (3 - 2 * p); },
};

const STARS = Array.from({ length: 80 }, (_, i) => ({
  x: (i * 137.508) % 100, y: (i * 61.803) % 100,
  s: 1 + (i % 3), o: 0.15 + ((i * 37) % 55) / 100,
}));

function Backdrop() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 120%, #8a7ab8 0%, #4a4183 55%, #332c63 100%)' }}>
      {STARS.map((st, i) => (
        <div key={i} style={{ position: 'absolute', left: st.x + '%', top: st.y + '%', width: st.s, height: st.s, borderRadius: '50%', background: '#f5ecd6', opacity: st.o }} />
      ))}
    </div>
  );
}

function Caption({ text, sub }) {
  const { progress } = useScene();
  const o = MOTION.fade(progress, 0.04, 0.12, 0.88, 0.97);
  if (!SHOW_CAPTIONS) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center', opacity: o, zIndex: 5 }}>
      <div style={{ maxWidth: 860, textAlign: 'center', padding: '16px 36px', borderRadius: 22, background: 'rgba(51,44,99,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(232,200,119,0.28)' }}>
        <div style={{ fontFamily: 'Marcellus, serif', fontSize: 31, color: CREAM, lineHeight: 1.35 }}>{text}</div>
        {sub ? <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 19, fontWeight: 300, color: '#c4bcab', marginTop: 8, lineHeight: 1.5 }}>{sub}</div> : null}
      </div>
    </div>
  );
}

function KenBurns({ src, from, to, origin, dim, tx }) {
  const { progress } = useScene();
  const o = MOTION.fade(progress, 0, 0.08, 0.92, 1);
  const s = MOTION.lerp(progress, from, to);
  const x = tx ? MOTION.lerp(progress, tx[0], tx[1]) : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      <img src={src} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `translateX(${x}%) scale(${s})`, transformOrigin: origin || '50% 50%' }} />
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(51,44,99,${dim ?? 0.45}) 0%, rgba(51,44,99,0.2) 45%, rgba(51,44,99,0.8) 100%)` }} />
    </div>
  );
}

function SceneOpening() {
  const { progress } = useScene();
  const omO = MOTION.fade(progress, 0.06, 0.2, 0.85, 0.96);
  const titleO = MOTION.fade(progress, 0.22, 0.38, 0.85, 0.96);
  const eyebrowO = MOTION.fade(progress, 0.12, 0.26, 0.85, 0.96);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
        <div style={{ width: 150, height: 150, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(232,200,119,0.3), rgba(232,200,119,0.02) 70%)', border: '1px solid rgba(232,200,119,0.45)', opacity: omO, transform: `scale(${0.94 + 0.08 * MOTION.smooth(progress)})` }}>
          <span style={{ fontFamily: 'Marcellus, serif', fontSize: 62, color: GOLD }}>ॐ</span>
        </div>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 15, letterSpacing: '0.3em', color: GOLD_D, opacity: eyebrowO }}>GOLDEN AGE WISDOM PRESENTS</div>
        <div style={{ fontFamily: 'Marcellus, serif', fontSize: 58, color: CREAM, opacity: titleO, textShadow: '0 2px 50px rgba(232,200,119,0.3)' }}>What Meditation Awakens</div>
      </div>
    </div>
  );
}

function Meditator({ glow = 0, slump = 0, breath = 0, scale = 1 }) {
  const body = '#1e1838';
  const rim = `rgba(232,200,119,${0.35 + 0.6 * glow})`;
  return (
    <div style={{ position: 'relative', width: 260, height: 250, transform: `scale(${scale})` }}>
      <div style={{ position: 'absolute', left: '50%', top: '46%', width: 340, height: 340, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: `radial-gradient(circle, rgba(232,200,119,${0.28 * glow}), rgba(232,200,119,0) 68%)` }} />
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', left: '50%', top: 6, width: 56, height: 56, marginLeft: -28, borderRadius: '50%', background: body, boxShadow: `0 0 ${8 + 24 * glow}px ${rim}`, transform: `rotate(${slump}deg)`, transformOrigin: '50% 130%' }} />
        <div style={{ position: 'absolute', left: '50%', top: 62, width: 110, height: 122, marginLeft: -55, borderRadius: '46px 46px 30px 30px', background: body, boxShadow: `0 0 ${8 + 20 * glow}px ${rim}`, transform: `rotate(${slump * 0.55}deg)`, transformOrigin: '50% 100%' }} />
        <div style={{ position: 'absolute', left: '50%', top: 100, width: 40, height: 40, marginLeft: -20, borderRadius: '50%', background: `radial-gradient(circle, rgba(245,223,164,${0.25 + 0.65 * breath}), rgba(245,223,164,0) 72%)`, transform: `scale(${0.8 + 0.5 * breath})` }} />
        <div style={{ position: 'absolute', left: '50%', top: 92, width: 20, height: 92, marginLeft: -74, borderRadius: 12, background: body, transform: 'rotate(16deg)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 92, width: 20, height: 92, marginLeft: 54, borderRadius: 12, background: body, transform: 'rotate(-16deg)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 172, width: 204, height: 62, marginLeft: -102, borderRadius: 32, background: body, boxShadow: `0 0 ${8 + 20 * glow}px ${rim}` }} />
      </div>
    </div>
  );
}

function CinematicFrame() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 58%, rgba(42,36,82,0.5) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 46, background: '#2a2452' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 46, background: '#2a2452' }} />
    </div>
  );
}

function SceneSilence() {
  const { progress, localTime } = useScene();
  const settle = MOTION.smooth(progress * 1.5); // restless → still
  const thoughts = [0, 1, 2, 3, 4, 5, 6];
  const breathRate = 3.4 - 1.8 * settle; // breath visibly slowing
  const breath = 0.5 - 0.5 * Math.cos(localTime * breathRate);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      <KenBurns src={window.__resources.heroImg} from={1.06} to={1.18} origin="50% 30%" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, opacity: MOTION.fade(progress, 0, 0.08, 0.92, 1) }}>
        {/* MIND — thought sparks around the head, jittering then dissolving */}
        {thoughts.map((i) => {
          const ang = (i / 7) * Math.PI * 2 - Math.PI / 2;
          const jit = Math.sin(localTime * (2.4 + i * 0.5) + i * 2) * 14 * (1 - settle);
          const tO = clamp(1 - settle * 1.3, 0, 1) * (0.35 + 0.4 * Math.sin(localTime * 3 + i * 1.7));
          return <div key={i} style={{ position: 'absolute', left: `calc(50% + ${Math.cos(ang) * 120 + jit}px)`, top: `calc(21% + ${Math.sin(ang) * 62 + jit}px)`, width: 8, height: 8, borderRadius: '50%', background: '#cfc4ee', boxShadow: '0 0 8px rgba(207,196,238,0.8)', opacity: clamp(tO, 0, 1) }} />;
        })}
        {/* MIND — ripple rings contracting into stillness around the head */}
        {[0, 1].map((i) => {
          const ph = ((localTime / 3) + i / 2) % 1;
          return <div key={'r' + i} style={{ position: 'absolute', left: '50%', top: '24%', width: 150, height: 150, marginLeft: -75, marginTop: -75, borderRadius: '50%', border: '1px solid rgba(207,196,238,0.7)', transform: `scale(${1 + ph * (1.6 - settle)})`, opacity: (1 - ph) * 0.5 * (1 - settle * 0.55) }} />;
        })}
        {/* BODY — breathing glow at the heart, slowing and softening */}
        <div style={{ position: 'absolute', left: '50%', top: '46%', width: 120, height: 120, margin: '-60px 0 0 -60px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,223,164,0.5), rgba(245,223,164,0) 70%)', transform: `scale(${0.75 + 0.45 * breath})`, opacity: 0.5 + 0.3 * settle }} />
      </div>
      <Caption text="Meditation brings you into silence." sub="Watch it happen: racing thoughts dissolve, the breath slows, and mind and body settle into deep natural quiet." />
    </div>
  );
}

function SceneBreath() {
  const { progress, localTime } = useScene();
  const o = MOTION.fade(progress, 0, 0.08, 0.92, 1);
  const cycle = (localTime % 8) / 8; // 8s breath cycle, starts settled
  const breath = 0.5 - 0.5 * Math.cos(cycle * Math.PI * 2);
  const label = cycle < 0.42 ? 'breathe in' : cycle < 0.58 ? 'the silent gap' : 'release';
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      <KenBurns src={window.__resources.medImg} from={1.02} to={1.14} origin="50% 45%" dim={0.35} />
      <div style={{ position: 'absolute', inset: 0, opacity: o }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 300, height: 300, margin: '-150px 0 0 -150px', borderRadius: '50%', border: '1px solid rgba(232,200,119,0.55)', transform: `scale(${0.8 + 0.32 * breath})`, boxShadow: `0 0 ${30 + 70 * breath}px rgba(232,200,119,0.3), inset 0 0 ${20 + 50 * breath}px rgba(232,200,119,0.14)` }} />
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 130, height: 130, margin: '-65px 0 0 -65px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,223,164,0.55), rgba(245,223,164,0) 70%)', transform: `scale(${0.7 + 0.5 * breath})` }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '74%', textAlign: 'center', fontFamily: 'Outfit, sans-serif', fontSize: 19, fontWeight: 300, letterSpacing: '0.26em', color: CREAM, textTransform: 'uppercase', textShadow: '0 1px 20px rgba(51,44,99,0.9)' }}>{label}</div>
      </div>
      <Caption text="The breath becomes subtle." sub="Prana refines — and the silent gap between breaths grows longer and longer." />
    </div>
  );
}

function SceneCrown() {
  const { progress } = useScene();
  const beamO = MOTION.fade(progress, 0.12, 0.28, 0.86, 0.96);
  const beamH = 165 * MOTION.smooth((progress - 0.12) / 0.45);
  const glowO = beamO * MOTION.smooth((progress - 0.4) / 0.25);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      <KenBurns src={window.__resources.heroImg} from={1.3} to={1.6} origin="50% 6%" dim={0.4} />
      <div style={{ position: 'absolute', left: '50%', top: 0, width: 10, height: beamH, marginLeft: -5, background: 'linear-gradient(180deg, rgba(245,223,164,0.95), rgba(245,223,164,0.08))', opacity: beamO, borderRadius: 5, boxShadow: '0 0 24px rgba(245,223,164,0.5)' }} />
      <div style={{ position: 'absolute', left: '50%', top: 168, width: 120, height: 120, margin: '-60px 0 0 -60px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,223,164,0.85), rgba(245,223,164,0) 70%)', opacity: glowO }} />
      <Caption text="Prana is received through the sahasrara." sub="In deep absorption, life-energy flows in directly through the thousand-petaled crown." />
    </div>
  );
}

const CHAKRAS = ['#e5484d', '#f28b30', '#f2d032', '#4ec97a', '#4aa8e8', '#5c5ce0', '#b285f0'];
function SceneKundalini() {
  const { progress } = useScene();
  const o = MOTION.fade(progress, 0, 0.08, 0.92, 1);
  const s = MOTION.lerp(MOTION.smooth(progress), 1.04, 1.18);
  const rise = MOTION.smooth((progress - 0.08) / 0.72); // bottom-to-top awakening reveal
  const revealY = rise * 115; // reveal line rises bottom→top (0deg: 0% = bottom)
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      <div style={{ position: 'absolute', inset: 0, opacity: o, transform: `scale(${s})`, transformOrigin: '50% 45%' }}>
        <img src={window.__resources.medImg} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 38%' }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(0deg, rgba(51,44,99,0) ${revealY}%, rgba(51,44,99,0.93) ${Math.min(revealY + 18, 130)}%)` }} />
        <div style={{ position: 'absolute', left: '50%', top: `${clamp(100 - revealY + 6, 2, 96)}%`, width: 200, height: 46, margin: '-23px 0 0 -100px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,244,214,0.65), rgba(245,223,164,0) 70%)', opacity: clamp(rise * 3, 0, 1) * clamp((1 - rise) * 6, 0, 1) }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(51,44,99,0.35), rgba(51,44,99,0.1) 50%, rgba(51,44,99,0.75))' }} />
      </div>
      <Caption text="Kundalini awakens." sub="The dormant energy rises from the root, chakra by chakra, to the crown." />
    </div>
  );
}

function SceneOneness() {
  const { progress, localTime } = useScene();
  const o = MOTION.fade(progress, 0, 0.1, 0.9, 0.98);
  const bloom = MOTION.smooth((progress - 0.1) / 0.5);
  const flare = Math.sin(Math.PI * clamp((progress - 0.3) / 0.55, 0, 1)); // swells mid-scene, settles before the cut
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      <KenBurns src={window.__resources.crowdImg} from={1.35} to={1.02} origin="50% 30%" dim={0.3} />
      <div style={{ position: 'absolute', inset: 0, opacity: o }}>
        {[0, 1, 2].map((i) => {
          const ph = ((localTime / 5) + i / 3) % 1;
          return <div key={i} style={{ position: 'absolute', left: '50%', top: '42%', width: 220, height: 220, margin: '-110px 0 0 -110px', borderRadius: '50%', border: '1px solid rgba(232,200,119,0.6)', transform: `scale(${1 + ph * 4})`, opacity: (1 - ph) * 0.4 * bloom }} />;
        })}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 42%, rgba(245,223,164,0.5), rgba(245,223,164,0) 58%)', opacity: bloom * 0.9, transform: `scale(${1 + bloom * 0.9})` }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 40%, rgba(255,248,228,0.9), rgba(255,248,228,0) 65%)', opacity: flare * 0.75 }} />
      </div>
      <Caption text="You meet the universe as yourself." sub="Oneness. Stillness. Boundless peace — the light within and the light around become one." />
    </div>
  );
}

function SceneFortyDays() {
  const { progress } = useScene();
  const o = MOTION.fade(progress, 0.03, 0.12, 0.9, 0.98);
  const count = Math.max(1, Math.round(40 * MOTION.smooth((progress - 0.08) / 0.6)));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, opacity: o }}>
        <div style={{ fontFamily: 'Marcellus, serif', fontSize: 150, lineHeight: 1, color: GOLD, textShadow: '0 0 80px rgba(232,200,119,0.45)' }}>{count}<span style={{ fontSize: 40, color: '#c4bcab', marginLeft: 14 }}>days</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 18px)', gap: 12 }}>
          {Array.from({ length: 40 }, (_, i) => (
            <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid rgba(232,200,119,0.45)', background: i < count ? GOLD : 'rgba(232,200,119,0.06)', boxShadow: i < count ? '0 0 10px rgba(232,200,119,0.5)' : 'none' }} />
          ))}
        </div>
      </div>
      <Caption text="Give us 40 days — a 30-minute sit in silence." sub="No kriyas, no breath techniques. Close your eyes and watch the breath — that’s all. Then see how well you act, and how deeply mind and body heal." />
    </div>
  );
}

function SceneWithin() {
  const { progress, localTime } = useScene();
  const o = MOTION.fade(progress, 0.03, 0.12, 0.9, 0.98);
  const radiate = MOTION.smooth((progress - 0.15) / 0.5);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      <KenBurns src={window.__resources.heroImg} from={1.02} to={1.12} origin="50% 55%" dim={0.3} />
      <div style={{ position: 'absolute', inset: 0, opacity: o }}>
        {[0, 1, 2].map((i) => {
          const ph = ((localTime / 4) + i / 3) % 1;
          return <div key={i} style={{ position: 'absolute', left: '50%', top: '44%', width: 200, height: 200, margin: '-100px 0 0 -100px', borderRadius: '50%', border: '1.5px solid rgba(245,223,164,0.7)', transform: `scale(${1 + ph * 3.5})`, opacity: (1 - ph) * 0.5 * radiate }} />;
        })}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 44%, rgba(245,223,164,0.35), rgba(245,223,164,0) 50%)', opacity: radiate }} />
        {[[-380, -120], [390, -80], [-300, 150], [320, 170], [0, -250], [-160, 230]].map((pt, i) => (
          <div key={i} style={{ position: 'absolute', left: '50%', top: '44%', width: 14, height: 14, borderRadius: '50%', background: GOLD, opacity: clamp(0.2 + 0.7 * MOTION.smooth((progress - 0.25 - i * 0.06) / 0.2), 0, 1) * o, transform: `translate(${pt[0] * (0.4 + 0.6 * radiate)}px, ${pt[1] * (0.4 + 0.6 * radiate)}px)`, boxShadow: '0 0 16px rgba(232,200,119,0.8)' }} />
        ))}
      </div>
      <Caption text="Real happiness is within." sub="Not in what you buy — that is temporary. What you radiate from within heals you, your family, and everyone you bring along." />
    </div>
  );
}

function SceneTogether() {
  const { progress, localTime } = useScene();
  const o = MOTION.fade(progress, 0, 0.1, 0.9, 0.98);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      <KenBurns src={window.__resources.crowdImg} from={1.05} to={1.28} origin="50% 42%" dim={0.35} />
      <div style={{ position: 'absolute', inset: 0, opacity: o }}>
        {[0, 1, 2].map((i) => {
          const ph = ((localTime / 4.5) + i / 3) % 1;
          return <div key={i} style={{ position: 'absolute', left: '50%', top: '38%', width: 190, height: 190, margin: '-95px 0 0 -95px', borderRadius: '50%', border: '1px solid rgba(245,223,164,0.75)', transform: `scale(${1 + ph * 4.5})`, opacity: (1 - ph) * 0.45 }} />;
        })}
      </div>
      <Caption text="Become a member — meditate live, together." sub="Live group sessions with experienced meditative masters, joined virtually through the quantum field, with the blessings of the divine universal masters." />
    </div>
  );
}

const DHARMA_LEGS = ['Austerity', 'Cleanliness', 'Compassion', 'Truth'];
const SATYA_FACTS = [
  'Satya means truth — an age where righteousness and virtue reign, free of wickedness and deceit.',
  'Dharma, the cow of morality, stands firm on all four legs — righteousness at its absolute peak.',
  'All beings meditate and live in harmony with nature — no division, no war, no conflict.',
  'Humans possess immense strength — living, the Vedas say, up to 100,000 years.',
];
function SceneSatyaYugam() {
  const { progress } = useScene();
  const sun = MOTION.fade(progress, 0.05, 0.35, 0.92, 0.99);
  const titleO = MOTION.fade(progress, 0.08, 0.2, 0.9, 0.97);
  const factIdx = Math.min(3, Math.floor(((progress - 0.14) / 0.76) * 4));
  const factPhase = ((progress - 0.14) / 0.76) * 4 - factIdx; // 0→1 within each fact
  const factO = titleO * MOTION.fade(factPhase, 0, 0.18, 0.82, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      <div style={{ position: 'absolute', inset: 0, opacity: sun * 0.5 }}>
        <img src={window.__resources.crowdImg} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 70%', transform: `scale(${1.05 + 0.1 * MOTION.smooth(progress)})` }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(51,44,99,0.9), rgba(51,44,99,0.65) 55%, rgba(51,44,99,0.9))' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 115%, rgba(232,200,119,0.55), rgba(232,200,119,0.12) 45%, rgba(232,200,119,0) 70%)', opacity: sun }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, paddingBottom: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: titleO }}>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, letterSpacing: '0.3em', color: GOLD_D }}>THE GOLDEN AGE OF TRUTH</div>
          <div style={{ fontFamily: 'Marcellus, serif', fontSize: 56, color: CREAM, textShadow: '0 2px 60px rgba(232,200,119,0.4)' }}>Satya Yugam is dawning.</div>
        </div>
        <div style={{ display: 'flex', gap: 26, alignItems: 'flex-end' }}>
          {DHARMA_LEGS.map((leg, i) => {
            const rise = MOTION.smooth((progress - 0.16 - i * 0.08) / 0.14);
            return (
              <div key={leg} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: rise * titleO }}>
                <div style={{ width: 30, height: 92 * rise, borderRadius: 15, background: 'linear-gradient(180deg, #f5dfa4, rgba(201,154,63,0.35))', boxShadow: '0 0 26px rgba(232,200,119,0.4)' }} />
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 17, fontWeight: 500, letterSpacing: '0.1em', color: GOLD, textTransform: 'uppercase' }}>{leg}</div>
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13.5, letterSpacing: '0.16em', color: '#9a927f', opacity: titleO, marginTop: -14 }}>DHARMA STANDS ON ALL FOUR LEGS</div>
        <div style={{ maxWidth: 780, minHeight: 66, textAlign: 'center', fontFamily: 'Outfit, sans-serif', fontSize: 23, fontWeight: 300, lineHeight: 1.5, color: '#e6ddc8', opacity: factO }}>{SATYA_FACTS[clamp(factIdx, 0, 3)]}</div>
      </div>
    </div>
  );
}

function SceneInvitation() {
  const { progress } = useScene();
  const logoO = MOTION.fade(progress, 0.06, 0.22, 0.86, 0.97);
  const textO = MOTION.fade(progress, 0.2, 0.38, 0.86, 0.97);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <img src={window.__resources.logoImg} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(232,200,119,0.6)', boxShadow: '0 0 60px rgba(232,200,119,0.35)', opacity: logoO }} />
        <div style={{ textAlign: 'center', opacity: textO }}>
          <div style={{ fontFamily: 'Marcellus, serif', fontSize: 46, color: CREAM }}>Begin your journey.</div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 21, fontWeight: 300, color: GOLD, marginTop: 12, letterSpacing: '0.06em' }}>goldenagewisdom.org — free, for every seeker</div>
        </div>
      </div>
    </div>
  );
}

const NARRATION = [
  { t: 0.8, text: 'What meditation awakens.' },
  { t: 4.6, text: 'Meditation brings you into silence. The restless mind settles into deep, natural quiet.' },
  { t: 10.6, text: 'The breath becomes subtle. Prana refines, and the silent gap between breaths grows longer.' },
  { t: 17.6, text: 'Prana is received through the sahasrara — the thousand-petaled crown.' },
  { t: 24.6, text: 'Kundalini awakens. The dormant energy rises, chakra by chakra, to the crown.' },
  { t: 31.4, text: 'You meet the universe as yourself. Oneness. Stillness. Boundless peace.' },
  { t: 36.6, text: 'Give us forty days. A thirty minute sit in silence. No kriyas, no techniques. Close your eyes, and watch the breath.' },
  { t: 42.6, text: 'Real happiness is within — and what you radiate heals you, and your family.' },
  { t: 48.6, text: 'Become a member. Meditate live with experienced masters, through the quantum field.' },
  { t: 54.6, text: 'Satya Yugam is dawning. The golden age of truth, where dharma stands on all four legs.' },
  { t: 66.5, text: 'Begin your journey. Golden age wisdom dot org.' },
];
function FilmVoice({ enabled }) {
  const { time, playing, extPlaying } = window.useTimeline();
  const active = playing || extPlaying;
  const lastRef = React.useRef(-1);
  const voicesRef = React.useRef([]);
  React.useEffect(() => {
    if (!window.speechSynthesis) return;
    const load = () => { voicesRef.current = speechSynthesis.getVoices(); };
    load();
    speechSynthesis.addEventListener('voiceschanged', load);
    return () => speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);
  React.useEffect(() => {
    if (!window.speechSynthesis) return;
    if (!enabled || !active) { speechSynthesis.cancel(); lastRef.current = -1; return; }
    // speak the latest line whose start we've passed (and not yet spoken) — robust to frame skips
    let idx = -1;
    for (let i = 0; i < NARRATION.length; i++) if (time >= NARRATION[i].t && time < NARRATION[i].t + 6) idx = i;
    if (idx >= 0 && idx !== lastRef.current) {
      lastRef.current = idx;
      speechSynthesis.cancel();
      speechSynthesis.resume();
      const u = new SpeechSynthesisUtterance(NARRATION[idx].text);
      u.pitch = 0.4; u.rate = 0.78; u.volume = 1; // deepest bass the engine allows
      const vs = voicesRef.current.length ? voicesRef.current : speechSynthesis.getVoices();
      // guaranteed MALE voice: explicit known-male names first, skip known-female (Zira/Neerja/Heera/Swara/female Hindi)
      const isFemale = (v) => /zira|neerja|heera|swara|female|susan|hazel|catherine|linda|eva|salli|joanna|aria|jenny|sonia|kalpana/i.test(v.name);
      u.voice = vs.find(v => /david|mark|guy|george|daniel|ravi|rishi|prabhat|hemant|madhur/i.test(v.name) && !isFemale(v))
        || vs.find(v => /en[-_]IN/i.test(v.lang) && !isFemale(v))
        || vs.find(v => /male/i.test(v.name) && /^en/i.test(v.lang))
        || vs.find(v => /^en[-_](GB|US)/i.test(v.lang) && !isFemale(v))
        || vs.find(v => /^en/i.test(v.lang) && !isFemale(v))
        || vs.find(v => /^en/i.test(v.lang)) || null;
      speechSynthesis.speak(u);
    }
    if (idx === -1 && time < 0.5) lastRef.current = -1; // rewound to start
  }, [Math.floor(time * 5), active, enabled]);
  React.useEffect(() => () => window.speechSynthesis && speechSynthesis.cancel(), []);
  return null;
}

const AudioBus = { ctx: null, buffers: {} };
function ensureCtx() {
  if (!AudioBus.ctx) {
    AudioBus.ctx = new (window.AudioContext || window.webkitAudioContext)();
    const resume = () => { AudioBus.ctx.resume(); if (window.speechSynthesis) speechSynthesis.resume(); };
    window.addEventListener('pointerdown', resume, true);
    window.addEventListener('keydown', resume, true);
  }
  return AudioBus.ctx;
}
function FilmScore({ src, enabled, volume = 1 }) {
  const { time, playing, extPlaying } = window.useTimeline();
  const active = playing || extPlaying;
  const ref = React.useRef({ source: null, gain: null, startCtx: 0, startTime: 0 });
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    const ctx = ensureCtx();
    if (!AudioBus.buffers[src]) {
      fetch(src).then(r => r.arrayBuffer()).then(ab => ctx.decodeAudioData(ab)).then(b => { AudioBus.buffers[src] = b; force(); }).catch(() => {});
    }
    const onState = () => force();
    ctx.addEventListener('statechange', onState);
    return () => ctx.removeEventListener('statechange', onState);
  }, [src]);
  React.useEffect(() => {
    const ctx = AudioBus.ctx, buf = AudioBus.buffers[src], st = ref.current;
    if (!ctx || !buf) return;
    const shouldPlay = active && enabled && ctx.state === 'running';
    const target = time % buf.duration;
    const expected = st.source ? (st.startTime + (ctx.currentTime - st.startCtx)) % buf.duration : null;
    const drift = expected == null ? Infinity : Math.abs(expected - target);
    if (shouldPlay && (!st.source || drift > 0.3)) {
      if (st.source) { try { st.source.stop(); } catch (e) {} }
      const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true;
      const g = ctx.createGain(); g.gain.value = volume;
      s.connect(g); g.connect(ctx.destination);
      s.start(0, target);
      ref.current = { source: s, gain: g, startCtx: ctx.currentTime, startTime: target };
    } else if (!shouldPlay && st.source) {
      try { st.source.stop(); } catch (e) {}
      ref.current = { source: null, gain: null, startCtx: 0, startTime: 0 };
    } else if (st.gain) { st.gain.gain.value = volume; }
  }, [time, active, enabled, volume, src]);
  React.useEffect(() => () => { const st = ref.current; if (st.source) { try { st.source.stop(); } catch (e) {} } }, []);
  // hidden media element so video export still embeds this track's audio
  // (not muted: it never plays in live mode — WebAudio handles that — but the exporter reads its audio track)
  return <video src={src} playsInline preload="auto"
    data-om-exportable-video-play-start={0}
    data-om-exportable-video-play-end={90}
    style={{ position: 'absolute', width: 2, height: 2, opacity: 0, pointerEvents: 'none' }} />;
}

window.IntroFilm = function IntroFilm() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  SHOW_CAPTIONS = t.captions;
  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 64px)', minHeight: 420, background: BG }}>
      <SceneStage width={1280} height={720} bg={BG} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}
                  persistent={<React.Fragment><FilmScore src={window.__resources.scoreAud} enabled={t.music} volume={0.95} /><FilmScore src={window.__resources.omAud} enabled={t.omChant} volume={0.5} /><FilmScore src={window.__resources.impactsAud} enabled={t.impacts} volume={0.9} /><FilmVoice enabled={t.narration} /><CinematicFrame /></React.Fragment>}>
        {{
          Opening: SceneOpening, Silence: SceneSilence, Breath: SceneBreath,
          Crown: SceneCrown, Kundalini: SceneKundalini, Oneness: SceneOneness,
          FortyDays: SceneFortyDays, Within: SceneWithin, Together: SceneTogether,
          SatyaYugam: SceneSatyaYugam, Invitation: SceneInvitation,
        }}
      </SceneStage>
      <TweaksPanel>
        <TweakSection label="Film" />
        <TweakToggle label="Voice narration" value={t.narration} onChange={(v) => setTweak('narration', v)} />
        <TweakToggle label="Flute & classical score" value={t.music} onChange={(v) => setTweak('music', v)} />
        <TweakToggle label="Om chant layer" value={t.omChant} onChange={(v) => setTweak('omChant', v)} />
        <TweakToggle label="Impact sounds" value={t.impacts} onChange={(v) => setTweak('impacts', v)} />
        <TweakToggle label="Captions" value={t.captions} onChange={(v) => setTweak('captions', v)} />
        <TweakToggle label="Motion editor" value={t.motionEditor} onChange={(v) => setTweak('motionEditor', v)} />
      </TweaksPanel>
    </div>
  );
};
