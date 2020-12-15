import { BrowserWindow, screen, ipcMain, globalShortcut, app  } from'electron';
const os = require('os');
const path = require('path');

let captureWins: any[] = [];
let captureStatus = false;

type ImgWindow = {
    win: BrowserWindow,
    dataUrl: string,
    index: number
}

let imgWins: ImgWindow[] = [];

ipcMain.on('show-screen', (e, display_id: string = '') => {
    captureWins.forEach(it => {
        if (it.display_id.toString() === display_id.toString()) {
            it.show();
            captureStatus = true;
        }
    });
});

ipcMain.on('show-all-screen', () => {
    captureWins.forEach(it => {
        it.show();
    });
});

// 确认
ipcMain.on('capture-screen-finish', (e1, {url, rect})=>{
    e1.returnValue = '';
    captureWins.forEach(e => e.close());
    captureWins.splice(0, captureWins.length);
    createImgWindow(url, rect);
});

// 取消
ipcMain.on('capture-close', (e1)=>{
    e1.preventDefault();
    e1.returnValue = '';
    captureWins.forEach(e => e.close());
    captureWins.splice(0, captureWins.length);
});

const closeCaptureWin = (win: BrowserWindow) => {
    if (captureWins) {
        captureWins.forEach(win => win.close && win.close());
        captureWins.splice(0, captureWins.length);
        captureStatus = false;
    }
};

function createImgWindow(dataUrl: string, rect: any){
    let imgWin = new BrowserWindow({
        width: rect.w,
        height: rect.h,
        x: rect.x,
        y: rect.y,
        frame: false,
        skipTaskbar: true,
        autoHideMenuBar: true, 
        resizable: false,
        movable: true, 
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true
        }
    });
    imgWin.setAlwaysOnTop(true, 'screen-saver')
    let query: any = {
        dataUrl
    }
    imgWin.loadFile((path.join(app.getAppPath(), 'image.html')), {
        query: query
    });
    let index = captureWins.length;
    imgWin.webContents.openDevTools();
    imgWins.push({
        win: imgWin,
        dataUrl: dataUrl,
        index: index
    });
}

export const bindScreen=(win: BrowserWindow, appPath: string)=>{
    globalShortcut.register('Esc', () => {
        if(captureWins.length >0 && captureStatus){
            closeCaptureWin(win);
        }
    });
    globalShortcut.register('Alt+Q', () => {
        captureScreen(path.join(appPath, 'screen.html'));
    })
}

export const captureScreen =(screenPath: string)=>{
    if (captureWins.length) {
        return ;
    }
    let displays = screen.getAllDisplays()
    captureWins = displays.map((display) => {
        let captureWin: any = new BrowserWindow({
            // window 使用 fullscreen,  mac 设置为 undefined, 不可为 false
            fullscreen: os.platform() === 'win32' || undefined,
            width: display.size.width,
            height: display.size.height,
            x: display.bounds.x,
            y: display.bounds.y,
            transparent: true,
            frame: false,
            skipTaskbar: true,
            autoHideMenuBar: true, 
            movable: false, 
            resizable: false,
            enableLargerThanScreen: true,
            hasShadow: false,
            webPreferences: {
                webSecurity: false,
                nodeIntegration: true
            },
            show: false
        })
        captureWin.setAlwaysOnTop(true, 'screen-saver')
        captureWin.setVisibleOnAllWorkspaces(true)
        captureWin.setFullScreenable(false)

        let query: any = {
            width: display.size.width,
            height: display.size.height,
            display_id: display.id,
            type_val: 1
        }
        captureWin.loadFile((screenPath), {
            query: query
        });
        // captureWin.webContents.openDevTools();
        captureWin.display_id = display.id;
        captureWin.on('closed', () => {
            let index = captureWins.indexOf(captureWin)
            if (index !== -1) {
                captureWins.splice(index, 1)
            }
            captureWins.forEach(win => win.close())
        });
        return captureWin;
    });
}