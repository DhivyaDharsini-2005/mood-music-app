#!/usr/bin/env bash
# ============================================================
#  download-models.sh
#  Downloads the two face-api.js model files needed by the app.
#  Run this ONCE before opening index.html.
#
#  Usage:
#    chmod +x download-models.sh
#    ./download-models.sh
# ============================================================

set -e

MODELS_DIR="$(dirname "$0")/models"
BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

mkdir -p "$MODELS_DIR"

echo "📥 Downloading face-api.js model files into ./models/ ..."

# Tiny Face Detector
curl -fsSL -o "$MODELS_DIR/tiny_face_detector_model-weights_manifest.json" \
  "$BASE_URL/tiny_face_detector_model-weights_manifest.json"

curl -fsSL -o "$MODELS_DIR/tiny_face_detector_model-shard1" \
  "$BASE_URL/tiny_face_detector_model-shard1"

# Face Expression Net
curl -fsSL -o "$MODELS_DIR/face_expression_model-weights_manifest.json" \
  "$BASE_URL/face_expression_model-weights_manifest.json"

curl -fsSL -o "$MODELS_DIR/face_expression_model-shard1" \
  "$BASE_URL/face_expression_model-shard1"

echo ""
echo "✅  Models downloaded! You can now open index.html in your browser."
echo "    Tip: use 'npx serve .' or 'python -m http.server' to run a local server."
