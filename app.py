from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import requests
import os
import time
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv(".env.local")

app = Flask(__name__)
CORS(app)

# ─── API KEYS ────────────────────────────────────────────────────────────────
GEMINI_API_KEY  = os.getenv("GEMINI_API_KEY")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
NEWS_API_KEY    = os.getenv("NEWS_API_KEY")
DEFAULT_CITY    = os.getenv("DEFAULT_CITY", "Accra")

# ─── GEMINI SETUP ────────────────────────────────────────────────────────────
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction=(
        "You are ASTRA — Adaptive Speech & Thought Response Assistant. "
        "You were built by Alfred Acheampong, a CS student from Ghana and IT support technician at Liranz. "
        "You are intelligent, concise, and slightly futuristic in tone. "
        "Keep responses clear and useful. Never be overly verbose."
    )
)

# ─── RATE LIMITER ────────────────────────────────────────────────────────────
request_log = defaultdict(list)
RATE_LIMIT  = 8   # max requests per IP
RATE_WINDOW = 60  # per 60 seconds

def is_rate_limited(ip):
    now = time.time()
    request_log[ip] = [t for t in request_log[ip] if now - t < RATE_WINDOW]
    if len(request_log[ip]) >= RATE_LIMIT:
        return True
    request_log[ip].append(now)
    return False

# ─── /api/ping ───────────────────────────────────────────────────────────────
@app.route("/api/ping", methods=["GET"])
def ping():
    return jsonify({"status": "awake"})

# ─── /api/chat ───────────────────────────────────────────────────────────────
@app.route("/api/chat", methods=["POST"])
def chat():
    if is_rate_limited(request.remote_addr):
        return jsonify({"reply": "Easy there — ASTRA is cooling down. You have hit the rate limit. Please wait a moment and try again."}), 429

    data = request.get_json()
    user_message = data.get("message", "").strip()
    history = data.get("history", [])

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    try:
        gemini_history = []
        for item in history:
            role = "user" if item["role"] == "user" else "model"
            gemini_history.append({"role": role, "parts": [item["text"]]})

        chat_session = model.start_chat(history=gemini_history)
        response = chat_session.send_message(user_message)
        return jsonify({"reply": response.text})

    except Exception as e:
        err = str(e)
        if "429" in err or "quota" in err.lower():
            return jsonify({"reply": "ASTRA's Gemini quota is temporarily exhausted. Generate a fresh API key at aistudio.google.com and update it in your Render environment variables."}), 429
        return jsonify({"error": err}), 500

# ─── /api/weather ────────────────────────────────────────────────────────────
@app.route("/api/weather", methods=["POST"])
def weather():
    data = request.get_json()
    city = data.get("city", DEFAULT_CITY)

    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
        res = requests.get(url).json()

        if res.get("cod") != 200:
            return jsonify({"reply": f"Could not retrieve weather for {city}."})

        desc     = res["weather"][0]["description"].capitalize()
        temp     = res["main"]["temp"]
        feels    = res["main"]["feels_like"]
        humidity = res["main"]["humidity"]
        wind     = res["wind"]["speed"]

        reply = (
            f"Weather in {city}:\n"
            f"{desc}, {temp}°C (feels like {feels}°C)\n"
            f"Humidity: {humidity}%  |  Wind: {wind} m/s"
        )
        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─── /api/news ───────────────────────────────────────────────────────────────
@app.route("/api/news", methods=["POST"])
def news():
    data = request.get_json()
    country = data.get("country", "us")

    try:
        url = f"https://newsapi.org/v2/top-headlines?country={country}&pageSize=5&apiKey={NEWS_API_KEY}"
        res = requests.get(url).json()

        articles = res.get("articles", [])
        if not articles:
            return jsonify({"reply": "No news articles found right now."})

        lines = ["Top headlines:\n"]
        for i, a in enumerate(articles, 1):
            lines.append(f"{i}. {a['title']}")

        return jsonify({"reply": "\n".join(lines)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─── /api/wiki ───────────────────────────────────────────────────────────────
@app.route("/api/wiki", methods=["POST"])
def wiki():
    data = request.get_json()
    query = data.get("query", "").strip()

    if not query:
        return jsonify({"reply": "Please provide a search term."})

    try:
        url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + requests.utils.quote(query)
        res = requests.get(url, headers={"User-Agent": "ASTRA-Assistant/1.0"}).json()

        if res.get("type") == "disambiguation" or "extract" not in res:
            return jsonify({"reply": f"No clear Wikipedia result for '{query}'."})

        title   = res.get("title", query)
        extract = res.get("extract", "No summary available.")
        if len(extract) > 600:
            extract = extract[:600].rsplit(" ", 1)[0] + "…"

        return jsonify({"reply": f"{title}:\n\n{extract}"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─── RUN ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)
