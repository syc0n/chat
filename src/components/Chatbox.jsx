/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
'use strict';
import React from 'react';
import Room from './Room.jsx';

const Chatbox = React.createClass({
  displayName: 'chatbox',

  getInitialState: function() {
    return {
      userId: ''
    };
  },

  render: function() {
    return (
      <div className='row'>
        <div className='col s2'>
          <h4>Friends</h4>
        </div>
        <div className='col s10'>
          <Room roomName='_global' />
        </div>
      </div>
    );
  }
});

export default Chatbox;
