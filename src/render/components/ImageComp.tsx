import * as React from 'react';
import '../image.less';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { ipcRenderer } from 'electron';
const { useState, useEffect, useRef } = React; 
const qs = require('querystring');
export const ImageComp = () => {
    const search = qs.parse(location.search.split('?').pop());
    const [big, setBig] = useState(true);
    const imgRef = useRef(null);

    function plus(){
        ipcRenderer.send('resize-img', {index: search.index, width: search.width, height: search.height});
        setBig(true);
    }

    function minus(){
        ipcRenderer.send('resize-img', {index: search.index, width: 100, height: 100});
        setBig(false);
    }
    
    useEffect(()=>{
        let img = imgRef.current;
        if (img.complete) {
            ipcRenderer.send('show-img', {index: search.index});
        } else {
            img.onload = () => ipcRenderer.send('show-img', {index: search.index});
        }
        window.addEventListener('keypress', (e) => {
            console.log(e.code);
            if (e.code === 'Del') {
                ipcRenderer.send('close-img', {index: search.index});
            }
        })
    });

    const style: any = {"-webkit-app-region": "drag"}
    return (
        <div className="imgContainer" style={style}>
            <img className="img" ref={imgRef} draggable="false" src={search.dataUrl}/>
            <PlusCircleOutlined className="sizeIcon" style={{display: big ? 'none':'block'}} onClick={plus} />
            <MinusCircleOutlined className="sizeIcon" style={{display: big ? 'block':'none'}} onClick={minus}/>
        </div>
    );
}