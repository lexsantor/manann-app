/* Manann — Tweaks panel */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": ["#22d3ee", "#2563eb"],
  "motion": true,
  "glow": true
}/*EDITMODE-END*/;

function applyManannTweaks(t) {
  const root = document.documentElement;
  const [a, a2] = Array.isArray(t.accent) ? t.accent : ["#22d3ee", "#2563eb"];
  root.style.setProperty("--accent", a);
  root.style.setProperty("--accent-2", a2);
  root.style.setProperty("--grad", `linear-gradient(120deg, ${a2}, ${a})`);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.body.dataset.motion = t.motion && !reduced ? "on" : "off";
  document.body.dataset.glow = t.glow ? "on" : "off";
}

function ManannTweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    applyManannTweaks(t);
  }, [t]);

  return (
    <TweaksPanel>
      <TweakSection label="Color" />
      <TweakColor
        label="Acento"
        value={t.accent}
        options={[
          ["#22d3ee", "#2563eb"],
          ["#60a5fa", "#1d4ed8"],
          ["#a78bfa", "#6d28d9"],
          ["#34d399", "#0d9488"]
        ]}
        onChange={(v) => setTweak("accent", v)}
      />
      <TweakSection label="Movimiento" />
      <TweakToggle label="Animaciones" value={t.motion} onChange={(v) => setTweak("motion", v)} />
      <TweakToggle label="Brillo del cursor" value={t.glow} onChange={(v) => setTweak("glow", v)} />
    </TweaksPanel>
  );
}

(function mountTweaks() {
  const rootEl = document.getElementById("tweaks-root");
  if (!rootEl) return;
  ReactDOM.createRoot(rootEl).render(<ManannTweaksApp />);
})();
