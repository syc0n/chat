/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
'use strict';
import React from 'react';
import Reflux from 'reflux';
import ChatStore from '../stores/ChatStore';
import ChatActions from '../actions/ChatActions';
import config from '../../config';


const Login = React.createClass({
  displayName: 'Login',

  mixins: [Reflux.connect(ChatStore, 'chat')],

  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      userName: '',
      password: '',
      savePassword: false
    };
  },

  componentDidMount: function() {
    // check local storage for saved info
    if (localStorage['userinfo']) {
      const userinfo = localStorage['userinfo'];
      this.setState(userinfo);
    }
  },

  onEnterClick: function() {
    const user = document.getElementById('login-user').value;
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('login-remember').checked;

    const userNormalized = JSON.stringify(user).replace(/\W/g, '').toLowerCase();
    ChatActions.connect({
      address: config.server,
      username: userNormalized,
      password: password,
      nick: localStorage['nick'],
      rooms: localStorage['rooms'] || config.rooms,
    })
    .then(() => {
      this.context.router.transitionTo('/chatbox')
    })
    .catch((error) => {
      console.log(error);
    });
  },

  render: function() {
    return (
      <div id='login-wrapper' className='row'>
        <form id='login-form' className='col s6 offset-s3'>
          <h3>CU Chat</h3>
          <div className='row'>
            <div className='input-field col s12'>
              <input id='login-user' className='validate' type='text' />
              <label htmlFor='login-user'>CSE Username</label>
            </div>
          </div>
          <div className='row'>
            <div className='input-field col s12'>
              <input id='login-password' className='validate' type='password' />
              <label htmlFor='login-password'>Password</label>
            </div>
          </div>
          <div className='row'>
            <div className='col s6'>
              <input id="login-remember" type="checkbox" className="filled-in" />
              <label htmlFor="login-remember">Remember my password</label>
            </div>
            <div className='col offset-s3 s3'>
              <button className="btn-large waves-effect waves-light" type="submit" name="action"  onClick={this.onEnterClick}>ENTER</button>
            </div>
          </div>
        </form>
      </div>
    );
  }
});

export default Login;
