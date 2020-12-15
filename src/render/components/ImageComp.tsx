import * as React from 'react';
const qs = require('querystring');
export const ImageComp = () => {
    const search = qs.parse(location.search.split('?').pop());
    return (
        <img src={search.dataUrl}/>
    );
}