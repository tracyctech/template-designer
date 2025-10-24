var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var template = {
  document: { 
    width: 1200, 
    height: 628, 
    background_color: '#ffffff',
    background_image: ''
  },
  elements: {}
};

var selectedElement = null;
var elements = [];
var imageCache = {};
var isDragging = false;
var isResizing = false;
var dragOffset = {x:0,y:0};
var resizeHandle = null;

function addElement(type) {
  var id = type;
  var defaults = {
    name_text: { 
      type: 'text', 
      text: 'Your Name', 
      x: 50, y: 100, width: 300, height: 50, 
      font_size: 40, font: 'Arial', font_color: '#333333', align: 'center',
      background_color: 'rgba(255,255,255,0)', background_padding: 0, background_round_corner: 0, rotation: 0,
      stroke_width: 2, stroke_color: '#0078d4'
    },
    content_text: { 
      type: 'text', 
      text: 'Your content goes here...', 
      x: 50, y: 200, width: 600, height: 200, 
      font_size: 24, font: 'Arial', font_color: '#333333', align: 'center',
      background_color: 'rgba(255,255,255,0)', background_padding: 0, background_round_corner: 0, rotation: 0,
      stroke_width: 2, stroke_color: '#0078d4'
    },
    website_text: { 
      type: 'text', 
      text: 'yourwebsite.com', 
      x: 50, y: 550, width: 250, height: 30, 
      font_size: 18, font: 'Arial', font_color: '#666666', align: 'center',
      background_color: 'rgba(255,255,255,0)', background_padding: 0, background_round_corner: 0, rotation: 0,
      stroke_width: 1, stroke_color: '#0078d4'
    },
    content_image: { 
      type: 'image', 
      source: '', 
      x: 50, y: 50, width: 500, height: 400, 
      stroke_width: 2, stroke_color: '#0078d4',
      background_padding: 0, background_round_corner: 0
    },
    logo_image: { 
      type: 'image', 
      source: '', 
      x: 1000, y: 50, width: 150, height: 50, 
      stroke_width: 1, stroke_color: '#0078d4',
      background_padding: 0, background_round_corner: 0
    }
  };
  
  if (!template.elements[id]) {
    template.elements[id] = defaults[type];
    elements.push({ id: id, x: defaults[type].x, y: defaults[type].y, width: defaults[type].width, height: defaults[type].height });
    selectedElement = id;
    updateProperties();
    updateElementList();
    render();
    document.getElementById('status').textContent = 'Added: ' + type;
  }
}

function moveElementUp() {
  if (!selectedElement) return;
  var index = elements.findIndex(e => e.id === selectedElement);
  if (index > 0) {
    [elements[index], elements[index - 1]] = [elements[index - 1], elements[index]];
    updateElementList();
    render();
  }
}

function moveElementDown() {
  if (!selectedElement) return;
  var index = elements.findIndex(e => e.id === selectedElement);
  if (index < elements.length - 1) {
    [elements[index], elements[index + 1]] = [elements[index + 1], elements[index]];
    updateElementList();
    render();
  }
}

function showDocumentProperties() {
  selectedElement = null;
  updateProperties();
  render();
}

function updateElementList() {
  var listHtml = '<div class="prop-section"><h3>Layers</h3>';
  
  listHtml += `<div style="display:flex;align-items:center;padding:8px;cursor:pointer;border-bottom:1px solid #eee;background:#f0f8ff" onclick="showDocumentProperties()">
    <span style="flex:1">🏠 Background</span>
  </div>`;
  
  for (var i = elements.length - 1; i >= 0; i--) {
    var el = elements[i];
    var isSelected = selectedElement === el.id ? 'style="background:#e3f2fd"' : '';
    listHtml += `<div style="display:flex;align-items:center;padding:8px;cursor:pointer;border-bottom:1px solid #eee" ${isSelected} onclick="selectElement('${el.id}')">
      <span style="flex:1">${el.id}</span>
      <button onclick="moveElementUp();event.stopPropagation()" style="padding:2px 6px;margin:0 2px;background:#4CAF50;color:white;border:none;border-radius:2px;font-size:12px">+</button>
      <button onclick="moveElementDown();event.stopPropagation()" style="padding:2px 6px;margin:0 2px;background:#f44336;color:white;border:none;border-radius:2px;font-size:12px">-</button>
    </div>`;
  }
  
  listHtml += '</div>';
  document.getElementById('elementList').innerHTML = listHtml;
}

