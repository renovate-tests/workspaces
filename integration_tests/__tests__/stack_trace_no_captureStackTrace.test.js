/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */
'use strict';

const runJest = require('../runJest');

it('prints a usable stack trace even if no Error.captureStackTrace', () => {
  const {stderr, status} = runJest('stack_trace_no_captureStackTrace');
  expect(stderr).not.toMatch('Error.captureStackTrace is not a function');
  expect(status).toBe(1);
});
