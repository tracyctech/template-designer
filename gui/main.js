const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: { 
      nodeIntegration: true, 
      contextIsolation: false 
    }
  });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);