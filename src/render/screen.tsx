import * as React from "react";
import * as ReactDOM from "react-dom";
import './screen.less';

import {ScreenRender} from './components/ScreenRender';

ReactDOM.render(
  <ScreenRender/>,
  document.getElementById('root') as HTMLElement
);