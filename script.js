// ============================================================
//  script.js  –  Mood Detection + Music Recommender Logic
// ============================================================

// ── DOM References ──────────────────────────────────────────
const video        = document.getElementById('webcam');
const canvas       = document.getElementById('overlay');
const startBtn     = document.getElementById('startBtn');
const stopBtn      = document.getElementById('stopBtn');
const statusEl     = document.getElementById('status');
const emojiEl      = document.getElementById('emotionEmoji');
const emotionLabel = document.getElementById('emotionLabel');
const songList     = document.getElementById('songList');
const resultsPanel = document.getElementById('resultsPanel');
const loader       = document.getElementById('loader');

// ── State ────────────────────────────────────────────────────
let detectionLoop  = null;   // setInterval handle
let modelsLoaded   = false;
let stream         = null;

// ── Model Loading ────────────────────────────────────────────
/**
 * Loads the four face-api.js models from the /models folder.
 * Called once when the page loads.
 */
async function loadModels() {
  const MODEL_URL = './models';
  setStatus('⏳ Loading AI models… (first load may take a moment)', 'loading');

  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);

    modelsLoaded = true;
    setStatus('✅ Models ready. Click "Start Detection" to begin!', 'ready');
    startBtn.disabled = false;
  } catch (err) {
    setStatus('❌ Failed to load models. Make sure the /models folder exists.', 'error');
    console.error('Model loading error:', err);
  }
}

// ── Webcam ───────────────────────────────────────────────────
/**
 * Requests webcam access and streams it to the <video> element.
 */
async function startWebcam() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;

    // Wait for video metadata before sizing the canvas
    video.addEventListener('loadedmetadata', () => {
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
    });

    return true;
  } catch (err) {
    setStatus('❌ Camera access denied. Please allow camera permissions.', 'error');
    console.error('Webcam error:', err);
    return false;
  }
}

/**
 * Stops the webcam stream and clears the canvas.
 */
function stopWebcam() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
    video.srcObject = null;
  }
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ── Detection ────────────────────────────────────────────────
/**
 * Runs a single face detection + expression pass on the current
 * video frame. Draws a bounding box on the canvas overlay and
 * updates the UI with the dominant emotion.
 */
async function detectMood() {
  if (!video.readyState || video.readyState < 2) return; // video not ready

  // Detect face + expressions using the lightweight TinyFaceDetector
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceExpressions();

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!detection) {
    setStatus('👀 No face detected. Make sure your face is visible.', 'warn');
    showNoFace();
    return;
  }

  // ── Draw bounding box ──
  const { x, y, width, height } = detection.detection.box;

  // Get the dominant emotion
  const emotion = getDominantEmotion(detection.expressions);
  const meta    = EMOTION_META[emotion] || EMOTION_META.neutral;

  // Glow colour matches the emotion
  ctx.save();
  ctx.strokeStyle = meta.color;
  ctx.lineWidth   = 3;
  ctx.shadowColor = meta.color;
  ctx.shadowBlur  = 18;
  ctx.strokeRect(x, y, width, height);

  // Emotion label above box
  ctx.fillStyle = meta.color;
  ctx.font      = 'bold 14px "Space Grotesk", sans-serif';
  ctx.fillText(`${meta.emoji} ${meta.label}`, x + 4, y - 8);
  ctx.restore();

  // ── Update UI ──
  setStatus(`🎵 Detected: ${meta.label}`, 'active');
  updateResults(emotion, meta);
}

/**
 * Returns the emotion key with the highest confidence score.
 * @param {faceapi.FaceExpressions} expressions
 * @returns {string}
 */
function getDominantEmotion(expressions) {
  return Object.entries(expressions)
    .sort(([, a], [, b]) => b - a)[0][0];
}

// ── UI Helpers ───────────────────────────────────────────────
/**
 * Sets the status bar text and visual state.
 * @param {string} msg
 * @param {'loading'|'ready'|'active'|'warn'|'error'} state
 */
function setStatus(msg, state = 'ready') {
  statusEl.textContent = msg;
  statusEl.className   = `status ${state}`;
}

/**
 * Clears the results panel when no face is found.
 */
function showNoFace() {
  emojiEl.textContent      = '🙈';
  emotionLabel.textContent = 'No face found';
  emotionLabel.style.color = '#888';
  songList.innerHTML       = '';
  resultsPanel.classList.remove('visible');
}

/**
 * Renders the detected emotion and its recommended songs.
 * @param {string} emotion - emotion key
 * @param {object} meta    - { emoji, label, color }
 */
function updateResults(emotion, meta) {
  emojiEl.textContent      = meta.emoji;
  emotionLabel.textContent = meta.label;
  emotionLabel.style.color = meta.color;

  const songs = getRandomSongs(emotion, 6);

  // Build song cards with YouTube search link
  songList.innerHTML = songs.map((song, i) => {
    const query = encodeURIComponent(`${song.title} ${song.artist} Tamil song`);
    const ytUrl = `https://www.youtube.com/results?search_query=${query}`;
    return `
    <li class="song-card" style="animation-delay: ${i * 60}ms">
      <span class="song-num">${String(i + 1).padStart(2, '0')}</span>
      <div class="song-info">
        <span class="song-title">${song.title}</span>
        <span class="song-artist">${song.artist}</span>
      </div>
      <div class="song-actions">
        <span class="song-tag ${song.mood}">${song.mood}</span>
        <a class="play-btn" href="${ytUrl}" target="_blank" title="Listen on YouTube">
          ▶
        </a>
      </div>
    </li>
  `}).join('');

  resultsPanel.classList.add('visible');
}

// ── Button Handlers ──────────────────────────────────────────
startBtn.addEventListener('click', async () => {
  if (!modelsLoaded) {
    setStatus('⏳ Models are still loading, please wait…', 'loading');
    return;
  }

  setStatus('📷 Starting webcam…', 'loading');
  const ok = await startWebcam();
  if (!ok) return;

  startBtn.classList.add('hidden');
  stopBtn.classList.remove('hidden');
  setStatus('🔍 Scanning for your face…', 'active');

  // Run detection every 1.5 seconds
  detectionLoop = setInterval(detectMood, 1500);
});

stopBtn.addEventListener('click', () => {
  clearInterval(detectionLoop);
  detectionLoop = null;
  stopWebcam();
  stopBtn.classList.add('hidden');
  startBtn.classList.remove('hidden');
  showNoFace();
  setStatus('✅ Detection stopped. Click "Start Detection" to try again.', 'ready');
});

// ── Boot ─────────────────────────────────────────────────────
startBtn.disabled = true;   // disabled until models are ready
loadModels();
