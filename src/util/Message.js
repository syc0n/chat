/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
'use strict';
import Sender from './Sender';

class Message {

  /* constructor(data): initialize Message with the given data.
   *  @param data: {
   *                  id: uuid - required
   *                  time: Date
   *                  message: string
   *                  room: string
   *                  roomName: string
   *                  sender: string
   *                  senderName: string
   *                  isCSE:
   *                }
   */
  constructor(data) {
    this.id = data.id;
    this.time = data.time;
    this.message = data.message;
    this.roomName = data.roomName;
    this.sender = new Sender(data);
  }
};

class ChatMessage extends Message {
  constructor(data) {
    super(data);
    this.type = 'chat';
  }
}

class PresenceMessage extends Message {
  constructor(data, join) {
    super(data);
    this.join = join;
    this.type = 'presence';
  }
}

export {
  ChatMessage,
  PresenceMessage
};
