/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
'use strict';
import React from 'react';
import Reflux from 'reflux';
import ChatStore from '../stores/ChatStore';
import ChatActions from '../actions/ChatActions';

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


  onSendMessageToRoomClick: function() {
  //TODO duplicated 
    var roomMessage = 'roomMessage'+this.props.roomName;
    const message = document.getElementById(roomMessage).value;

   
    ChatActions.sendMessageToRoom({
      message: message,
	  roomName: this.props.roomName,
    })
    .then(() => {
      console.log(success);
      document.getElementById('roomMessage').value="";
    })
    .catch((error) => {
      console.log(error);
    });
  },
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
   //TODO duplicated 
    var roomMessage = 'roomMessage'+this.props.roomName;

    return (
      <div className='room'>

        <div className='row'>
          <div className='col s10 chat-area'>
            <ul id='chatlog' className={this.state.room ? 'collection' : 'loader'}>
              <li className='collection-item'>Welcome to {this.props.roomName}!</li>
              {this.state.room ? this.state.room.messages.map(messageItem) : ''}
            </ul>
            <div className='input-field col s12'>
              <input id={roomMessage}  type='text' />
              <label htmlFor='message'>Message</label>
              <button className="btn-large waves-effect waves-light" type="submit" name="action"  onClick={this.onSendMessageToRoomClick}>SEND</button>
            </div>
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
