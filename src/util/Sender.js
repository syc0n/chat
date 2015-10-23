/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
'use strict';

class Sender {

  /* constructor(data): initialize Sender with the given data.
   *  @param data: {
   *                  id: int - required
   *                  sender: string - required
   *                  senderName: string - required
   *                  isCSE: string - required
   *                }
   */
  constructor(data) {
    this.id = data.id;
    this.sender = data.sender;
    this.senderName = data.senderName;
    this.isCSE = data.isCSE;
  }
};

export default Sender;
