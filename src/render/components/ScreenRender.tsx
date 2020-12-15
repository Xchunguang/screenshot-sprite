import * as React from 'react';
import { ipcRenderer, desktopCapturer,clipboard, nativeImage, remote } from 'electron';
import { ScreenEditor } from './ScreenEditor';
import { getCurrentScreen } from './util';

const qs = require('querystring');

const { useRef, useEffect } = React;
const currentScreen = getCurrentScreen();
export const ScreenRender = ()=>{
    const bgRef = useRef(null);
    const canvasRef = useRef(null);
    const toolbarRef = useRef(null);
    const sizeInfoRef = useRef(null);
    const btnCloseRef = useRef(null);
    const btnResetRef = useRef(null);
    const btnOkRef = useRef(null);

    const search = qs.parse(location.search.split('?').pop());
    const thumbSize = {
        width: parseInt(search.width) * window.devicePixelRatio,
        height: parseInt(search.height) * window.devicePixelRatio
    };
    useEffect(()=>{
        desktopCapturer.getSources({ types: ['screen'], thumbnailSize: thumbSize}).then(sources => {
            sources.forEach(source => {
                if (source.display_id.toString() === search.display_id.toString()) {
                    try {
                        const dataUrl = source.thumbnail.toDataURL();
                        showImg(dataUrl);
                        ipcRenderer.send('show-screen', source.display_id);
                    } catch (e) {
                        console.log(e);
                    }
                }
            });
        });
    }, []);

    
    function showImg(dataUrl: string){


        let capture = new ScreenEditor(canvasRef.current, bgRef.current, dataUrl)
        let $toolbar = toolbarRef.current;
        let $sizeInfo = sizeInfoRef.current;
        let $btnClose = btnCloseRef.current;
        let $btnReset = btnResetRef.current;
        let $btnOk = btnOkRef.current;

        let onDrag = (selectRect: any) => {
            $toolbar.style.display = 'none'
            $sizeInfo.style.display = 'block'
            $sizeInfo.innerText = `${selectRect.w} * ${selectRect.h}`
            if (selectRect.y > 35) {
                $sizeInfo.style.top = `${selectRect.y - 30}px`
            } else {
                $sizeInfo.style.top = `${selectRect.y + 10}px`
            }
            $sizeInfo.style.left = `${selectRect.x}px`
        }
        capture.on('start-dragging', onDrag)
        capture.on('dragging', onDrag)

        let onDragEnd = () => {
            if (capture.selectRect) {
                ipcRenderer.send('capture-screen', {
                    type: 'select',
                    screenId: currentScreen.id,
                })
                const {
                    r, b,
                } = capture.selectRect
                $toolbar.style.display = 'flex'
                $toolbar.style.top = `${b + 15}px`
                $toolbar.style.right = `${window.screen.width - r}px`
            }
        }
        capture.on('end-dragging', onDragEnd)

        ipcRenderer.on('capture-screen', (e, { type, screenId }) => {
            if (type === 'select') {
                if (screenId && screenId !== currentScreen.id) {
                    capture.disable()
                }
            }
        })

        capture.on('reset', () => {
            $toolbar.style.display = 'none'
            $sizeInfo.style.display = 'none'
        })

        $btnClose.addEventListener('click', () => {
            ipcRenderer.send("capture-close");
        })

        $btnReset.addEventListener('click', () => {
            capture.reset()
        })

        let selectCapture = () => {
            if (!capture.selectRect) {
                return
            }
            let url = capture.getImageUrl()
            remote.getCurrentWindow().hide();
            clipboard.writeImage(nativeImage.createFromDataURL(url))
            ipcRenderer.send('capture-screen-finish', {
                url,
                rect: capture.selectRect
            });
        }
        $btnOk.addEventListener('click', selectCapture)

        window.addEventListener('keypress', (e) => {
            if (e.code === 'Enter') {
                selectCapture()
            }
        })

        // 右键取消截屏
        document.body.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                ipcRenderer.send("capture-close");
            }
        }, true)
    }
    return (
        <React.Fragment>
            <div ref={bgRef} className="bg"></div>
            <div id="js-mask" className="mask"></div>
            <canvas ref={canvasRef} className="image-canvas"></canvas>
            <div ref={sizeInfoRef} className="size-info"></div>
            <div ref={toolbarRef} className="toolbar">
                <div className="iconfont icon-zhongzhi" ref={btnResetRef}></div>
                <div className="iconfont icon-guanbi" ref={btnCloseRef}></div>
                <div className="iconfont icon-duihao" ref={btnOkRef}></div>
            </div>
        </React.Fragment>
    );
}