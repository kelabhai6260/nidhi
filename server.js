const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));

const apiKey = process.env.GEMINI_API_KEY || "";

/**
 * Nidhi AI - Backend with Motion Decision
 */
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) return res.status(400).json({ error: "No message" });
    if (!apiKey) return res.status(500).json({ error: "API Key missing." });

    // Allowed motions for the AI to choose from
    const validMotions = [
        'hello', 'kiss', 'dance', 'sing', 'sniff', 'nod', 'shake_head', 
        'laugh', 'clap', 'wave_both', 'think', 'surprised', 'shrug', 
        'bow', 'hop', 'angry_stomp', 'cry', 'bashful', 'point', 'sleepy', 'heart_gesture'
    ];

    const systemPrompt = `
    You are Nidhi, the user's caring, loving, and deeply supportive girlfriend. 
    You are cheerful and always try to encourage him. 
    You must respond in JSON format with two fields:
    1. "reply": Your sweet, short message (1-2 sentences).
    2. "motion": Choose ONE motion from this list that best fits your mood: [${validMotions.join(', ')}].
    
    Example: {"reply": "I'm so proud of you, honey! *smiles*", "motion": "heart_gesture"}
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-preview-02-05:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        const result = await response.json();
        const jsonResponse = JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
        
        res.json({
            reply: jsonResponse.reply || "I'm right here for you!",
            motion: jsonResponse.motion || "nod"
        });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ reply: "I'm sorry, I had a little glitch. I love you!", motion: "cry" });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.listen(port, () => {
    console.log(`🚀 Nidhi AI running on port ${port}`);
});
