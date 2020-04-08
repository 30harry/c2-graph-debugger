import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import CounterPage from './containers/CounterPage';
import TextViewPage from './containers/TextViewPage';
import GraphViewPage from './containers/GraphViewPage';

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.TEXTVIEW} component={TextViewPage} />
        <Route path={routes.GRAPHVIEW} component={GraphViewPage} />
        <Route path={routes.COUNTER} component={CounterPage} />
        <Route path={routes.HOME} component={HomePage} />
      </Switch>
    </App>
  );
}
