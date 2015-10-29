/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
'use strict';
import Reflux from 'reflux';
import ChatActions from '../actions/ChatActions';
import CSEChat from '../util/CSEChat';
import Sender from '../util/Sender';
import {ChatMessage, PresenceMessage} from '../util/Message';
import request from 'request-promise';
import config from '../../config';
import Promise from 'bluebird';

function haveInternet() {
  return request('http://www.google.com');
}

let chat = {};

const ChatStore = Reflux.createStore({
  listenables: ChatActions,

  rooms: [],
  server: config.server,
  updated: 0,
  shouldTrigger: false,
  timeOut: false,

  init: function() {
  },

  /* connect(data)
   *  @param data: {
   *                  address: string - required
   *                  username: string - required
   *                  password: string - required
   *                  rooms: [string] - optional
   *                  nick: string - optional
   *                }
   */
  onConnect: function(data) {
      chat = new CSEChat({
        address: data.address,
        username: data.username,
        password: data.password,
        resource: config.resource,
        service: config.service,
        rooms: data.rooms || config.rooms,
        nick: data.nick
      });

      data.rooms.forEach((room) => {
        this.rooms.push({
          roomName: room,
          messages: [],
          users: []
        });
      });

      chat.on('error',(err) => {
        this.onConnectError(err);
        ChatActions.connect.failed(err)
      });

      chat.once('online', () => {
        ChatActions.connect.completed()
        this.connection = {
          online: true
        };
        this._initializeEvents();
      });
      chat.connect();
  },
  
  onSendMessageToRoom: function(data) {
	  if(chat){
		  chat.sendMessageToRoom(data.message,data.roomName);
	  }
  },
  onSendMessageToUser: function(data) {
	  if(chat){
		  chat.sendMessageToUser(data.message,data.userName);
	  }
  },
  
  
  

  onConnectError: function(error) {
    console.log(error);
    if (chat) {
      chat.removeListener('error', this.onConnectError);
      chat.disconnect();
      chat = {};
    }
    this.connection = {
      online: false,
      error: error
    }
  },

  _initializeEvents: function() {

    chat.on('presence', (presence) => {
      let room = this.rooms.find((r) => r.roomName === presence.roomName);
      if (!room) {
        let r = {
          roomName: presence.roomName,
          messages: [],
          users: [new Sender(presence)]
        };
        this.rooms.push(r);
      } else {
        if (!room.users.find((s) => s.senderName === presence.senderName)) {
          room.users.push(new Sender(presence));
        }
      }
      this._trigger();
    });

    chat.on('message', (message) => {
      let room = this.rooms.find((r) => r.roomName === message.roomName);
      if (!room) {
        let r = {
          roomName: message.roomName,
          messages: [],
          users: []
        };
        r.messages[message.id] = new ChatMessage(message);
        this.rooms.push(r);
      } else {
        room.messages[message.id] = new ChatMessage(message);
      }
      this._trigger();
    });

    chat.on('groupmessage', (message) => {
      let room = this.rooms.find((r) => r.roomName === message.roomName);
      if (!room) {
        let r = {
          roomName: message.roomName,
          messages: [],
          users: []
        };
        r.messages[message.id] = new ChatMessage(message);
        this.rooms.push(r);
      } else {
        room.messages[message.id] = new ChatMessage(message);
      }
      this._trigger();
    });
  },

  _trigger() {
    let now = new Date().getTime();
    if (now - this.updated >= 100) {
      // send immediately
      this.trigger(this.rooms);
      this.updated = now;
      this.timeOut = 0;
    } else if (!this.timeOut) {
      this.timeOut = setTimeout(() => this._trigger(), Math.min(now - this.updated, 100));
    }
  }
});

export default ChatStore;
