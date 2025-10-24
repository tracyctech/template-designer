const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// API: Generate PNG using Puppeteer (WORKS ON RENDER!)
app.post('/api/generate', async (req, res) => {
  try {
    const { 
      document = { background_color: '#f0f0f0' },
      elements = {}
    } = req.body;

    // Launch headless browser
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // CREATE HTML FROM YOUR TEMPLATE DATA
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            margin: 0; padding: 0; 
            width: 1200px; height: 628px; 
            background: ${document.background_color};
            font-family: Arial, sans-serif;
          }
          .name-text {
            position: absolute;
            left: ${elements.name_text?.x || 50}px;
            top: ${elements.name_text?.y || 100}px;
            width: ${elements.name_text?.width || 300}px;
            height: ${elements.name_text?.height || 50}px;
            font-size: ${elements.name_text?.font_size || 40}px;
            color: ${elements.name_text?.font_color || '#333333'};
            text-align: ${elements.name_text?.align || 'center'};
            line-height: ${elements.name_text?.height || 50}px;
            background: ${elements.name_text?.background_color || 'transparent'};
            padding: ${elements.name_text?.background_padding || 0}px;
            border-radius: ${elements.name_text?.background_round_corner || 0}px;
          }
          .content-text {
            position: absolute;
            left: ${elements.content_text?.x || 50}px;
            top: ${elements.content_text?.y || 200}px;
            width: ${elements.content_text?.width || 600}px;
            height: ${elements.content_text?.height || 200}px;
            font-size: ${elements.content_text?.font_size || 24}px;
            color: ${elements.content_text?.font_color || '#333333'};
            text-align: ${elements.content_text?.align || 'center'};
            line-height: ${elements.content_text?.height || 200}px;
          }
          .website-text {
            position: absolute;
            left: ${elements.website_text?.x || 50}px;
            top: ${elements.website_text?.y || 550}px;
            width: ${elements.website_text?.width || 250}px;
            height: ${elements.website_text?.height || 30}px;
            font-size: ${elements.website_text?.font_size || 18}px;
            color: ${elements.website_text?.font_color || '#666666'};
            text-align: ${elements.website_text?.align || 'center'};
            line-height: ${elements.website_text?.height || 30}px;
          }
        </style>
      </head>
      <body>
        <div class="name-text">${elements.name_text?.text || 'CANNON CORE'}</div>
        <div class="content-text">${elements.content_text?.text || 'Small business miss up to 62% of incoming calls'}</div>
        <div class="website-text">${elements.website_text?.text || 'cannoncore.com'}</div>
      </body>
      </html>
    `;

    // Load HTML and screenshot
    await page.setContent(html);
    const screenshot = await page.screenshot({ 
      type: 'png',
      fullPage: true 
    });

    await browser.close();

    // SEND PNG
    res.set('Content-Type', 'image/png');
    res.send(screenshot);

  } catch (error) {
    console.error('ERROR:', error);
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