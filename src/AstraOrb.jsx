import { useEffect, useRef } from "react";

const ORB_STYLES = `
  .orb-section {
    flex-shrink: 0;
    padding: 20px 0 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    border-top: 1px solid rgba(0,229,255,0.18);
  }

  /* ── OROB OUTER SHELL ── */
  .orb-shell {
    position: relative;
    width: 110px;
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
  }

  /* ── RIPPLE RINGS (idle: slow pulse) ── */
  .orb-ripple {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(0,229,255,0.35);
    animation: ripple-idle 3s ease-out infinite;
    pointer-events: none;
  }
  .orb-ripple:nth-child(1) { width: 110px; height: 110px; animation-delay: 0s; }
  .orb-ripple:nth-child(2) { width: 110px; height: 110px; animation-delay: 1s; }
  .orb-ripple:nth-child(3) { width: 110px; height: 110px; animation-delay: 2s; }
  @keyframes ripple-idle {
    0%   { transform: scale(1);    opacity: 0.5; }
    100% { transform: scale(1.9);  opacity: 0; }
  }

  /* ── RIPPLE: LISTENING ── */
  .orb-shell.listening .orb-ripple {
    border-color: rgba(0,229,255,0.6);
    animation: ripple-listen 1.2s ease-out infinite;
  }
  .orb-shell.listening .orb-ripple:nth-child(1) { animation-delay: 0s; }
  .orb-shell.listening .orb-ripple:nth-child(2) { animation-delay: 0.4s; }
  .orb-shell.listening .orb-ripple:nth-child(3) { animation-delay: 0.8s; }
  @keyframes ripple-listen {
    0%   { transform: scale(1);   opacity: 0.7; }
    100% { transform: scale(2.2); opacity: 0; }
  }

  /* ── RIPPLE: THINKING ── */
  .orb-shell.thinking .orb-ripple {
    border-color: rgba(255,170,0,0.5);
    animation: ripple-think 1.8s ease-in-out infinite;
  }
  .orb-shell.thinking .orb-ripple:nth-child(1) { animation-delay: 0s; }
  .orb-shell.thinking .orb-ripple:nth-child(2) { animation-delay: 0.6s; }
  .orb-shell.thinking .orb-ripple:nth-child(3) { animation-delay: 1.2s; }
  @keyframes ripple-think {
    0%   { transform: scale(1);   opacity: 0.6; }
    50%  { transform: scale(1.5); opacity: 0.3; }
    100% { transform: scale(2);   opacity: 0; }
  }

  /* ── CANVAS WAVE (Cortana-style fluid wave) ── */
  .orb-canvas {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }

  /* ── CORE BUTTON ── */
  .orb-core {
    position: relative;
    z-index: 2;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: radial-gradient(circle at 38% 32%,
      rgba(0,229,255,0.28),
      rgba(0,10,30,0.95) 65%
    );
    border: 1.5px solid rgba(0,229,255,0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: box-shadow 0.3s, border-color 0.3s;
    box-shadow: 0 0 18px rgba(0,229,255,0.2), inset 0 0 12px rgba(0,229,255,0.08);
  }
  .orb-shell.listening .orb-core {
    border-color: rgba(0,229,255,0.9);
    box-shadow: 0 0 32px rgba(0,229,255,0.55), inset 0 0 18px rgba(0,229,255,0.18);
  }
  .orb-shell.thinking .orb-core {
    border-color: rgba(255,170,0,0.7);
    box-shadow: 0 0 28px rgba(255,170,0,0.35), inset 0 0 14px rgba(255,170,0,0.1);
    animation: core-think 1.6s ease-in-out infinite;
  }
  @keyframes core-think {
    0%,100% { box-shadow: 0 0 20px rgba(255,170,0,0.25), inset 0 0 10px rgba(255,170,0,0.08); }
    50%      { box-shadow: 0 0 40px rgba(255,170,0,0.5),  inset 0 0 20px rgba(255,170,0,0.18); }
  }

  /* ── MIC ICON ── */
  .orb-icon {
    font-size: 24px;
    line-height: 1;
    transition: all 0.3s;
  }
  .orb-shell.idle     .orb-icon { color: rgba(0,229,255,0.8); }
  .orb-shell.listening .orb-icon { color: #00e5ff; filter: drop-shadow(0 0 6px #00e5ff); }
  .orb-shell.thinking  .orb-icon { color: #ffaa00; filter: drop-shadow(0 0 6px #ffaa00); }

  /* ── STATUS TEXT ── */
  .orb-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    letter-spacing: 2.5px;
    color: rgba(74,122,155,1);
    transition: color 0.3s;
    text-align: center;
  }
  .orb-label.listening { color: #00e5ff; }
  .orb-label.thinking  { color: #ffaa00; }
`;