function selectElement(id) {
  selectedElement = id;
  updateProperties();
  updateElementList();
  render();
}

function getImage(src, callback) {
  if (imageCache[src]) {
    callback(imageCache[src]);
    return;
  }
  var img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function() {
    imageCache[src] = img;
    callback(img);
    render();
  };
  img.onerror = function() {
    imageCache[src] = null;
    callback(null);
    render();
  };
  img.src = src;
}

function render() {
  canvas.style.width = template.document.width + 'px';
  canvas.style.height = template.document.height + 'px';
  canvas.width = template.document.width;
  canvas.height = template.document.height;
  
  ctx.clearRect(0, 0, template.document.width, template.document.height);
  
  // BACKGROUND
  ctx.fillStyle = template.document.background_color;
  ctx.fillRect(0, 0, template.document.width, template.document.height);
  
  // ELEMENTS
  for (var i = elements.length - 1; i >= 0; i--) {
    var el = elements[i];
    var data = template.elements[el.id];
    
    ctx.save();
    ctx.translate(el.x + el.width/2, el.y + el.height/2);
    ctx.rotate(data.rotation * Math.PI / 180);
    ctx.translate(-el.width/2, -el.height/2);
    
    var stroke = data.stroke_width || 0;
    var pad = data.background_padding || 0;
    var corner = data.background_round_corner || 0;
    
    // 1. BORDER (OUTERMOST)
    if (stroke > 0) {
      ctx.strokeStyle = data.stroke_color;
      ctx.lineWidth = stroke;
      ctx.beginPath();
      ctx.roundRect(0, 0, el.width, el.height, corner);
      ctx.stroke();
    }
    
    // 2. BACKGROUND (BETWEEN BORDER + CONTENT)
    if (data.background_color && data.background_color !== 'rgba(255,255,255,0)') {
      ctx.fillStyle = data.background_color;
      ctx.beginPath();
      ctx.roundRect(stroke/2, stroke/2, el.width - stroke, el.height - stroke, corner);
      ctx.fill();
    }
    
    // 3. CONTENT AREA
    var contentX = pad;
    var contentY = pad;
    var contentW = el.width - 2 * pad;
    var contentH = el.height - 2 * pad;
    
    if (data.type === 'text') {
      ctx.font = `${data.font_size}px ${data.font}`;
      ctx.fillStyle = data.font_color;
      ctx.textBaseline = 'top';
      
      // TEXT ALIGNMENT + VERTICAL CENTER
      var lines = [];
      var words = data.text.split(' ');
      var currentLine = words[0];
      
      for (var n = 1; n < words.length; n++) {
        var testLine = currentLine + ' ' + words[n];
        var metrics = ctx.measureText(testLine);
        if (metrics.width > contentW && n > 0) {
          lines.push(currentLine);
          currentLine = words[n];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);
      
      var totalTextHeight = lines.length * data.font_size * 1.2;
      var startY = contentY + (contentH - totalTextHeight) / 2;
      
      ctx.textAlign = data.align;
      var textX = data.align === 'left' ? contentX : 
                  data.align === 'right' ? el.width - pad : 
                  el.width / 2;
      
      lines.forEach(function(line, index) {
        ctx.fillText(line, textX, startY + (index * data.font_size * 1.2));
      });
      
    } else if (data.type === 'image') {
      if (data.source && imageCache[data.source]) {
        // PERFECT CLIP - SCALE RADIUS BY PADDING
        ctx.save();
        ctx.beginPath();
        
        // CALCULATE SCALED RADIUS FOR CONTENT AREA
        var scaleFactor = Math.min((el.width - 2*pad) / el.width, (el.height - 2*pad) / el.height);
        var clipRadius = corner * scaleFactor;
        clipRadius = Math.min(clipRadius, contentW/2, contentH/2);
        
        ctx.roundRect(contentX, contentY, contentW, contentH, clipRadius);
        ctx.clip();
        ctx.drawImage(imageCache[data.source], contentX, contentY, contentW, contentH);
        ctx.restore();
      } else if (data.source) {
        ctx.fillStyle = '#eee';
        ctx.beginPath();
        ctx.roundRect(contentX, contentY, contentW, contentH, corner);
        ctx.fill();
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Loading...', el.width/2, el.height/2);
      } else {
        ctx.fillStyle = '#eee';
        ctx.beginPath();
        ctx.roundRect(contentX, contentY, contentW, contentH, corner);
        ctx.fill();
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Add URL', el.width/2, el.height/2);
      }
    }
    
    ctx.restore();
  }
  
  // SELECTION + HANDLES
  if (selectedElement) {
    var el = elements.find(e => e.id === selectedElement);
    if (el) {
      ctx.save();
      ctx.translate(el.x + el.width/2, el.y + el.height/2);
      ctx.rotate(template.elements[selectedElement].rotation * Math.PI / 180);
      ctx.translate(-el.width/2, -el.height/2);
      
      ctx.strokeStyle = '#0078d4';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(0, 0, el.width, el.height);
      ctx.setLineDash([]);
      
      // HANDLES
      ctx.fillStyle = '#0078d4';
      var hs = 10, off = 5;
      ctx.fillRect(-off, -off, hs, hs);
      ctx.fillRect(el.width-hs+off, -off, hs, hs);
      ctx.fillRect(-off, el.height-hs+off, hs, hs);
      ctx.fillRect(el.width-hs+off, el.height-hs+off, hs, hs);
      ctx.fillRect(el.width/2-hs/2, -off, hs, hs);
      ctx.fillRect(el.width/2-hs/2, el.height-hs+off, hs, hs);
      ctx.fillRect(-off, el.height/2-hs/2, hs, hs);
      ctx.fillRect(el.width-hs+off, el.height/2-hs/2, hs, hs);
      
      ctx.restore();
    }
  }
}

CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);                    // Start top-left (WORKS!)
  this.lineTo(x + w - r, y);                // Top edge (SHRUNK by 2*r)
  this.arcTo(x + w, y, x + w, y + r, r);    // Top-right
  this.lineTo(x + w, y + h - r);            // Right edge (SHRUNK by 2*r)
  this.arcTo(x + w, y + h, x + w - r, y + h, r);  // Bottom-right
  this.lineTo(x + r, y + h);                // Bottom edge (SHRUNK by 2*r)
  this.arcTo(x, y + h, x, y + h - r, r);    // Bottom-left
  this.lineTo(x, y + r);                    // Left edge (SHRUNK by 2*r)
  this.arcTo(x, y, x + r, y, r);            // Top-left (closes)
  this.closePath();
  return this;
};

