/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
'use strict';
import React from 'react';
import Reflux from 'reflux';
import ChatStore from '../stores/ChatStore';

const Room = React.createClass({
  displayName: 'room',

  chatlog: null,
  userlog: null,

  mixins: [Reflux.connectFilter(ChatStore, "room", function(rooms) {
    return rooms.find(function(room) {
      return room.roomName === this.props.roomName
    }.bind(this));
  })],

  getInitialState: function() {
    return {
      room: {
        roomName: null,
        messages: [],
        users: []
      },
    }
  },

  componentDidMount: function() {
    this.chatlog = document.getElementById('chatlog');
    this.userlog = document.getElementById('userlog');
  },

  componentDidUpdate: function() {
    const position = this.chatlog.scrollHeight - this.chatlog.clientHeight;
    const bottom = this.chatlog.scrollTop + 20;
    const atBottom = position <= bottom;
    if (atBottom) this.chatlog.scrollTop = this.chatlog.scrollHeight - this.chatlog.clientHeight;
  },

  // shouldComponentUpdate: function(nextProps, nextState) {
  //   if (!this.state.room && nextState.room) return true;
  //   if (!nextState.room ||
  //     (this.state.room.length == nextState.room.length &&
  //     this.state.room.users.length == nextState.room.users.length)) {
  //     return false;
  //   }
  //   return true;
  // },

  render: function() {
    let messageItem = (message) => {
      switch (message.type) {
        case 'chat':
          return (
            <li className='collection-item' key={message.id}>
              <span><b>{message.sender.senderName}:</b> </span><span>{message.message}</span>
            </li>
          );
        case 'presence':
          return (
            <li className='collection-item' key={message.id}>
              <span><b>{message.sender.senderName}</b></span> <span>has joined.</span>
            </li>
          );
      }
    };
    let userItem = (user) => {
      return <li className='collection-item truncate hoverable' key={user.id}>{user.senderName}</li>;
    };
    return (
      <div className='room'>

        <div className='row'>
          <div className='col s10 chat-area'>
            <ul id='chatlog' className={this.state.room ? 'collection' : 'loader'}>
              <li className='collection-item'>Welcome to {this.props.roomName}!</li>
              {this.state.room ? this.state.room.messages.map(messageItem) : ''}
            </ul>
          </div>
          <div className='col s2 chat-area'>
            <ul id='userlog' className={this.state.room ? 'collection' : 'loader'}>
              {this.state.room ? this.state.room.users.map(userItem) : ''}
            </ul>
          </div>
        </div>


      </div>
    );

  }
});

export default Room;