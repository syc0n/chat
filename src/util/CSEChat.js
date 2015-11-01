/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
'use strict';
import XMPP from 'node-xmpp';
import request from 'request-promise';
import Promise from 'bluebird';
import EventEmitter from 'eventemitter3';

class CSEChat {
  /* constructor(config): initialize CSEChat with the given config.
   *  @param config: {
   *                  address: string - required
   *                  username: string - required
   *                  password: string - required
   *                  resource: string - required
   *                  service: string - required
   *                  rooms: [string] - optional
   *                  nick: string - optional
   *                }
   */
  constructor(config = {}) {
    if (!config.address) throw new Error('A address is required.')
    if (!config.username) throw new Error('A username is required.')
    if (!config.password) throw new Error('A password is required.')
    if (!config.resource) throw new Error('A resource is required.')

    // config setup
    this.address = config.address;
    this.username = config.username;
    this.password = config.password;
    this.resource = config.resource || 'chat';
    this.service = config.service || 'conference';
    this.serviceAddress = '@' + this.service + '.' + this.address;
    this.nick = config.nick || this.username;
    this.port = config.port || 8222;
    this.endpoint = config.endpoint || '/api/chat';

    this.websocketUrl = 'ws://' + this.address + ':' + this.port + this.endpoint;

    this.roomNames = config.rooms || ['_global', 'a10'];
    this.rooms = this.roomNames.map((r) =>  r + this.serviceAddress);
    this.jid = this.username + '@' + this.address + '/' + this.resource;
    this.client = null;
    this.eventEmitter = new EventEmitter();
    this._reconnect = true;
    this._idCounter = 0;
  }

  // Initializes an XMPP connection
  connect() {
    this.client = new XMPP.Client({
      websocket: {
        url: this.websocketUrl
      },
      jid: this.jid,
      password: this.password
    });

    this._initializeEvents();
    return this.client;
  }

  disconnect() {
    if (!this.client) return;
    this._reconnect = false;
    clearInterval(this._heartbeatInterval);
    this.client.reconnect = false;
    this.client.removeAllListeners('disconnect');
    this.client.removeAllListeners('online');
    this.client.removeAllListeners('stanza');
    this.client.end();
    this.client = null;
  }

  sendMessageToRoom(message, roomName) {
    if (!this.client) return;
    this.client.send(new XMPP.Element('message', {
      to: roomName + '@' + this.service + '.' + this.address,
      type: 'groupchat'
    })
    .c('body')
    .t(message));
  }

  sendMessageToUser(message, userName) {
    if (!this.client) return;
    this.client.send(new XMPP.Element('message', {
      to: userName + '@' + this.address,
      type: 'chat'
    })
    .c('body')
    .t(message));
  }
  
  
  joinRoom(roomName){
	  if (!this.client) return;
	  this.client.send(new XMPP.Element('presence',{to: room + '/' + this.nick})
      .c('x', {xmlns: 'http://jabber.org/protocol/muc'})); 
  }
  leavRoom(roomName){
	  if (!this.client) return;
	  this.client.send(new XMPP.Element('unavailable',{to: room + '/' + this.nick})
      .c('x', {xmlns: 'http://jabber.org/protocol/muc'})); 
  }

  // alias eventEmitter
  on(event, callback) {
    return this.eventEmitter.on(event, callback);
  }

  once(event, callback) {
    return this.eventEmitter.once(event, callback);
  }

  removeListener(event, callback) {
    return this.eventEmitter.removeListener(event, callback);
  }

  removeAllListeners(event) {
    return this.eventEmitter.removeAllListeners(event);
  }

  // PRIVATE METHODS (as private as they can be)

