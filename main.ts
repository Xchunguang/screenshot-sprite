import { app, BrowserWindow, Menu, Tray } from 'electron';
import { bindScreen, closeAll } from './src/main/components/Main';

let mainWindow: BrowserWindow = null;
let tray: Tray = null;
let createWindow = function() {
    Menu.setApplicationMenu(null)
    mainWindow = new BrowserWindow({
      width:800, 
      height:600, 
      skipTaskbar: true,
      show: false,
      webPreferences: {
        nodeIntegration: true
      }
    })
    // mainWindow.webContents.openDevTools()
    mainWindow.hide(); 
    mainWindow.loadFile('index.html')

    mainWindow.on('close', (event) => { 
        mainWindow.hide(); 
        mainWindow.setSkipTaskbar(true);
        event.preventDefault();
    });

    tray = new Tray('./app.ico');
    const contextMenu = Menu.buildFromTemplate([
        {label: '退出', click: () => {
            closeAll();
            mainWindow.destroy();
        }},
    ])
    tray.setToolTip('SS截图助手')
    tray.setContextMenu(contextMenu)
    tray.on('click', ()=>{ 
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
// 禁止窗口弹出动画
app.commandLine.appendSwitch('wm-window-animations-disabled');