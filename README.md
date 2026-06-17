# 🎵 MoodTunes — Camera-Based Mood Detection Music Recommender

> Point your camera at your face. The AI reads your emotion. You get a personalised playlist.

---

## 📁 Project Structure

```
mood-music-app/
├── index.html          ← Main page (open this in browser)
├── style.css           ← All visual styling
├── script.js           ← Webcam + emotion detection logic
├── songs.js            ← Emotion → song mapping data
├── download-models.sh  ← Helper script to fetch AI model files
└── models/             ← AI model files go here (see setup below)
```

---

## ⚡ Quick Start (5 minutes)

### Step 1 — Download the AI model files

The app uses **face-api.js** which needs 4 small model files stored in the `models/` folder.

**Option A — Shell script (Mac / Linux / Git Bash on Windows)**

```bash
chmod +x download-models.sh
./download-models.sh
```

**Option B — Download manually**

Download these 4 files and place them all inside the `models/` folder:

| File | URL |
|------|-----|
| `tiny_face_detector_model-weights_manifest.json` | https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json |
| `tiny_face_detector_model-shard1` | https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1 |
| `face_expression_model-weights_manifest.json` | https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json |
| `face_expression_model-shard1` | https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1 |

After this step your `models/` folder should contain exactly 4 files.

---

### Step 2 — Run a local server

> ⚠️ **Important:** Browsers block webcam access on plain `file://` paths.  
> You must run a local HTTP server. It's easy — pick one:

**Node.js (recommended)**
```bash
npx serve .
# Then open: http://localhost:3000
```

**Python 3**
```bash
python -m http.server 8080
# Then open: http://localhost:8080
```

**VS Code** — Install the *Live Server* extension, right-click `index.html` → **Open with Live Server**.

---

### Step 3 — Use the app

1. Open the local URL in Chrome, Edge, or Firefox
2. Wait for the status bar to say **"Models ready"** (≈ 3-5 seconds on first load)
3. Click **▶ Start Detection**
4. Allow camera access when prompted
5. Look at the camera — your emotion and a matching playlist appear on the right!

---

## 🎭 Emotions Detected

| Emotion | Emoji | Music Vibe |
|---------|-------|------------|
| Happy | 😄 | Upbeat pop bangers |
| Sad | 😢 | Calm, melancholic tracks |
| Angry | 😠 | Heavy, aggressive rock |
| Neutral | 😐 | Chill, lo-fi grooves |
| Surprised | 😲 | Electric 80s anthems |
| Fearful | 😨 | Haunting atmospheric |
| Disgusted | 🤢 | Dark alternative |

---

## 🛠️ Customising Songs

Open `songs.js` and edit the `SONG_MAP` object. Each emotion key holds an array of song objects:

```js
happy: [
  { title: "Your Favourite Song", artist: "Artist Name", mood: "upbeat" },
  // add more…
],
```

Available mood tags: `upbeat`, `melancholy`, `aggressive`, `chill`, `electric`, `haunting`, `dark`

---

## 🔧 Tech Stack

| Layer | Tool |
|-------|------|
| UI | HTML5 + CSS3 (no framework) |
| Logic | Vanilla JavaScript (ES2020) |
| Face detection | [face-api.js v0.22.2](https://github.com/justadudewhohacks/face-api.js) |
| Fonts | Google Fonts (Bebas Neue + Space Grotesk) |
| Server | Any local HTTP server |

---

## 🔐 Privacy

All processing happens **100% in your browser**. No video, images, or emotion data are ever sent to a server.

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| "Failed to load models" | Check the `models/` folder has all 4 files |
| "Camera access denied" | Allow camera in browser permissions |
| Blank page / CORS error | Use a local server, not `file://` |
| Detection is slow | Ensure good lighting; face the camera directly |
| No songs appear | Make sure `songs.js` loads before `script.js` (already set in HTML) |