  _initializeEvents() {
    if (!this.client) throw new Error('No connection to initialize');

    this.client.on('error', (error) => {
      switch(error.code) {
        case 'EADDRNOTAVAIL':
        case 'ENOTFOUND':
          this.eventEmitter.emit('error', 'Unable to connect to server at' + this.address);
          break;
        case 'ETIMEOUT':
          this.eventEmitter.emit('error', 'Connection timed out.');
          break;
        default:
          this.eventEmitter.emit('error', error);
          break;
      }
    });

    this.client.on('online', () => {
      this.eventEmitter.emit('online');
      // send global presence
      this.client.send(new XMPP.Element('presence', {type: 'available'}).c('show').t('chat'));

      // join rooms
      this.rooms.forEach((room) => {
        this.client.send(new XMPP.Element('presence',{to: room + '/' + this.nick})
          .c('x', {xmlns: 'http://jabber.org/protocol/muc'}));
      });

     
    }, this);

    this.client.on('disconnect', () => {
      this.client = null;
      this.eventEmitter.emit('disconnect', this._reconnect);
      if (this._reconnect) this.connect();
    });

    this.client.on('stanza', (stanza) => this._processStanza(stanza));
  }



  _processStanza(stanza) {

    // if error?
    if (stanza.attrs.type === 'error') {
      return;
    }

    if (stanza.is('message'))
    {
    	
      switch(stanza.attrs.type) {
        case 'groupchat':
          this.eventEmitter.emit('groupmessage', this._parseMessageGroup(stanza));
          break;
        case 'chat':
          this.eventEmitter.emit('message', this._parseMessageChat(stanza));
          break;
      }
      return;
    }

    if (stanza.is('presence')) {
      const x = stanza.getChild('x');
      if (!x) return;
      this.eventEmitter.emit('presence', this._parsePresence(stanza));
      return;
    }
  }

  _parseMessageGroup(stanza) {
	  
    const body = stanza.getChild('body');
    const message = body ? body.getText() : '';
    const cseflags = stanza.getChild('cseflags');
    const isCSE = cseflags ? cseflags.attrs.cse : false;

    if (stanza.attrs.from.indexOf('/') != -1) {
      const fromArr = stanza.attrs.from.split('/');
      const room = fromArr[0];
      const roomName = room.split('@')[0];
      const sender = fromArr[1];
      const senderName = sender.split('@')[0];
      return {
        id: this._idCounter++,
        time: new Date(),
        message: message,
        room: room,
        roomName: roomName,
        sender: sender,
        senderName: senderName,
        isCSE: isCSE,
      }
    } else {
      const sender = stanza.attrs.from;
      const senderName = sender.split('@')[0];
      return {
        id: this._idCounter++,
        time: new Date(),
        message: message,
        sender: sender,
        senderName: senderName,
        isCSE: isCSE,
      }
    }
  }
  
  _parseMessageChat(stanza) {
	 
	    const body = stanza.getChild('body');
	    const message = body ? body.getText() : '';
	    const nick = stanza.getChild('nick');
	    const senderName = nick ? nick.getText() : '';
	    const cseflags = stanza.getChild('cseflags');
	    const isCSE = cseflags ? cseflags.attrs.cse : false;

	    if (stanza.attrs.from.indexOf('/') != -1) {
	      return {
	        id: this._idCounter++,
	        time: new Date(),
	        message: message,
	        roomName: senderName,
	        isCSE: isCSE,
	      }
	    } else {
	    	
	      const sender = stanza.attrs.from;
	      const senderName = sender.split('@')[0];
	      return {
	        id: this._idCounter++,
	        time: new Date(),
	        message: message,
	        sender: sender,
	        senderName: senderName,
	        isCSE: isCSE,
	      }
	    }
	  }

  _parsePresence(stanza) {
    const x = stanza.getChild('x');
    const status = x.getChild('status');
    const role = x.getChild('item').attrs.role;

    const fromArr = stanza.attrs.from.split('/');
    const room = fromArr[0];
    const roomName = room.split('@')[0];
    const sender = fromArr[1];
    const senderName = sender.split('@')[0];

    const cseflags = stanza.getChild('cseflags');
    const isCSE = cseflags ? cseflags.attrs.cse : false;

    return {
      id: this._idCounter++,
      time: new Date(),
      role: role,
      room: room,
      roomName: roomName,
      sender: sender,
      senderName: senderName,
      isCSE: isCSE
    }
  }

  _getTime() {
    return Math.floor((new Date()).getTime() / 1000);
  }
}

export default CSEChat;
