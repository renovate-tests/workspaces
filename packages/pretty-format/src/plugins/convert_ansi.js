/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

import type {Config, Printer, NewPlugin, Refs} from 'types/PrettyFormat';

import ansiRegex from 'ansi-regex';
import style from 'ansi-styles';

const toHumanReadableAnsi = text => {
  return text.replace(ansiRegex(), (match, offset, string) => {
    switch (match) {
      case style.red.close:
      case style.green.close:
      case style.reset.open:
      case style.reset.close:
        return '</>';
      case style.red.open:
        return '<red>';
      case style.green.open:
        return '<green>';
      case style.dim.open:
        return '<dim>';
      case style.bold.open:
        return '<bold>';
      default:
        return '';
    }
  });
};

export const test = (val: any) =>
  typeof val === 'string' && val.match(ansiRegex());

export const serialize = (
  val: string,
  config: Config,
  indentation: string,
  depth: number,
  refs: Refs,
  printer: Printer,
) => printer(toHumanReadableAnsi(val), config, indentation, depth, refs);

export default ({serialize, test}: NewPlugin);
