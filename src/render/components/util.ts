import {remote, screen} from 'electron';

let currentWindow = remote.getCurrentWindow()

export function getCurrentScreen(){
    let { x, y } = currentWindow.getBounds()
    return remote.screen.getAllDisplays().filter(d => d.bounds.x === x && d.bounds.y === y)[0]
}

export function isCursorInCurrentWindow() {
    let { x, y } = screen.getCursorScreenPoint()
    let {
        x: winX, y: winY, width, height,
    } = currentWindow.getBounds()
    return x >= winX && x <= winX + width && y >= winY && y <= winY + height
}
