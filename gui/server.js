const express = require('express');
const { createCanvas } = require('canvas');
const path = require('path');
const fs = require('fs-extra');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// API: Generate PNG for Make.com
app.post('/api/generate', async (req, res) => {
  try {
    const { text, bgColor = '#ffffff', corner = 20, padding = 0 } = req.body;
    
    // Create 1200x628 social media canvas
    const canvas = createCanvas(1200, 628);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 1200, 628);
    
    // Text (centered)
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 600, 314);
    
    // PNG Buffer
    const buffer = canvas.toBuffer('image/png');
    res.set('Content-Type', 'image/png');
    res.send(buffer);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve your app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Template Designer API LIVE: http://localhost:${port}`);
});