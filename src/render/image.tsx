import * as React from "react";
import * as ReactDOM from "react-dom";
import './image.less';

import {ImageComp} from './components/ImageComp';

ReactDOM.render(
  <ImageComp/>,
  document.getElementById('root') as HTMLElement
);