// COLOR FUNCTIONS (UNCHANGED)
function createColorInput(prop, value, callback) {
  var hex = '#333333';
  var alpha = 100;
  
  if (value.startsWith('#')) {
    hex = value;
  } else if (value.startsWith('rgba')) {
    var match = value.match(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/);
    if (match) {
      hex = '#' + 
        ('00' + parseInt(match[1]).toString(16)).slice(-2) +
        ('00' + parseInt(match[2]).toString(16)).slice(-2) +
        ('00' + parseInt(match[3]).toString(16)).slice(-2);
      alpha = parseFloat(match[4]) * 100;
    }
  }
  
  return `
    <div style="display:flex;align-items:center">
      <input type="color" value="${hex}" oninput="setColor('${prop}', this.value)" style="width:40px">
      <label style="margin:0 5px;font-size:12px">α</label>
      <input type="range" min="0" max="100" value="${alpha}" oninput="setAlpha('${prop}', this.value)" style="width:80px">
      <span style="margin-left:5px;font-size:12px">${Math.round(alpha)}%</span>
      <button onclick="clearColor('${prop}')" style="margin-left:5px;background:#f44336;color:white;border:none;border-radius:2px;padding:2px 6px">X</button>
    </div>
  `;
}

function setColor(prop, hex) {
  var alpha = 1.0;
  if (selectedElement) {
    var current = template.elements[selectedElement][prop];
    var match = current.match(/rgba.*,([\d.]+)\)/);
    if (match) alpha = parseFloat(match[1]);
  } else if (prop === 'background_color') {
    var current = template.document[prop];
    var match = current.match(/rgba.*,([\d.]+)\)/);
    if (match) alpha = parseFloat(match[1]);
  }
  
  var r = parseInt(hex.substr(1,2), 16);
  var g = parseInt(hex.substr(3,2), 16);
  var b = parseInt(hex.substr(5,2), 16);
  var rgba = `rgba(${r},${g},${b},${alpha})`;
  
  if (selectedElement) {
    template.elements[selectedElement][prop] = rgba;
  } else {
    template.document[prop] = rgba;
  }
  render();
}

