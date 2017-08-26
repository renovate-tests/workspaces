/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

// fails because there is no `strip-flow-types` transform
const thisFunctionIsNeverInstrumented = (a: string) => {
  return null;
};

test('this is never called', () => {
  thisFunctionIsNeverInstrumented();
});
