/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
'use strict';
import Reflux from 'reflux';

const ChatActions = Reflux.createActions({
  'connect': {children: ['completed', 'failed']},
  'connectError': {children: ['completed', 'failed']},
  'sendMessageToRoom': {children: ['completed', 'failed']},
  'sendMessageToUser': {children: ['completed', 'failed']},
});

export default ChatActions;