function WaveCanvas({ state }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const timeRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const SIZE   = 110;
    canvas.width  = SIZE;
    canvas.height = SIZE;
    const cx = SIZE / 2, cy = SIZE / 2, R = SIZE / 2;

    const WAVES = [
      { freq: 2.1, amp: 0, phase: 0,    speed: 0.018, color: "rgba(0,229,255,VAL)" },
      { freq: 3.4, amp: 0, phase: 2.1,  speed: 0.025, color: "rgba(0,180,255,VAL)" },
      { freq: 1.7, amp: 0, phase: 4.3,  speed: 0.013, color: "rgba(0,229,255,VAL)" },
    ];

    // Target amplitudes by state
    const TARGET = {
      idle:      [4,  3,  5],
      listening: [14, 10, 18],
      thinking:  [7,  12, 6],
    };

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      const targets = TARGET[state] || TARGET.idle;

      WAVES.forEach((w, i) => {
        // Lerp amplitude toward target
        w.amp += (targets[i] - w.amp) * 0.06;
        w.phase += w.speed;

        ctx.beginPath();
        for (let deg = 0; deg <= 360; deg += 1) {
          const rad     = (deg * Math.PI) / 180;
          const noise   = Math.sin(w.freq * rad + w.phase) * w.amp;
          const r       = R * 0.56 + noise;
          const px      = cx + r * Math.cos(rad);
          const py      = cy + r * Math.sin(rad);
          deg === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();

        const alpha = state === "idle" ? 0.18 : state === "listening" ? 0.38 : 0.28;
        const col   = state === "thinking"
          ? w.color.replace("0,229,255", "255,170,0").replace("0,180,255", "255,140,0").replace("VAL", alpha)
          : w.color.replace("VAL", alpha);

        ctx.strokeStyle = col;
        ctx.lineWidth   = 1.2;
        ctx.stroke();

        // Fill with very faint color for depth
        const fillAlpha = state === "idle" ? 0.03 : 0.06;
        ctx.fillStyle   = state === "thinking"
          ? `rgba(255,170,0,${fillAlpha})`
          : `rgba(0,229,255,${fillAlpha})`;
        ctx.fill();
      });

      timeRef.current += 0.01;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [state]);

  return <canvas ref={canvasRef} className="orb-canvas" style={{ width: 110, height: 110 }} />;
}

export default function AstraOrb({ state = "idle", onToggle }) {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = ORB_STYLES;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const icon = state === "listening" ? "◎" : state === "thinking" ? "⟳" : "◉";
  const labelText =
    state === "listening" ? "LISTENING…" :
    state === "thinking"  ? "PROCESSING…" :
    "TAP TO SPEAK";

  return (
    <div className="orb-section">
      <div
        className={`orb-shell ${state}`}
        onClick={onToggle}
        role="button"
        aria-label="Toggle voice input"
      >
        {/* Fluid wave canvas */}
        <WaveCanvas state={state} />

        {/* Ripple rings */}
        <div className="orb-ripple" />
        <div className="orb-ripple" />
        <div className="orb-ripple" />

        {/* Core button */}
        <div className="orb-core">
          <span className="orb-icon">{icon}</span>
        </div>
      </div>

      <div className={`orb-label ${state !== "idle" ? state : ""}`}>
        {labelText}
      </div>
    </div>
  );
}
