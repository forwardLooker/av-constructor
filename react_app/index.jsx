import React from 'react';
import ReactDom from 'react-dom';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css';
import { AVHost } from './VM/1-AVHost.jsx';
import {Host} from './M/1-Host.js';

import '@vkontakte/vkui/dist/vkui.css';


// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <AVHost></AVHost>,
//   },
//   {
//     path: "route1",
//     element: <div>Hello world!</div>,
//   },
// ]);

let config;
let hostItem;
let vkClass;
const vkStart = async () => {
  hostItem = new Host();
  vkClass = hostItem.getClassByPath('Domains/workspace/Domains/T4mhHKJGircmevLZbBHm/Classes/z3A9B1SghE3xHKzStVth');
  const [c] = await Promise.all([hostItem.getConfig.bind(hostItem)(), vkClass.getFieldDescriptors.bind(vkClass)(), vkClass.getObjectDocuments.bind(vkClass)()]);
  config = c;
  
  createRoot(document.getElementById('app')).render(<App />);
}

if (window.vk_app) {
  vkStart()
} else {
  createRoot(document.getElementById('app')).render(<App />);
}



export class App extends React.PureComponent {
  state = {
    router: null
  }
  render() {
    if (!this.state.router) {
      return (<AVHost appRef={this} hostItem={hostItem} vkClass={vkClass} config={config} itemFullScreenMode={window.vk_app ? true : false}></AVHost>)
    } else {
      return (
        <RouterProvider router={this.state.router} />
      )
    }
  }
}

// createRoot(document.getElementById('app')).render(<App />);
// ReactDom.render(
//   <App/>,
//   document.getElementById('app')
// )
