const express = require('express');
const router = express.Router();
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

router.post('/decode-handwriting', async (req, res) => {
    try {
        const { image } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return res.status(401).json({ error: 'API Key missing in .env' });
        if (!image) return res.status(400).json({ error: 'No image provided' });

        // Extract base64 and determine mime type
        const base64Data = image.split(",")[1] || image;
        const mimeType = image.includes("png") ? "image/png" : "image/jpeg";

        // Direct REST API Call using Axios targeting gemini-flash-latest which is available for this key
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [
                    { text: "Act as a medical expert. Return ONLY JSON format with no markdown: {\"patient_info\": \"...\", \"diagnosis\": \"...\", \"medicines\": [{\"name\":\"...\",\"dosage\":\"...\",\"duration\":\"...\",\"instructions\":\"...\"}], \"additional_notes\": \"...\"}" },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Data
                        }
                    }
                ]
            }]
        };

        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        // Extracting text from standard Gemini REST API response
        const responseText = response.data.candidates[0].content.parts[0].text;
        
        // Clean JSON
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        const parsedData = JSON.parse(cleanJson);

        res.json(parsedData);

    } catch (error) {
        console.error('Direct API Error:', error.response?.data || error.message);
        
        // Send a readable error back to the frontend
        const errMsg = error.response?.data?.error?.message || error.message;
        res.status(500).json({ error: 'Direct API Failed: ' + errMsg });
    }
});

module.exports = router;
