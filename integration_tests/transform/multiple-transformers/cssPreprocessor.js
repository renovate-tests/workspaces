/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports = {
  process(src, filename, config, options) {
    return `
      module.exports = {
        root: 'App-root',
        header: 'App-header',
        logo: 'App-logo',
        intro: 'App-intro',
      };
    `;
  },
};
