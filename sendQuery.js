// ─────────────────────────────────────────────────────────────
// Replace the sendQuery function inside Astra.jsx with this one.
// It wires every feature to your Flask backend.
// ─────────────────────────────────────────────────────────────

const sendQuery = useCallback(async (query) => {
  if (!query.trim()) return;
  addMsg("user", query);
  setOrbState("thinking");
  setStatusText("ASTRA IS PROCESSING…");
  setStatusActive(true);

  const thinkId = ++msgId.current;
  setMessages(prev => [...prev, { id: thinkId, role: "astra", label: "ASTRA", ts: timestamp(), text: "···", thinking: true }]);

  try {
    const lq = query.toLowerCase();
    let endpoint = "/api/chat";
    let body = { message: query, history: conversationHistory.current };

    // Route to the right endpoint based on keywords
    if (lq.includes("weather")) {
      endpoint = "/api/weather";
      const city = lq.replace(/weather|in|for|today|now/g, "").trim() || "Accra";
      body = { city };
    } else if (lq.includes("news") || lq.includes("headlines")) {
      endpoint = "/api/news";
      body = { country: "us" };
    } else if (lq.includes("wikipedia") || lq.includes("search wiki") || lq.includes("who is") || lq.includes("what is")) {
      const searchTerm = query.replace(/wikipedia|search|wiki|who is|what is/gi, "").trim();
      endpoint = "/api/wiki";
      body = { query: searchTerm };
    }

    const res = await fetch(`http://localhost:5000${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    const reply = data.reply || data.error || "No response from ASTRA.";

    // Update conversation history for session memory
    conversationHistory.current.push({ role: "user", text: query });
    conversationHistory.current.push({ role: "astra", text: reply });

    setMessages(prev => prev.filter(m => m.id !== thinkId));
    addMsg("astra", reply);
    speak(reply);

  } catch (err) {
    setMessages(prev => prev.filter(m => m.id !== thinkId));
    addMsg("astra", "Connection error — make sure your Flask backend is running on port 5000.");
  }

  setOrbState("idle");
  setStatusText("TAP ORB TO ACTIVATE VOICE INPUT");
  setStatusActive(false);

}, [addMsg, speak]);

// Also add this ref inside your Astra() component (next to the other useRefs):
// const conversationHistory = useRef([]);
