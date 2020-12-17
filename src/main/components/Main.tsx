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
function getImgWinIndex(index: any) : number{
    index = parseInt(index);
    if(!imgWins || imgWins.length === 0){
        return -1;
    }
    for(let i=0;i<imgWins.length;i++){
        if(imgWins[i].index === index){
            return i;
        }
    }
    return -1;
}
// 生成随机数
function GetRandomNum(Min=10000,Max=999999){
    var Range = Max - Min;
    var Rand = Math.random();
    return(Min + Math.round(Rand * Range));
}

ipcMain.on('show-screen', (e, display_id: string = '') => {
    captureWins.forEach(it => {
        if (it.display_id.toString() === display_id.toString()) {
            it.show() 
            captureStatus = true;
        }
    });
    globalShortcut.register('Esc', () => {
        if(captureWins.length >0 && captureStatus){
            closeCaptureWin();
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

ipcMain.on('resize-img', (e,{index, width, height})=>{
    e.preventDefault();
    e.returnValue = '';
    width = parseInt(width);
    height = parseInt(height);
    let imgIndex = getImgWinIndex(index);
    if(imgIndex >= 0){
        let imgWin = imgWins[imgIndex].win;
        let bound = imgWin.getBounds();
        let currentX = bound.x;
        let currentWidth = bound.width;
        bound.x = currentX - (width - currentWidth);
        bound.width = width;
        bound.height = height;
        imgWin.setBounds(bound);
    }
});

ipcMain.on('close-img', (e,{index})=>{
    e.preventDefault();
    e.returnValue = '';
    let imgIndex = getImgWinIndex(index);
    if(imgIndex >= 0){
        let imgWin = imgWins[imgIndex].win;
        imgWin.close();
        imgWins.splice(imgIndex, 1);
    }
});

ipcMain.on('show-img', (e,{index})=>{
    e.preventDefault();
    e.returnValue = '';
    let imgIndex = getImgWinIndex(index);
    if(imgIndex >= 0){
        let imgWin = imgWins[imgIndex].win;
        imgWin.show();
    }
});


const closeCaptureWin = () => {
    if (captureWins) {
        captureWins.forEach(win => win.close && win.close());
        captureWins.splice(0, captureWins.length);
        captureStatus = false;
    }
    globalShortcut.unregister('Esc');
};

function createImgWindow(dataUrl: string, rect: any){
    let imgWin = new BrowserWindow({
        width: rect.w,
        height: rect.h,
        minHeight: 100,
        minWidth: 100,
        x: rect.x,
        y: rect.y,
        frame: false,
        skipTaskbar: true,
        autoHideMenuBar: true, 
        resizable: false,
        movable: true, 
        show: false,
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true
        }
    });
    imgWin.setAlwaysOnTop(true, 'screen-saver')
    let index = GetRandomNum();
    let query: any = {
        index: index,
        width: rect.w,
        height: rect.h,
        dataUrl
    }
    imgWin.loadFile((path.join(app.getAppPath(), 'image.html')), {
        query: query
    });
    // imgWin.webContents.openDevTools();
    imgWins.push({
        win: imgWin,
        dataUrl: dataUrl,
        index: index
    });
    imgWin.on('closed', () => {
        let imgIndex = getImgWinIndex(index);
        if (imgIndex !== -1) {
            imgWins.splice(imgIndex, 1);
        }
    });
}

export const closeAll = () => {
    captureWins.forEach(e => e.close());
    captureWins.splice(0, captureWins.length);
    imgWins.forEach(e => e.win.close());
    imgWins.splice(0, imgWins.length);
}

export const bindScreen=(win: BrowserWindow, appPath: string)=>{
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