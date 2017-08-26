/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

jest.mock('../');
const importedFn = require('../');
const localFn = jest.fn(() => 'abcd');

test('first test', () => {
  importedFn();
  expect(localFn()).toEqual('abcd');

  expect(importedFn.mock.calls.length).toBe(1);
  expect(localFn.mock.calls.length).toBe(1);
});

test('second test', () => {
  importedFn();
  expect(localFn()).toEqual('abcd');

  expect(importedFn.mock.calls.length).toBe(1);
  expect(localFn.mock.calls.length).toBe(1);
});
