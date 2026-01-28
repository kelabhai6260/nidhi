const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
// Render provides the PORT environment variable
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Serve all assets from the static folder
app.use(express.static(path.join(__dirname, 'static')));

// Inject API Key from Environment Variables
const apiKey = process.env.GEMINI_API_KEY || "";

/**
 * Chat API Endpoint using Gemini 1.5 Flash
 */
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) return res.status(400).json({ error: "No message" });
    if (!apiKey) return res.status(500).json({ error: "API Key missing in environment variables." });

    const systemPrompt = "You are Sonia, a friendly anime AI companion. You are cheerful and live in a cozy room. Keep responses very short (1-2 sentences). Use actions like *waves* or *nods* sparingly.";

    // Using Gemini 2.0 Flash Lite for best speed/cost ratio
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-preview-02-05:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] }
            })
        });

        const result = await response.json();
        const replyText = result.candidates?.[0]?.content?.parts?.[0]?.text || "I'm listening!";
        res.json({ reply: replyText });
    } catch (error) {
        res.status(500).json({ error: "Service unavailable" });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.listen(port, () => {
    console.log(`🚀 Sonia AI running on port ${port}`);
});
