import React from 'react';
import ReactDom from 'react-dom';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css';
import { AVHost } from './VM/1-AVHost.jsx';

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

export class App extends React.PureComponent {
  state = {
    router: null
  }
  render() {
    if (!this.state.router) {
      return (<AVHost appRef={this}></AVHost>)
    } else {
      return (
        <RouterProvider router={this.state.router} />
      )
    }
  }
}

createRoot(document.getElementById('app')).render(<App />);
// ReactDom.render(
//   <App/>,
//   document.getElementById('app')
// )
