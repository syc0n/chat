/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
'use strict';

const config = {
  elementId: 'chat-app',
  resource: 'chat',
  server: 'chat.camelotunchained.com',
  service: 'conference',
  port: 8222,
  endpoint: '/api/chat',
  rooms: ['_global','_it','_modsquad'],
};

export default config;
