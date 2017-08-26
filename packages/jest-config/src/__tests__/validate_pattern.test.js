/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

const validatePattern = require('../validate_pattern');

describe('validate pattern function', () => {
  it('without passed args returns true', () => {
    const isValid = validatePattern();

    expect(isValid).toBeTruthy();
  });

  it('returns true for empty pattern', () => {
    const isValid = validatePattern('');

    expect(isValid).toBeTruthy();
  });

  it('returns true for valid pattern', () => {
    const isValid = validatePattern('abc+');

    expect(isValid).toBeTruthy();
  });

  it('returns false for invalid pattern', () => {
    const isValid = validatePattern('\\');

    expect(isValid).toBeFalsy();
  });
});
