<!DOCTYPE html>
<html>
<head>
  <title>Template Designer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; height: 100vh; }
    
    .toolbar {
      background: #2d2d30 !important;
      color: white !important;
      padding: 10px 20px !important;
      display: flex !important;
      gap: 10px !important;
      align-items: center !important;
      height: 50px !important;
    }
    
    .toolbar button {
      background: #0078d4 !important;
      color: white !important;
      border: none !important;
      padding: 8px 16px !important;
      border-radius: 4px !important;
      cursor: pointer !important;
    }
    
    .toolbar button:hover { background: #106ebe !important; }
    
    .main {
      display: flex !important;
      height: calc(100vh - 50px) !important;
    }
    
    .canvas-panel {
      flex: 1 !important;
      position: relative !important;
      background: #f0f0f0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    
    #canvas {
      width: 1200px !important;
      height: 628px !important;
      background: white !important;
      border: 2px solid #ccc !important;
      cursor: crosshair !important;
    }
    
    .add-panel {
      position: absolute !important;
      top: 10px !important;
      left: 10px !important;
      background: white !important;
      padding: 10px !important;
      border-radius: 4px !important;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
      z-index: 10 !important;
    }
    
    .add-btn {
      display: block !important;
      width: 80px !important;
      margin: 5px 0 !important;
      padding: 8px !important;
      background: #28a745 !important;
      color: white !important;
      border: none !important;
      border-radius: 4px !important;
      cursor: pointer !important;
    }
    
    .properties {
      width: 350px !important;
      background: #f9f9f9 !important;
      overflow-y: auto !important;
      border-left: 2px solid #ddd !important;
    }
    
    #status {
      padding: 10px !important;
      background: #e3f2fd !important;
      font-weight: bold !important;
      text-align: center !important;
      color: #1976d2 !important;
    }
    
    .prop-section { padding: 15px !important; }
    .prop-group { margin: 12px 0 !important; }
    .prop-group label { 
      display: block !important;
      margin-bottom: 5px !important;
      font-weight: 500 !important;
      font-size: 14px !important;
    }
    input, select, textarea { 
      width: 100% !important;
      padding: 6px !important;
      border: 1px solid #ddd !important;
      border-radius: 3px !important;
      font-size: 14px !important;
    }
    input[type="color"] { height: 35px !important; padding: 2px !important; }
    textarea { resize: vertical !important; min-height: 60px !important; }
  </style>
</head>
<body>
  <div class="toolbar">
    <button onclick="newTemplate()">New</button>
    <button onclick="openTemplate()">Open</button>
    <button onclick="saveTemplate()">Save</button>
    <span style="margin-left: auto;"></span>
    <button class="add-btn" onclick="addElement('name_text')">Name</button>
    <button class="add-btn" onclick="addElement('content_text')">Content</button>
    <button class="add-btn" onclick="addElement('website_text')">Website</button>
    <button class="add-btn" onclick="addElement('content_image')">Image</button>
    <button class="add-btn" onclick="addElement('logo_image')">Logo</button>
  </div>
  
  <div class="main">
    <div class="canvas-panel">
      <div class="add-panel">
        <button class="add-btn" onclick="addElement('name_text')">Name</button>
        <button class="add-btn" onclick="addElement('content_text')">Content</button>
        <button class="add-btn" onclick="addElement('website_text')">Website</button>
        <button class="add-btn" onclick="addElement('content_image')">Image</button>
        <button class="add-btn" onclick="addElement('logo_image')">Logo</button>
      </div>
      <canvas id="canvas" width="1200" height="628"></canvas>
    </div>
    
    <div class="properties">
      <div id="status">Click "Add" buttons to start designing!</div>
      <div id="properties"></div>
    </div>
  </div>

  <script src="renderer.js"></script>
</body>
</html>