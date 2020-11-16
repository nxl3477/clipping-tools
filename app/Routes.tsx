import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './views/App';
import HomePage from './views/HomePage';
import Screenshot from './views/Screenshot/Screenshot'
// import CounterPage from './containers/CounterPage';

export default function Routes() {
  return (
    <App>
      <Switch>
        {/* <Route path={routes.COUNTER} component={CounterPage} /> */}
        <Route path={ routes.SCREENSHOT} exact component={ Screenshot } />
        <Route path={routes.HOME} exact component={HomePage} />
      </Switch>
    </App>
  );
}
