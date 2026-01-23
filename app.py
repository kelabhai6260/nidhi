import os
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='static')
CORS(app)

# 1. Setup Gemini
API_KEY = os.getenv("GEMINI_API_KEY")

chat_session = None

if API_KEY:
    try:
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Nidhi's System Instruction
        # Optimized for VOICE conversation (short, conversational)
        chat_session = model.start_chat(history=[
            {
                "role": "user", 
                "parts": "You are Nidhi, a friendly, cute anime AI companion. We are having a voice conversation. You are helpful, cheerful, and speak in a casual, warm way. Keep your answers short (1-2 sentences maximum) so the conversation flows naturally."
            },
            {
                "role": "model", 
                "parts": "Got it! I'm listening. What's up?"
            }
        ])
        logger.info("Gemini AI successfully configured.")
    except Exception as e:
        logger.error(f"Failed to configure Gemini AI: {e}")
else:
    logger.warning("GEMINI_API_KEY not found in environment variables. Chat will not function.")

@app.route('/')
def home():
    """Serve the main page."""
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    """Serve static files (Live2D models, textures, etc.)"""
    return send_from_directory('static', path)

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    """Handle chat messages from the frontend."""
    global chat_session
    
    if not API_KEY or not chat_session:
        return jsonify({"reply": "Error: My brain is missing! (API Key not set correctly)"}), 500
        
    data = request.json
    user_message = data.get("message", "")
    
    if not user_message:
        return jsonify({"reply": "I didn't hear anything!"}), 400
    
    try:
        # Send message to Gemini
        response = chat_session.send_message(user_message)
        bot_reply = response.text
        return jsonify({"reply": bot_reply})
        
    except Exception as e:
        logger.error(f"Error during chat generation: {e}")
        return jsonify({"reply": "Sorry, I had a little glitch. Can you say that again?"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check for Render."""
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    # Render provides the PORT environment variable
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
