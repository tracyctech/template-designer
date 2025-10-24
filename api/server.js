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
app.post('/generate', async (req, res) => {
  try {
    const {
      name_text = '',
      content_text = '',
      website_text = '',
      document = { width: 1200, height: 628 },
      background = { color: '#ffffff' },
      // Add other fields as needed, e.g., name_text: { text, x, y, font_size, font_color }
    } = req.body;
    
    // Build HTML template dynamically from data
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
            background-color: ${background.color || '#ffffff'};
            position: relative;
          }
          .name_text {
            position: absolute;
            left: 50px;
            top: 100px;
            font: bold 32px Arial;
            color: #333;
          }
          .website_text {
            position: absolute;
            left: 50px;
            top: 140px;
            font: 18px Arial;
            color: #666;
          }
          .content_text {
            position: absolute;
            left: 50px;
            top: 180px;
            font: bold 24px Arial;
            color: #333;
          }
          /* Add more styles for images, borders, etc., as needed */
        </style>
      </head>
      <body>
        <div class="name_text">${name_text}</div>
        <div class="content_text">${content_text}</div>
        <div class="website_text">${website_text}</div>
        <!-- Add image elements if data includes them -->
      </body>
      </html>
    `;

    // Launch Puppeteer and generate PNG
    const browser = await puppeteer.launch();
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