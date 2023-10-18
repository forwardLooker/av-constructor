import React from 'react';
import ReactDom from 'react-dom';
import './index.css';

import {AVHost} from './VM/1-AVHost.jsx';

class App extends React.PureComponent {
  render() {
    return (
      <AVHost></AVHost>
    )
  }
}

ReactDom.render(
  <App/>,
  document.getElementById('app')
)
