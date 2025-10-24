const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/images', express.static('images'));

if (!fs.existsSync('images')) fs.mkdirSync('images');

// ALL YOUR FIELDS SUPPORTED
app.post('/generate', async (req, res) => {  // Ensure route matches /generate
  try {
    const { document = {}, elements = {} } = req.body;
    const { name_text = {}, content_text = {}, website_text = {} } = elements;
    
    // Build HTML template dynamically
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            width: ${document.width || 1200}px;
            height: ${document.height || 628}px;
            margin: 0;
            padding: 0;
            background-color: ${document.background_color || '#ffffff'};
            position: relative;
          }
          .name_text {
            position: absolute;
            left: ${name_text.x || 50}px;
            top: ${name_text.y || 100}px;
            width: ${name_text.width || 200}px;
            height: ${name_text.height || 50}px;
            font: bold ${name_text.font_size || 32}px Arial;
            color: ${name_text.font_color || '#333'};
            text-align: ${name_text.align?.toLowerCase() || 'left'};
          }
          .content_text {
            position: absolute;
            left: ${content_text.x || 50}px;
            top: ${content_text.y || 180}px;
            width: ${content_text.width || 600}px;
            height: ${content_text.height || 200}px;
            font: ${content_text.font_size || 24}px Arial;
            color: ${content_text.font_color || '#333'};
          }
          .website_text {
            position: absolute;
            left: ${website_text.x || 50}px;
            top: ${website_text.y || 140}px;
            width: ${website_text.width || 250}px;
            height: ${website_text.height || 30}px;
            font: ${website_text.font_size || 18}px Arial;
            color: ${website_text.font_color || '#666'};
          }
        </style>
      </head>
      <body>
        <div class="name_text">${name_text.text || ''}</div>
        <div class="content_text">${content_text.text || ''}</div>
        <div class="website_text">${website_text.text || ''}</div>
      </body>
      </html>
    `;

    // Launch Puppeteer with Render-compatible args
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    await page.setContent(html);
    await page.setViewport({ width: document.width || 1200, height: document.height || 628 });
    const screenshot = await page.screenshot({ type: 'png' });
    await browser.close();

    // Send PNG buffer directly
    res.setHeader('Content-Type', 'image/png');
    res.send(screenshot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('🚀 FULL API: http://localhost:3000'));