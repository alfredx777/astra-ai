import { useState, useEffect, useRef, useCallback } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&family=Exo+2:wght@100;200;300;400&display=swap');

  .astra-root {
    --cyan: #00e5ff;
    --cyan-dim: rgba(0,229,255,0.12);
    --cyan-glow: rgba(0,229,255,0.4);
    --navy: #050c18;
    --panel: #080f1e;
    --panel2: #0a1428;
    --text: #c8e6f5;
    --text-dim: #4a7a9b;
    --text-bright: #e8f4ff;
    --green: #39ff14;
    --amber: #ffaa00;
    --red: #ff3366;
    --border: rgba(0,229,255,0.18);
    --border-bright: rgba(0,229,255,0.5);
    margin: 0; padding: 0; box-sizing: border-box;
    font-family: 'Rajdhani', sans-serif;
    background: var(--navy); color: var(--text);
    height: 100vh; width: 100vw; overflow: hidden;
    display: flex; flex-direction: column; position: relative;
  }
  .astra-root *, .astra-root *::before, .astra-root *::after { box-sizing: border-box; }

  .astra-canvas { position: fixed; inset: 0; z-index: 0; opacity: 0.22; pointer-events: none; }
  .astra-scanlines {
    position: fixed; inset: 0; pointer-events: none; z-index: 1;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px);
  }
  .astra-corner { position: fixed; width: 22px; height: 22px; z-index: 3; pointer-events: none; }
  .astra-corner.tl { top: 10px; left: 10px; border-top: 1px solid var(--border-bright); border-left: 1px solid var(--border-bright); }
  .astra-corner.tr { top: 10px; right: 10px; border-top: 1px solid var(--border-bright); border-right: 1px solid var(--border-bright); }
  .astra-corner.bl { bottom: 10px; left: 10px; border-bottom: 1px solid var(--border-bright); border-left: 1px solid var(--border-bright); }
  .astra-corner.br { bottom: 10px; right: 10px; border-bottom: 1px solid var(--border-bright); border-right: 1px solid var(--border-bright); }

  .astra-hud { position: fixed; top: 68px; right: 22px; z-index: 4; display: flex; flex-direction: column; gap: 8px; opacity: 0.65; }
  .hud-item { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: var(--text-dim); letter-spacing: 1px; text-align: right; }
  .hud-val { color: var(--cyan); font-size: 11px; display: block; }

  .astra-shell { position: relative; z-index: 2; display: flex; flex-direction: column; height: 100vh; max-width: 900px; margin: 0 auto; padding: 0 18px; width: 100%; }

  .astra-topbar { display: flex; align-items: center; justify-content: space-between; padding: 14px 0 10px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .logo-block { display: flex; align-items: center; gap: 12px; }
  .logo-name { font-family: 'Rajdhani', sans-serif; font-size: 26px; font-weight: 700; letter-spacing: 6px; color: var(--cyan); text-shadow: 0 0 24px var(--cyan-glow); line-height: 1; }
  .logo-sub { font-family: 'Share Tech Mono', monospace; font-size: 8px; color: var(--text-dim); letter-spacing: 2px; margin-top: 3px; }
  .status-block { display: flex; align-items: center; gap: 18px; }
  .status-pill { display: flex; align-items: center; gap: 5px; font-family: 'Share Tech Mono', monospace; font-size: 10px; color: var(--text-dim); letter-spacing: 1px; }
  .dot-green { width: 6px; height: 6px; border-radius: 50%; background: var(--green); box-shadow: 0 0 8px var(--green); animation: pulse-dot 2s ease-in-out infinite; flex-shrink: 0; }
  @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.35} }
  .sys-val { color: var(--cyan); }

  .astra-messages { flex: 1; overflow-y: auto; padding: 14px 0; display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth; }
  .astra-messages::-webkit-scrollbar { width: 3px; }
  .astra-messages::-webkit-scrollbar-track { background: transparent; }
  .astra-messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .astra-msg { display: flex; gap: 10px; animation: msg-in 0.28s ease-out; }
  .astra-msg.user { flex-direction: row-reverse; }
  @keyframes msg-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }

  .msg-avatar { width: 30px; height: 30px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-family: 'Share Tech Mono', monospace; font-size: 8px; border-radius: 3px; letter-spacing: 0; }
  .avatar-astra { background: rgba(0,229,255,0.08); border: 1px solid var(--border-bright); color: var(--cyan); }
  .avatar-user { background: rgba(57,255,20,0.08); border: 1px solid rgba(57,255,20,0.35); color: var(--green); }

  .msg-inner { max-width: 74%; display: flex; flex-direction: column; gap: 3px; }
  .msg-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: var(--text-dim); letter-spacing: 1px; padding: 0 2px; }
  .astra-msg.user .msg-label { text-align: right; }
  .bubble { padding: 10px 14px; font-size: 14px; line-height: 1.65; font-weight: 400; border-radius: 2px; white-space: pre-wrap; }
  .bubble-astra { background: var(--panel2); border: 1px solid var(--border); border-left: 2px solid var(--cyan); color: var(--text-bright); }
  .bubble-user { background: rgba(57,255,20,0.05); border: 1px solid rgba(57,255,20,0.22); border-right: 2px solid var(--green); color: var(--text-bright); }

  .cap-tags { display: flex; gap: 7px; flex-wrap: wrap; margin-top: 6px; }
  .cap-tag { font-family: 'Share Tech Mono', monospace; font-size: 9px; padding: 4px 9px; border: 1px solid var(--border); color: var(--text-dim); letter-spacing: 1px; cursor: pointer; transition: all 0.2s; border-radius: 1px; background: transparent; }
  .cap-tag:hover { border-color: var(--cyan); color: var(--cyan); background: var(--cyan-dim); }

  .voice-section { flex-shrink: 0; padding: 14px 0 10px; display: flex; flex-direction: column; align-items: center; gap: 10px; border-top: 1px solid var(--border); }

  .orb-wrap { position: relative; width: 88px; height: 88px; cursor: pointer; user-select: none; }
  .orb-ring3 { position: absolute; inset: -16px; border-radius: 50%; border: 1px solid rgba(0,229,255,0.07); transition: all 0.3s; }
  .orb-ring2 { position: absolute; inset: -8px; border-radius: 50%; border: 1px solid rgba(0,229,255,0.18); transition: all 0.3s; }
  .orb-ring1 { position: absolute; inset: 0; border-radius: 50%; border: 1px solid var(--border-bright); transition: all 0.3s; }
  .orb-core { position: absolute; inset: 8px; border-radius: 50%; background: radial-gradient(circle at 38% 32%, rgba(0,229,255,0.25), rgba(0,229,255,0.04) 60%, transparent); border: 1px solid var(--border-bright); display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
  .orb-sym { font-size: 22px; color: var(--cyan); line-height: 1; }

  .orb-wrap.listening .orb-ring1 { animation: spin 3s linear infinite; border-color: var(--cyan); box-shadow: 0 0 20px var(--cyan-glow); }
  .orb-wrap.listening .orb-ring2 { animation: spin-r 4s linear infinite; border-color: rgba(0,229,255,0.4); }
  .orb-wrap.listening .orb-ring3 { animation: spin 7s linear infinite; border-color: rgba(0,229,255,0.18); }
  .orb-wrap.listening .orb-core { box-shadow: 0 0 30px var(--cyan-glow), inset 0 0 18px rgba(0,229,255,0.12); }
  .orb-wrap.thinking .orb-core { animation: think-pulse 1.4s ease-in-out infinite; }
  @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes spin-r { from{transform:rotate(0)} to{transform:rotate(-360deg)} }
  @keyframes think-pulse { 0%,100%{opacity:0.5} 50%{opacity:1;box-shadow:0 0 30px var(--cyan-glow)} }

  .waveform { display: flex; align-items: center; gap: 3px; height: 26px; opacity: 0; transition: opacity 0.3s; }
  .waveform.active { opacity: 1; }
  .wbar { width: 3px; border-radius: 2px; background: var(--cyan); animation: wave 0.75s ease-in-out infinite; }
  .wbar:nth-child(1){animation-delay:0s;height:5px} .wbar:nth-child(2){animation-delay:.1s;height:13px}
  .wbar:nth-child(3){animation-delay:.2s;height:22px} .wbar:nth-child(4){animation-delay:.15s;height:17px}
  .wbar:nth-child(5){animation-delay:.05s;height:9px} .wbar:nth-child(6){animation-delay:.25s;height:24px}
  .wbar:nth-child(7){animation-delay:.1s;height:15px} .wbar:nth-child(8){animation-delay:.2s;height:7px}
  @keyframes wave { 0%,100%{transform:scaleY(0.35)} 50%{transform:scaleY(1)} }

  .astra-status-line { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: var(--text-dim); letter-spacing: 2px; text-align: center; height: 14px; transition: color 0.3s; }
  .astra-status-line.active { color: var(--cyan); }

  .input-row { display: flex; gap: 8px; padding-bottom: 16px; flex-shrink: 0; }
  .astra-input { flex: 1; background: var(--panel2); border: 1px solid var(--border); color: var(--text-bright); font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 400; padding: 10px 14px; outline: none; border-radius: 2px; letter-spacing: 0.5px; transition: border-color 0.2s; }
  .astra-input::placeholder { color: var(--text-dim); font-size: 13px; }
  .astra-input:focus { border-color: var(--border-bright); }
  .btn-send { background: var(--cyan-dim); border: 1px solid var(--border-bright); color: var(--cyan); font-family: 'Share Tech Mono', monospace; font-size: 11px; padding: 10px 16px; cursor: pointer; letter-spacing: 1px; border-radius: 2px; transition: all 0.2s; white-space: nowrap; }
  .btn-send:hover { background: rgba(0,229,255,0.22); box-shadow: 0 0 14px var(--cyan-glow); }
  .btn-clear { background: transparent; border: 1px solid var(--border); color: var(--text-dim); font-family: 'Share Tech Mono', monospace; font-size: 10px; padding: 10px 12px; cursor: pointer; letter-spacing: 1px; border-radius: 2px; transition: all 0.2s; }
  .btn-clear:hover { border-color: rgba(255,51,102,0.5); color: var(--red); }

  .thinking-dots span { animation: blink 1.2s ease-in-out infinite; }
  .thinking-dots span:nth-child(2){animation-delay:.2s}
  .thinking-dots span:nth-child(3){animation-delay:.4s}
  @keyframes blink { 0%,80%,100%{opacity:0} 40%{opacity:1} }
`;

function HexCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let raf, hexes = [], W, H, time = 0;
    const buildGrid = () => {
      hexes = [];
      const s = 30;
      const cols = Math.ceil(W / (s * 1.75)) + 2;
      const rows = Math.ceil(H / (s * 1.5)) + 2;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          hexes.push({ x: c * s * 1.75 + (r % 2) * s * 0.875, y: r * s * 1.5, s, phase: Math.random() * Math.PI * 2, sp: 0.002 + Math.random() * 0.003 });
    };
    const drawHex = (cx, cy, s, a) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI / 3) * i - Math.PI / 6;
        ctx.lineTo(cx + s * Math.cos(ang), cy + s * Math.sin(ang));
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(0,229,255,${a})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    };
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; buildGrid(); };
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      time += 0.01;
      hexes.forEach(h => { const p = Math.sin(time * h.sp * 100 + h.phase); drawHex(h.x, h.y, h.s, Math.max(0, 0.03 + p * 0.07)); });
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("resize", resize);
    resize(); loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="astra-canvas" />;
}

function timestamp() {
  const n = new Date();
  return [n.getHours(), n.getMinutes(), n.getSeconds()].map(v => String(v).padStart(2, "0")).join(":");
}

const LOCAL_REPLY = (q) => {
  const lq = q.toLowerCase();
  if (lq.includes("weather")) return "Connecting to weather module… Wire up /api/weather in your Flask backend to pull live conditions and forecasts here.";
  if (lq.includes("news")) return "News feed module ready. Your Flask /api/news endpoint will return headlines which I'll display in real-time.";
  if (lq.includes("wikipedia") || lq.includes("search wiki")) return "Wikipedia lookup queued. Flask /api/wiki handles the search — connect it and I'll surface article summaries directly.";
  if (lq.includes("memory") || lq.includes("earlier") || lq.includes("before")) return "Session memory is active. I retain full conversation context within this session. Memory resets on page close — no persistent storage until your backend adds it.";
  if (lq.match(/^hi$|^hello/)) return "Hello, Alfred. ASTRA subsystems are fully operational. What do you need?";
  if (lq.includes("who are you") || lq.includes("what are you")) return "I am ASTRA — Adaptive Speech & Thought Response Assistant. Built by Alfred Acheampong. Powered by Gemini AI with a React frontend and Flask backend.";
  return `Query received: "${q}"\n\nIn the full build this routes to Gemini via your Flask /api/chat endpoint. Connect the backend and I will respond with full intelligence.`;
};

const INIT_MSG = {
  id: 0, role: "astra", label: "ASTRA · SYSTEM INIT", ts: timestamp(),
  text: "Greetings, Alfred. I am ASTRA — your Adaptive Speech & Thought Response Assistant. All systems nominal.\n\nI can handle weather queries, live news, Wikipedia lookups, and Gemini-powered conversation. Voice input is ready — tap the orb below.\n\nHow may I assist you today?",
  tags: ["◈ WEATHER", "◈ NEWS", "◈ WIKIPEDIA", "◈ GEMINI AI", "◈ MEMORY"],
  tagQueries: ["What is the weather today?", "Give me the latest news", "Search Wikipedia for artificial intelligence", "Tell me something fascinating", "What did we talk about earlier?"]
};

export default function Astra() {
  const [messages, setMessages] = useState([INIT_MSG]);
  const [input, setInput] = useState("");
  const [orbState, setOrbState] = useState("idle");
  const [waveActive, setWaveActive] = useState(false);
  const [statusText, setStatusText] = useState("TAP ORB TO ACTIVATE VOICE INPUT");
  const [statusActive, setStatusActive] = useState(false);
  const [sessionTime, setSessionTime] = useState("00:00");
  const msgEndRef = useRef(null);
  const inputRef = useRef(null);
  const recogRef = useRef(null);
  const sessionStart = useRef(Date.now());
  const msgId = useRef(1);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = STYLES;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const iv = setInterval(() => {
      const s = Math.floor((Date.now() - sessionStart.current) / 1000);
      setSessionTime(`${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const addMsg = useCallback((role, text) => {
    const id = ++msgId.current;
    setMessages(prev => [...prev, { id, role, label: role === "user" ? "YOU" : "ASTRA", ts: timestamp(), text }]);
  }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0; u.pitch = 0.88; u.volume = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(x => x.name.includes("Google") && x.lang === "en-US") || voices.find(x => x.lang === "en-US");
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  }, []);

  const sendQuery = useCallback((query) => {
    if (!query.trim()) return;
    addMsg("user", query);
    setOrbState("thinking");
    setStatusText("ASTRA IS PROCESSING…");
    setStatusActive(true);
    const thinkId = ++msgId.current;
    setMessages(prev => [...prev, { id: thinkId, role: "astra", label: "ASTRA", ts: timestamp(), text: "···", thinking: true }]);
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== thinkId));
      const reply = LOCAL_REPLY(query);
      addMsg("astra", reply);
      speak(reply);
      setOrbState("idle");
      setStatusText("TAP ORB TO ACTIVATE VOICE INPUT");
      setStatusActive(false);
    }, 1100 + Math.random() * 700);
  }, [addMsg, speak]);

  const handleSend = useCallback(() => {
    const val = input.trim();
    if (!val) return;
    setInput("");
    sendQuery(val);
  }, [input, sendQuery]);

  const toggleListen = useCallback(() => {
    const hasSR = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    if (!hasSR) { setStatusText("VOICE NOT SUPPORTED IN THIS BROWSER"); return; }
    if (orbState === "listening") {
      recogRef.current?.stop();
      setOrbState("idle"); setWaveActive(false);
      setStatusText("TAP ORB TO ACTIVATE VOICE INPUT"); setStatusActive(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.continuous = false; r.interimResults = true; r.lang = "en-US";
    r.onstart = () => { setOrbState("listening"); setWaveActive(true); setStatusText("LISTENING…"); setStatusActive(true); };
    r.onresult = (e) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setInput(t);
    };
    r.onend = () => {
      setOrbState("idle"); setWaveActive(false);
      setStatusText("TAP ORB TO ACTIVATE VOICE INPUT"); setStatusActive(false);
      setInput(v => { if (v.trim()) { setTimeout(() => sendQuery(v), 80); return ""; } return v; });
    };
    r.onerror = () => { setOrbState("idle"); setWaveActive(false); setStatusText("VOICE ERROR — RETRY"); setStatusActive(false); };
    recogRef.current = r;
    r.start();
  }, [orbState, sendQuery]);

  return (
    <div className="astra-root">
      <HexCanvas />
      <div className="astra-scanlines" />
      <div className="astra-corner tl" /><div className="astra-corner tr" />
      <div className="astra-corner bl" /><div className="astra-corner br" />

      <div className="astra-hud">
        <div className="hud-item">SESSION<span className="hud-val">{sessionTime}</span></div>
        <div className="hud-item">MSGS<span className="hud-val">{messages.length - 1}</span></div>
        <div className="hud-item">MEMORY<span className="hud-val">ACTIVE</span></div>
      </div>

      <div className="astra-shell">
        <div className="astra-topbar">
          <div className="logo-block">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <polygon points="18,2 32,10 32,26 18,34 4,26 4,10" fill="rgba(0,229,255,0.07)" stroke="rgba(0,229,255,0.55)" strokeWidth="1"/>
              <polygon points="18,8 27,13 27,23 18,28 9,23 9,13" fill="rgba(0,229,255,0.03)" stroke="rgba(0,229,255,0.28)" strokeWidth="0.5"/>
              <circle cx="18" cy="18" r="4" fill="rgba(0,229,255,0.45)"/>
              <circle cx="18" cy="18" r="2" fill="#00e5ff"/>
            </svg>
            <div>
              <div className="logo-name">ASTRA</div>
              <div className="logo-sub">ADAPTIVE SPEECH &amp; THOUGHT RESPONSE ASSISTANT</div>
            </div>
          </div>
          <div className="status-block">
            <div className="status-pill"><div className="dot-green" /><span>ONLINE</span></div>
            <div className="status-pill">CORE:&nbsp;<span className="sys-val">GEMINI</span></div>
            <div className="status-pill">v<span className="sys-val">1.0.0</span></div>
          </div>
        </div>

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
                      <button key={i} className="cap-tag" onClick={() => { setInput(msg.tagQueries[i]); inputRef.current?.focus(); }}>
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

        <div className="voice-section">
          <div className={`orb-wrap ${orbState}`} onClick={toggleListen} role="button" aria-label="Toggle voice input">
            <div className="orb-ring3" /><div className="orb-ring2" /><div className="orb-ring1" />
            <div className="orb-core">
              <span className="orb-sym">{orbState === "listening" ? "◎" : "◉"}</span>
            </div>
          </div>
          <div className={`waveform${waveActive ? " active" : ""}`}>
            {[...Array(8)].map((_, i) => <div key={i} className="wbar" />)}
          </div>
          <div className={`astra-status-line${statusActive ? " active" : ""}`}>{statusText}</div>
        </div>

        <div className="input-row">
          <input
            ref={inputRef}
            className="astra-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Enter command or query…"
            autoComplete="off"
          />
          <button className="btn-send" onClick={handleSend}>SEND ›</button>
          <button className="btn-clear" onClick={() => setMessages([INIT_MSG])}>CLR</button>
        </div>
      </div>
    </div>
  );
}