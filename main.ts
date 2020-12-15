import { app, BrowserWindow, Menu, MenuItem, dialog,Tray,globalShortcut  } from 'electron';
import { bindScreen } from './src/main/components/Main';
const path = require('path');

let mainWindow: BrowserWindow = null;
let tray: Tray = null;
let createWindow = function() {
    mainWindow = new BrowserWindow({
      width:800, 
      height:600, 
      skipTaskbar: true,
      show: false,
      webPreferences: {
        // nodeIntegration: true
      }
      // fullscreenable:false,
      // maximizable:false
    })
    mainWindow.webContents.openDevTools()
    mainWindow.hide(); 
    mainWindow.loadFile('index.html')

    mainWindow.on('close', (event) => { 
        mainWindow.hide(); 
        mainWindow.setSkipTaskbar(true);
        event.preventDefault();
    });

    mainWindow.on('show', () => {
        // tray.setHighlightMode('always')
    })
    mainWindow.on('hide', () => {
        // tray.setHighlightMode('never')
    })
    tray = new Tray('./app.ico');
    const contextMenu = Menu.buildFromTemplate([
        {label: '退出', click: () => {mainWindow.destroy()}},//我们需要在这里有一个真正的退出（这里直接强制退出）
    ])
    tray.setToolTip('My托盘测试')
    tray.setContextMenu(contextMenu)
    tray.on('click', ()=>{ //我们这里模拟桌面程序点击通知区图标实现打开关闭应用的功能
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
        mainWindow.isVisible() ? mainWindow.setSkipTaskbar(false):mainWindow.setSkipTaskbar(true);
    })

    bindScreen(mainWindow, app.getAppPath());
}

app.on('ready', createWindow);
app.on('window-all-closed', ()=>{
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', ()=>{
   if (mainWindow === null) {
        createWindow()
    }
})