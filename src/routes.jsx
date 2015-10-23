/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
'use strict';
import React from 'react';
import {Route, DefaultRoute} from 'react-router';
import App from './components/App.jsx';
import Login from './components/Login.jsx';
import Chatbox from './components/Chatbox.jsx';

const routes = (
  <Route name='app' path='/' handler={App}>
    <DefaultRoute handler={Login} />
    <Route name='chatbox' handler={Chatbox} />
  </Route>
);

export default routes;