function setAlpha(prop, alphaValue) {
  var alpha = alphaValue / 100;
  var hex = '#333333';
  
  if (selectedElement) {
    var current = template.elements[selectedElement][prop];
    if (current.startsWith('#')) hex = current;
    else {
      var match = current.match(/rgba\((\d+),(\d+),(\d+),/);
      if (match) {
        hex = '#' + 
          ('00' + parseInt(match[1]).toString(16)).slice(-2) +
          ('00' + parseInt(match[2]).toString(16)).slice(-2) +
          ('00' + parseInt(match[3]).toString(16)).slice(-2);
      }
    }
  } else if (prop === 'background_color') {
    var current = template.document[prop];
    if (current.startsWith('#')) hex = current;
    else {
      var match = current.match(/rgba\((\d+),(\d+),(\d+),/);
      if (match) {
        hex = '#' + 
          ('00' + parseInt(match[1]).toString(16)).slice(-2) +
          ('00' + parseInt(match[2]).toString(16)).slice(-2) +
          ('00' + parseInt(match[3]).toString(16)).slice(-2);
      }
    }
  }
  
  var r = parseInt(hex.substr(1,2), 16);
  var g = parseInt(hex.substr(3,2), 16);
  var b = parseInt(hex.substr(5,2), 16);
  var rgba = `rgba(${r},${g},${b},${alpha})`;
  
  if (selectedElement) {
    template.elements[selectedElement][prop] = rgba;
  } else {
    template.document[prop] = rgba;
  }
  render();
}

function clearColor(prop) {
  var defaultColor = prop === 'background_color' ? 'rgba(255,255,255,0)' : '#000000';
  if (selectedElement) {
    template.elements[selectedElement][prop] = defaultColor;
  } else {
    template.document[prop] = defaultColor;
  }
  updateProperties();
  render();
}

function updateProperties() {
  var props = document.getElementById('properties');
  var listHtml = '<div id="elementList"></div>';
  
  if (!selectedElement) {
    props.innerHTML = listHtml + `
      <div class="prop-section">
        <h3>📄 Document</h3>
        <div class="prop-group"><label>Width:</label><input type="number" value="${template.document.width}" onchange="updateDoc('width',this.value)" style="width:80px"></div>
        <div class="prop-group"><label>Height:</label><input type="number" value="${template.document.height}" onchange="updateDoc('height',this.value)" style="width:80px"></div>
        <div class="prop-group"><label>Background:</label>${createColorInput('background_color', template.document.background_color, 'updateDoc')}</div>
      </div>
    `;
    updateElementList();
    return;
  }
  
  var el = template.elements[selectedElement];
  var html = listHtml + `<div class="prop-section"><h3>${selectedElement}</h3>`;
  
  html += `<div class="prop-group"><label>X:</label><input type="number" value="${Math.round(el.x)}" onchange="updateProp('x',this.value)" style="width:80px"></div>`;
  html += `<div class="prop-group"><label>Y:</label><input type="number" value="${Math.round(el.y)}" onchange="updateProp('y',this.value)" style="width:80px"></div>`;
  html += `<div class="prop-group"><label>Width:</label><input type="number" value="${Math.round(el.width)}" onchange="updateProp('width',this.value)" style="width:80px"></div>`;
  html += `<div class="prop-group"><label>Height:</label><input type="number" value="${Math.round(el.height)}" onchange="updateProp('height',this.value)" style="width:80px"></div>`;
  
  if (el.type === 'text') {
    html += `<div class="prop-group"><label>Text:</label><textarea onchange="updateProp('text',this.value)">${el.text}</textarea></div>`;
    html += `<div class="prop-group"><label>Font:</label><select onchange="updateProp('font',this.value)"><option ${el.font === 'Arial' ? 'selected' : ''}>Arial</option><option ${el.font === 'Helvetica' ? 'selected' : ''}>Helvetica</option><option ${el.font === 'Times New Roman' ? 'selected' : ''}>Times New Roman</option><option ${el.font === 'Georgia' ? 'selected' : ''}>Georgia</option><option ${el.font === 'Verdana' ? 'selected' : ''}>Verdana</option></select></div>`;
    html += `<div class="prop-group"><label>Size:</label><input type="number" value="${el.font_size}" onchange="updateProp('font_size',this.value)" style="width:80px"></div>`;
    html += `<div class="prop-group"><label>Color:</label>${createColorInput('font_color', el.font_color, 'updateProp')}</div>`;
    html += `<div class="prop-group"><label>Align:</label><select onchange="updateProp('align',this.value)"><option value="left" ${el.align === 'left' ? 'selected' : ''}>Left</option><option value="center" ${el.align === 'center' ? 'selected' : ''}>Center</option><option value="right" ${el.align === 'right' ? 'selected' : ''}>Right</option></select></div>`;
    html += `<div class="prop-group"><label>BG Color:</label>${createColorInput('background_color', el.background_color, 'updateProp')}</div>`;
    html += `<div class="prop-group"><label>Padding:</label><input type="number" value="${el.background_padding}" onchange="updateProp('background_padding',this.value)" style="width:80px"></div>`;
    html += `<div class="prop-group"><label>Corner:</label><input type="number" value="${el.background_round_corner}" onchange="updateProp('background_round_corner',this.value)" style="width:80px"></div>`;
    html += `<div class="prop-group"><label>Border:</label><input type="number" value="${el.stroke_width}" onchange="updateProp('stroke_width',this.value)" style="width:80px"></div>`;
    html += `<div class="prop-group"><label>Border Color:</label>${createColorInput('stroke_color', el.stroke_color, 'updateProp')}</div>`;
    html += `<div class="prop-group"><label>Rotation:</label><input type="number" value="${el.rotation}" onchange="updateProp('rotation',this.value)" style="width:80px">°</div>`;
    
  } else if (el.type === 'image') {
    html += `<div class="prop-group"><label>URL:</label><input type="text" value="${el.source}" onchange="updateProp('source',this.value);getImage(this.value, function(){});" placeholder="https://...jpg/png"></div>`;
    html += `<div class="prop-group"><label>Padding:</label><input type="number" value="${el.background_padding}" onchange="updateProp('background_padding',this.value)" style="width:80px"></div>`;
    html += `<div class="prop-group"><label>Corner:</label><input type="number" value="${el.background_round_corner}" onchange="updateProp('background_round_corner',this.value)" style="width:80px"></div>`;
    html += `<div class="prop-group"><label>Border:</label><input type="number" value="${el.stroke_width}" onchange="updateProp('stroke_width',this.value)" style="width:80px"></div>`;
    html += `<div class="prop-group"><label>Border Color:</label>${createColorInput('stroke_color', el.stroke_color, 'updateProp')}</div>`;
  }
  
  html += `</div>`;
  props.innerHTML = html;
  updateElementList();
}

function updateProp(key, value) {
  if (selectedElement && template.elements[selectedElement]) {
    template.elements[selectedElement][key] = value;
    var elIndex = elements.findIndex(e => e.id === selectedElement);
    if (elIndex !== -1) {
      if (key === 'x') elements[elIndex].x = parseFloat(value);
      if (key === 'y') elements[elIndex].y = parseFloat(value);
      if (key === 'width') elements[elIndex].width = parseFloat(value);
      if (key === 'height') elements[elIndex].height = parseFloat(value);
    }
    updateProperties();
    render();
  }
}

function updateDoc(key, value) {
  template.document[key] = value;
  if (key === 'width' || key === 'height') {
    canvas.width = template.document.width;
    canvas.height = template.document.height;
    canvas.style.width = template.document.width + 'px';
    canvas.style.height = template.document.height + 'px';
  }
  updateProperties();
  render();
}

function getHandleType(relX, relY, elWidth, elHeight) {
  var offset = 5;
  if (relX <= offset && relY <= offset) return 'nw';
  if (relX >= elWidth - offset && relY <= offset) return 'ne';
  if (relX <= offset && relY >= elHeight - offset) return 'sw';
  if (relX >= elWidth - offset && relY >= elHeight - offset) return 'se';
  if (relY <= offset) return 'n';
  if (relY >= elHeight - offset) return 's';
  if (relX <= offset) return 'w';
  if (relX >= elWidth - offset) return 'e';
  return null;
}

canvas.addEventListener('mousedown', function(e) {
  var rect = canvas.getBoundingClientRect();
  var x = (e.clientX - rect.left) * (template.document.width / rect.width);
  var y = (e.clientY - rect.top) * (template.document.height / rect.height);
  
  isDragging = false;
  isResizing = false;
  resizeHandle = null;
  
  if (selectedElement) {
    var el = elements.find(e => e.id === selectedElement);
    var relX = x - el.x;
    var relY = y - el.y;
    
    if (relX >= -5 && relX <= el.width + 5 && relY >= -5 && relY <= el.height + 5) {
      var handleType = getHandleType(relX, relY, el.width, el.height);
      if (handleType) {
        isResizing = true;
        resizeHandle = handleType;
        dragOffset = {x: x, y: y};
        return;
      }
    }
  }
  
  selectedElement = null;
  for (var i = elements.length - 1; i >= 0; i--) {
    var el = elements[i];
    var relX = x - el.x;
    var relY = y - el.y;
    if (relX >= 0 && relX <= el.width && relY >= 0 && relY <= el.height) {
      selectedElement = el.id;
      isDragging = true;
      dragOffset = {x: relX, y: relY};
      break;
    }
  }
  updateProperties();
  render();
});

canvas.addEventListener('mousemove', function(e) {
  if (!selectedElement) return;
  var rect = canvas.getBoundingClientRect();
  var x = (e.clientX - rect.left) * (template.document.width / rect.width);
  var y = (e.clientY - rect.top) * (template.document.height / rect.height);
  var elIndex = elements.findIndex(e => e.id === selectedElement);
  if (elIndex === -1) return;
  var el = elements[elIndex];
  
  if (isResizing && resizeHandle) {
    var deltaX = x - dragOffset.x;
    var deltaY = y - dragOffset.y;
    if (resizeHandle === 'se') {
      el.width = Math.max(20, el.width + deltaX);
      el.height = Math.max(20, el.height + deltaY);
    } else if (resizeHandle === 'sw') {
      el.x -= deltaX;
      el.width = Math.max(20, el.width - deltaX);
      el.height = Math.max(20, el.height + deltaY);
    } else if (resizeHandle === 'ne') {
      el.width = Math.max(20, el.width + deltaX);
      el.y -= deltaY;
      el.height = Math.max(20, el.height - deltaY);
    } else if (resizeHandle === 'nw') {
      el.x -= deltaX;
      el.width = Math.max(20, el.width - deltaX);
      el.y -= deltaY;
      el.height = Math.max(20, el.height - deltaY);
    } else if (resizeHandle === 'e') el.width = Math.max(20, el.width + deltaX);
    else if (resizeHandle === 'w') {
      el.x -= deltaX;
      el.width = Math.max(20, el.width - deltaX);
    } else if (resizeHandle === 's') el.height = Math.max(20, el.height + deltaY);
    else if (resizeHandle === 'n') {
      el.y -= deltaY;
      el.height = Math.max(20, el.height - deltaY);
    }
    template.elements[selectedElement].x = el.x;
    template.elements[selectedElement].y = el.y;
    template.elements[selectedElement].width = el.width;
    template.elements[selectedElement].height = el.height;
    updateProperties();
  } else if (isDragging) {
    var newX = x - dragOffset.x;
    var newY = y - dragOffset.y;
    template.elements[selectedElement].x = Math.max(0, newX);
    template.elements[selectedElement].y = Math.max(0, newY);
    elements[elIndex].x = Math.max(0, newX);
    elements[elIndex].y = Math.max(0, newY);
    updateProperties();
  }
  render();
});

canvas.addEventListener('mouseup', function() { 
  isDragging = false; 
  isResizing = false; 
  resizeHandle = null; 
});

function newTemplate() {
  template = { document: { width: 1200, height: 628, background_color: '#ffffff', background_image: '' }, elements: {} };
  elements = [];
  selectedElement = null;
  imageCache = {};
  updateProperties();
  render();
}

function saveTemplate() {
  var json = JSON.stringify(template, null, 2);
  var blob = new Blob([json], {type: 'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'template.json';
  a.click();
  document.getElementById('status').textContent = 'Template saved!';
}

function openTemplate() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
      template = JSON.parse(e.target.result);
      elements = Object.keys(template.elements).map(id => ({
        id: id,
        x: template.elements[id].x,
        y: template.elements[id].y,
        width: template.elements[id].width,
        height: template.elements[id].height
      }));
      selectedElement = null;
      imageCache = {};
      updateProperties();
      render();
    };
    reader.readAsText(file);
  };
  input.click();
}

// INIT
render();
updateProperties();