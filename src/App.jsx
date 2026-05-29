import { useState, useEffect, useRef, useCallback } from "react";
import AstraOrb from "./AstraOrb";


const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&family=Exo+2:wght@100;200;300;400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body, html { height: 100%; overflow: hidden; }

  .astra-root {
    --cyan: #00e5ff;
    --cyan-dim: rgba(0,229,255,0.12);
    --cyan-glow: rgba(0,229,255,0.4);
    --navy: #050c18;
    --panel2: #0a1428;
    --text: #c8e6f5;
    --text-dim: #4a7a9b;
    --text-bright: #e8f4ff;
    --green: #39ff14;
    --amber: #ffaa00;
    --red: #ff3366;
    --border: rgba(0,229,255,0.18);
    --border-bright: rgba(0,229,255,0.5);
    font-family: 'Rajdhani', sans-serif;
    background: var(--navy);
    color: var(--text);
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  /* ── BACKGROUND ── */
  .astra-canvas {
    position: fixed; inset: 0; z-index: 0; opacity: 0.2; pointer-events: none;
  }
  .astra-scanlines {
    position: fixed; inset: 0; pointer-events: none; z-index: 1;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px);
  }

  /* ── CORNER BRACKETS ── */
  .astra-corner { position: fixed; width: 20px; height: 20px; z-index: 3; pointer-events: none; }
  .astra-corner.tl { top: 8px; left: 8px; border-top: 1px solid var(--border-bright); border-left: 1px solid var(--border-bright); }
  .astra-corner.tr { top: 8px; right: 8px; border-top: 1px solid var(--border-bright); border-right: 1px solid var(--border-bright); }
  .astra-corner.bl { bottom: 8px; left: 8px; border-bottom: 1px solid var(--border-bright); border-left: 1px solid var(--border-bright); }
  .astra-corner.br { bottom: 8px; right: 8px; border-bottom: 1px solid var(--border-bright); border-right: 1px solid var(--border-bright); }

  /* ── PAGE LAYOUT ── */
  .astra-page {
    position: relative; z-index: 2;
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 14px 16px 14px 16px;
    gap: 10px;
  }

  /* ── TOPBAR ── */
  .astra-topbar {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-shrink: 0;
  }
  .logo-hex { flex-shrink: 0; }
  .logo-name {
    font-family: 'Rajdhani', sans-serif;
    font-size: 28px; font-weight: 700;
    letter-spacing: 7px;
    color: var(--cyan);
    text-shadow: 0 0 28px var(--cyan-glow);
    line-height: 1;
  }
  .logo-sub {
    font-family: 'Share Tech Mono', monospace;
    font-size: 8px; color: var(--text-dim);
    letter-spacing: 2.5px; margin-top: 3px;
  }
  .topbar-status {
    margin-left: auto;
    display: flex; align-items: center; gap: 16px;
  }
  .status-pill {
    display: flex; align-items: center; gap: 5px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px; color: var(--text-dim); letter-spacing: 1px;
  }
  .dot-green {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--green); box-shadow: 0 0 8px var(--green);
    animation: pulse-dot 2s ease-in-out infinite; flex-shrink: 0;
  }
  @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .sys-val { color: var(--cyan); }

  /* ── MAIN BODY: messages + hud side panel ── */
  .astra-body {
    flex: 1;
    display: flex;
    gap: 12px;
    min-height: 0;
  }

  /* ── CHAT PANEL ── */
  .chat-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: rgba(8,15,30,0.7);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    min-height: 0;
  }

  /* messages scroll area */
  .astra-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scroll-behavior: smooth;
  }
  .astra-messages::-webkit-scrollbar { width: 3px; }
  .astra-messages::-webkit-scrollbar-track { background: transparent; }
  .astra-messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* ── MESSAGES ── */
  .astra-msg { display: flex; gap: 10px; animation: msg-in 0.28s ease-out; }
  .astra-msg.user { flex-direction: row-reverse; }
  @keyframes msg-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }

  .msg-avatar {
    width: 28px; height: 28px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Share Tech Mono', monospace; font-size: 8px;
    border-radius: 3px; letter-spacing: 0;
  }
  .avatar-astra { background: rgba(0,229,255,0.08); border: 1px solid var(--border-bright); color: var(--cyan); }
  .avatar-user  { background: rgba(57,255,20,0.08);  border: 1px solid rgba(57,255,20,0.35); color: var(--green); }

  .msg-inner { max-width: 76%; display: flex; flex-direction: column; gap: 3px; }
  .msg-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: var(--text-dim); letter-spacing: 1px; padding: 0 2px; }
  .astra-msg.user .msg-label { text-align: right; }

  .bubble { padding: 9px 13px; font-size: 14px; line-height: 1.65; border-radius: 2px; white-space: pre-wrap; }
  .bubble-astra { background: var(--panel2); border: 1px solid var(--border); border-left: 2px solid var(--cyan); color: var(--text-bright); }
  .bubble-user  { background: rgba(57,255,20,0.05); border: 1px solid rgba(57,255,20,0.2); border-right: 2px solid var(--green); color: var(--text-bright); }

  .cap-tags { display: flex; gap: 7px; flex-wrap: wrap; margin-top: 6px; }
  .cap-tag {
    font-family: 'Share Tech Mono', monospace; font-size: 9px;
    padding: 3px 8px; border: 1px solid var(--border); color: var(--text-dim);
    letter-spacing: 1px; cursor: pointer; transition: all 0.2s; border-radius: 1px; background: transparent;
  }
  .cap-tag:hover { border-color: var(--cyan); color: var(--cyan); background: var(--cyan-dim); }

  .thinking-dots span { animation: blink 1.2s ease-in-out infinite; }
  .thinking-dots span:nth-child(2){animation-delay:.2s}
  .thinking-dots span:nth-child(3){animation-delay:.4s}
  @keyframes blink { 0%,80%,100%{opacity:0} 40%{opacity:1} }

  /* ── BOTTOM BAR: input + orb ── */
  .bottom-bar {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 10px 14px 10px 14px;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
    background: rgba(5,12,24,0.6);
  }

  .astra-input {
    flex: 1;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--border);
    color: var(--text-bright);
    font-family: 'Rajdhani', sans-serif;
    font-size: 15px;
    padding: 6px 14px 6px 0;
    outline: none;
    letter-spacing: 0.5px;
    transition: border-color 0.2s;
  }
  .astra-input::placeholder { color: var(--text-dim); font-size: 13px; }
  .astra-input:focus { border-bottom-color: var(--cyan); }

  .btn-send {
    background: transparent;
    border: none;
    color: var(--text-dim);
    cursor: pointer;
    padding: 4px 12px 4px 12px;
    transition: color 0.2s;
    display: flex; align-items: center;
  }
  .btn-send:hover { color: var(--cyan); }
  .btn-send svg { width: 18px; height: 18px; }

  /* ── HUD SIDE PANEL ── */
  .hud-panel {
    width: 90px;
    flex-shrink: 0;
    background: rgba(8,15,30,0.7);
    border: 1px solid var(--border);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 28px;
    padding: 20px 8px;
  }
  .hud-item {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    font-family: 'Share Tech Mono', monospace;
  }
  .hud-label { font-size: 8px; color: var(--text-dim); letter-spacing: 1.5px; text-align: center; }
  .hud-val   { font-size: 13px; color: var(--cyan); letter-spacing: 1px; font-weight: 600; }
  .hud-divider { width: 40px; height: 1px; background: var(--border); }

  /* ── ORB ── */
  .orb-wrap {
    position: relative;
    width: 72px; height: 72px;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; user-select: none;
    margin-left: 10px;
  }

  /* ripple rings */
  .orb-ripple {
    position: absolute; border-radius: 50%;
    border: 1px solid rgba(0,229,255,0.3);
    width: 72px; height: 72px;
    animation: ripple-idle 3s ease-out infinite;
    pointer-events: none;
  }
  .orb-ripple:nth-child(1){animation-delay:0s}
  .orb-ripple:nth-child(2){animation-delay:1s}
  .orb-ripple:nth-child(3){animation-delay:2s}
  @keyframes ripple-idle {
    0%  { transform:scale(1);   opacity:0.5; }
    100%{ transform:scale(2.0); opacity:0; }
  }

  .orb-wrap.listening .orb-ripple {
    border-color: rgba(0,229,255,0.7);
    animation: ripple-listen 1.0s ease-out infinite;
  }
  .orb-wrap.listening .orb-ripple:nth-child(1){animation-delay:0s}
  .orb-wrap.listening .orb-ripple:nth-child(2){animation-delay:0.33s}
  .orb-wrap.listening .orb-ripple:nth-child(3){animation-delay:0.66s}
  @keyframes ripple-listen {
    0%  { transform:scale(1);   opacity:0.8; }
    100%{ transform:scale(2.4); opacity:0; }
  }

  .orb-wrap.thinking .orb-ripple {
    border-color: rgba(255,170,0,0.5);
    animation: ripple-think 1.8s ease-in-out infinite;
  }
  .orb-wrap.thinking .orb-ripple:nth-child(1){animation-delay:0s}
  .orb-wrap.thinking .orb-ripple:nth-child(2){animation-delay:0.6s}
  .orb-wrap.thinking .orb-ripple:nth-child(3){animation-delay:1.2s}
  @keyframes ripple-think {
    0%  { transform:scale(1);   opacity:0.6; }
    50% { transform:scale(1.5); opacity:0.3; }
    100%{ transform:scale(2.0); opacity:0; }
  }

  /* wave canvas behind core */
  .orb-wave-canvas { position: absolute; border-radius: 50%; pointer-events: none; }

  /* core circle */
  .orb-core {
    position: relative; z-index: 2;
    width: 48px; height: 48px; border-radius: 50%;
    background: radial-gradient(circle at 38% 32%, rgba(0,229,255,0.28), rgba(0,10,30,0.95) 65%);
    border: 1.5px solid rgba(0,229,255,0.55);
    display: flex; align-items: center; justify-content: center;
    transition: box-shadow 0.3s, border-color 0.3s;
    box-shadow: 0 0 16px rgba(0,229,255,0.2), inset 0 0 10px rgba(0,229,255,0.08);
  }
  .orb-wrap.listening .orb-core {
    border-color: rgba(0,229,255,0.95);
    box-shadow: 0 0 32px rgba(0,229,255,0.65), inset 0 0 16px rgba(0,229,255,0.2);
  }
  .orb-wrap.thinking .orb-core {
    border-color: rgba(255,170,0,0.8);
    animation: core-think 1.5s ease-in-out infinite;
  }
  @keyframes core-think {
    0%,100%{ box-shadow: 0 0 16px rgba(255,170,0,0.2), inset 0 0 8px rgba(255,170,0,0.06); }
    50%    { box-shadow: 0 0 36px rgba(255,170,0,0.55), inset 0 0 18px rgba(255,170,0,0.18); }
  }

  .orb-icon { font-size: 18px; line-height: 1; transition: all 0.3s; }
  .orb-wrap.idle      .orb-icon { color: rgba(0,229,255,0.8); }
  .orb-wrap.listening .orb-icon { color: #00e5ff; filter: drop-shadow(0 0 5px #00e5ff); }
  .orb-wrap.thinking  .orb-icon { color: #ffaa00; filter: drop-shadow(0 0 5px #ffaa00); }

  /* orb label below */
  .orb-label-row {
    display: flex; flex-direction: column; align-items: center;
    margin-left: 10px; gap: 2px;
  }
  .orb-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px; letter-spacing: 2px;
    color: var(--text-dim); transition: color 0.3s; white-space: nowrap;
  }
  .orb-label.listening { color: #00e5ff; }
  .orb-label.thinking  { color: #ffaa00; }
`;

// ── HEX BACKGROUND ───────────────────────────────────────────────────────────
function HexCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let raf, hexes = [], W, H, time = 0;
    const build = () => {
      hexes = [];
      const s = 30, cols = Math.ceil(W / (s * 1.75)) + 2, rows = Math.ceil(H / (s * 1.5)) + 2;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          hexes.push({ x: c * s * 1.75 + (r % 2) * s * 0.875, y: r * s * 1.5, s, phase: Math.random() * Math.PI * 2, sp: 0.002 + Math.random() * 0.003 });
    };
    const drawHex = (cx, cy, s, a) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) { const ang = (Math.PI / 3) * i - Math.PI / 6; ctx.lineTo(cx + s * Math.cos(ang), cy + s * Math.sin(ang)); }
      ctx.closePath(); ctx.strokeStyle = `rgba(0,229,255,${a})`; ctx.lineWidth = 0.5; ctx.stroke();
    };
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; build(); };
    const loop = () => {
      ctx.clearRect(0, 0, W, H); time += 0.01;
      hexes.forEach(h => { const p = Math.sin(time * h.sp * 100 + h.phase); drawHex(h.x, h.y, h.s, Math.max(0, 0.03 + p * 0.07)); });
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("resize", resize); resize(); loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="astra-canvas" />;
}

// ── CORTANA WAVE CANVAS ───────────────────────────────────────────────────────
function WaveCanvas({ state }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const wavesRef  = useRef([
    { freq: 2.1, amp: 0, phase: 0,   speed: 0.018 },
    { freq: 3.4, amp: 0, phase: 2.1, speed: 0.025 },
    { freq: 1.7, amp: 0, phase: 4.3, speed: 0.013 },
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const SIZE   = 72;
    canvas.width = SIZE; canvas.height = SIZE;
    const cx = SIZE / 2, R = SIZE / 2;
    const TARGETS = { idle: [3, 2, 4], listening: [10, 8, 13], thinking: [5, 9, 4] };

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      const targets   = TARGETS[state] || TARGETS.idle;
      const isThink   = state === "thinking";
      wavesRef.current.forEach((w, i) => {
        w.amp   += (targets[i] - w.amp) * 0.06;
        w.phase += w.speed;
        ctx.beginPath();
        for (let deg = 0; deg <= 360; deg++) {
          const rad = (deg * Math.PI) / 180;
          const r   = R * 0.56 + Math.sin(w.freq * rad + w.phase) * w.amp;
          deg === 0 ? ctx.moveTo(cx + r * Math.cos(rad), cx + r * Math.sin(rad))
                    : ctx.lineTo(cx + r * Math.cos(rad), cx + r * Math.sin(rad));
        }
        ctx.closePath();
        const alpha = state === "idle" ? 0.18 : state === "listening" ? 0.42 : 0.28;
        ctx.strokeStyle = isThink ? `rgba(255,${150 + i * 20},0,${alpha})` : `rgba(0,${200 + i * 15},255,${alpha})`;
        ctx.lineWidth = 1.2; ctx.stroke();
        ctx.fillStyle = isThink ? `rgba(255,150,0,0.04)` : `rgba(0,229,255,0.04)`; ctx.fill();
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [state]);

  return <canvas ref={canvasRef} className="orb-wave-canvas" style={{ width: 72, height: 72 }} />;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function ts() {
  const n = new Date();
  return [n.getHours(), n.getMinutes(), n.getSeconds()].map(v => String(v).padStart(2, "0")).join(":");
}

const LOCAL_REPLY = q => {
  const lq = q.toLowerCase();
  if (lq.includes("weather"))   return "Connecting to weather module… Wire up /api/weather in Flask to pull live conditions.";
  if (lq.includes("news"))      return "News feed module ready. Connect Flask /api/news to return live headlines.";
  if (lq.includes("wikipedia")) return "Wikipedia module queued. Connect Flask /api/wiki and I'll surface summaries.";
  if (lq.includes("memory") || lq.includes("earlier")) return "Session memory is active. I retain full context within this session.";
  if (lq.match(/^hi$|^hello/))  return "Hello, Alfred. All ASTRA subsystems operational. What do you need?";
  if (lq.includes("who are you") || lq.includes("what are you")) return "I am ASTRA — Adaptive Speech & Thought Response Assistant. Built by Alfred Acheampong. Powered by Gemini AI.";
  return `Query received: "${q}"\n\nIn the full build this routes to Gemini via Flask /api/chat. Connect the backend for full intelligence.`;
};

const INIT = {
  id: 0, role: "astra", label: "ASTRA · SYSTEM INIT", ts: ts(),
  text: "Greetings, Alfred. I am ASTRA — Adaptive Speech & Thought Response Assistant. All systems nominal.\n\nVoice input is ready — tap the orb. I handle weather, news, Wikipedia, and Gemini AI conversation.\n\nHow may I assist you today?",
  tags: ["◈ WEATHER","◈ NEWS","◈ WIKIPEDIA","◈ GEMINI AI","◈ MEMORY"],
  tagQ: ["What is the weather today?","Give me the latest news","Search Wikipedia for artificial intelligence","Tell me something fascinating","What did we talk about earlier?"]
};

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function Astra() {
  const [messages, setMessages]       = useState([INIT]);
  const [input, setInput]             = useState("");
  const [orbState, setOrbState]       = useState("idle");
  const [sessionTime, setSessionTime] = useState("00:00");
  const msgEndRef   = useRef(null);
  const inputRef    = useRef(null);
  const recogRef    = useRef(null);
  const sessStart   = useRef(Date.now());
  const msgId       = useRef(1);
  const history     = useRef([]);

  useEffect(() => {
    const s = document.createElement("style"); s.textContent = STYLES; document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const iv = setInterval(() => {
      const s = Math.floor((Date.now() - sessStart.current) / 1000);
      setSessionTime(`${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const addMsg = useCallback((role, text) => {
    const id = ++msgId.current;
    setMessages(p => [...p, { id, role, label: role === "user" ? "YOU" : "ASTRA", ts: ts(), text }]);
  }, []);

  const speak = useCallback(text => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0; u.pitch = 0.88; u.volume = 0.9;
    const v = window.speechSynthesis.getVoices();
    const voice = v.find(x => x.name.includes("Google") && x.lang === "en-US") || v.find(x => x.lang === "en-US");
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  }, []);

  const sendQuery = useCallback(async query => {
    if (!query.trim()) return;
    addMsg("user", query);
    setOrbState("thinking");
    const thinkId = ++msgId.current;
    setMessages(p => [...p, { id: thinkId, role: "astra", label: "ASTRA", ts: ts(), text: "···", thinking: true }]);

    try {
      const lq = query.toLowerCase();
      let endpoint = "/api/chat", body = { message: query, history: history.current };
      if (lq.includes("weather")) { endpoint = "/api/weather"; body = { city: lq.replace(/weather|in|for|today|now/g,"").trim() || "Accra" }; }
      else if (lq.includes("news") || lq.includes("headlines")) { endpoint = "/api/news"; body = { country: "us" }; }
      else if (lq.includes("wikipedia") || lq.includes("who is") || lq.includes("what is")) { endpoint = "/api/wiki"; body = { query: query.replace(/wikipedia|search|wiki|who is|what is/gi,"").trim() }; }

      const res   = await fetch(`http://localhost:5000${endpoint}`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      const data  = await res.json();
      const reply = data.reply || data.error || "No response.";
      history.current.push({ role:"user", text: query }, { role:"astra", text: reply });
      setMessages(p => p.filter(m => m.id !== thinkId));
      addMsg("astra", reply); speak(reply);
    } catch {
      setMessages(p => p.filter(m => m.id !== thinkId));
      addMsg("astra", "Connection error — make sure Flask is running on port 5000.");
    }
    setOrbState("idle");
  }, [addMsg, speak]);

  const handleSend = useCallback(() => {
    const v = input.trim(); if (!v) return; setInput(""); sendQuery(v);
  }, [input, sendQuery]);

  const toggleListen = useCallback(() => {
    const hasSR = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    if (!hasSR) { addMsg("astra", "Voice not supported. Try Chrome."); return; }
    if (orbState === "listening") { recogRef.current?.stop(); setOrbState("idle"); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r  = new SR();
    r.continuous = false; r.interimResults = true; r.lang = "en-US";
    r.onstart  = () => setOrbState("listening");
    r.onresult = e => { let t = ""; for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript; setInput(t); };
    r.onend    = () => { setOrbState("idle"); setInput(v => { if (v.trim()) { setTimeout(() => sendQuery(v), 80); return ""; } return v; }); };
    r.onerror  = () => setOrbState("idle");
    recogRef.current = r; r.start();
  }, [orbState, sendQuery, addMsg]);

  const orbIcon  = orbState === "listening" ? "◎" : orbState === "thinking" ? "⟳" : "◉";
  const orbLabel = orbState === "listening" ? "LISTENING…" : orbState === "thinking" ? "PROCESSING…" : "TAP TO SPEAK";

  return (
    <div className="astra-root">
      <HexCanvas />
      <div className="astra-scanlines" />
      <div className="astra-corner tl" /><div className="astra-corner tr" />
      <div className="astra-corner bl" /><div className="astra-corner br" />

      <div className="astra-page">

        {/* TOPBAR */}
        <div className="astra-topbar">
          <div className="logo-hex">
            <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
              <polygon points="18,2 32,10 32,26 18,34 4,26 4,10" fill="rgba(0,229,255,0.07)" stroke="rgba(0,229,255,0.55)" strokeWidth="1"/>
              <polygon points="18,8 27,13 27,23 18,28 9,23 9,13" fill="rgba(0,229,255,0.03)" stroke="rgba(0,229,255,0.28)" strokeWidth="0.5"/>
              <circle cx="18" cy="18" r="4" fill="rgba(0,229,255,0.45)"/>
              <circle cx="18" cy="18" r="2" fill="#00e5ff"/>
            </svg>
          </div>
          <div>
            <div className="logo-name">ASTRA</div>
            <div className="logo-sub">ADAPTIVE SPEECH &amp; THOUGHT RESPONSE ASSISTANT</div>
          </div>
          <div className="topbar-status">
            <div className="status-pill"><div className="dot-green" /><span>ONLINE</span></div>
            <div className="status-pill">CORE:&nbsp;<span className="sys-val">GEMINI</span></div>
            <div className="status-pill">v<span className="sys-val">1.0.0</span></div>
          </div>
        </div>

        {/* BODY */}
        <div className="astra-body">

          {/* CHAT PANEL */}
          <div className="chat-panel">
            <div className="astra-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`astra-msg${msg.role === "user" ? " user" : ""}`}>
                  <div className={`msg-avatar ${msg.role === "user" ? "avatar-user" : "avatar-astra"}`}>
                    {msg.role === "user" ? "YOU" : "AI"}
                  </div>
                  <div className="msg-inner">
                    <div className="msg-label">{msg.label} · {msg.ts}</div>
                    <div className={`bubble ${msg.role === "user" ? "bubble-user" : "bubble-astra"}`}>
                      {msg.thinking
                        ? <span className="thinking-dots"><span>●</span><span>●</span><span>●</span></span>
                        : msg.text}
                    </div>
                    {msg.tags && (
                      <div className="cap-tags">
                        {msg.tags.map((tag, i) => (
                          <button key={i} className="cap-tag"
                            onClick={() => { setInput(msg.tagQ[i]); inputRef.current?.focus(); }}>
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={msgEndRef} />
            </div>

            {/* BOTTOM BAR */}
            <div className="bottom-bar">
              <input
                ref={inputRef}
                className="astra-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Enter command or query…"
                autoComplete="off"
              />
              {/* Send arrow */}
              <button className="btn-send" onClick={handleSend} aria-label="Send">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
              {/* ORB inline */}
              <div className={`orb-wrap ${orbState}`} onClick={toggleListen} role="button" aria-label="Toggle voice">
                <WaveCanvas state={orbState} />
                <div className="orb-ripple" /><div className="orb-ripple" /><div className="orb-ripple" />
                <div className="orb-core">
                  <span className="orb-icon">{orbIcon}</span>
                </div>
              </div>
              {/* label next to orb */}
              <div className="orb-label-row">
                <div className={`orb-label${orbState !== "idle" ? " " + orbState : ""}`}>{orbLabel}</div>
              </div>
            </div>
          </div>

          {/* HUD SIDE PANEL */}
          <div className="hud-panel">
            <div className="hud-item">
              <div className="hud-label">SESSION</div>
              <div className="hud-val">{sessionTime}</div>
            </div>
            <div className="hud-divider" />
            <div className="hud-item">
              <div className="hud-label">MSGS</div>
              <div className="hud-val">{messages.length - 1}</div>
            </div>
            <div className="hud-divider" />
            <div className="hud-item">
              <div className="hud-label">MEMORY</div>
              <div className="hud-val" style={{fontSize:"10px"}}>ACTIVE</div>
            </div>
            <div className="hud-divider" />
            <div className="hud-item" style={{cursor:"pointer"}} onClick={() => { setMessages([INIT]); history.current = []; }}>
              <div className="hud-label" style={{color:"var(--red)", letterSpacing:"1px"}}>CLEAR</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
