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

const ProjectWorkspace = require('../project_workspace');

describe('setup', () => {
  it('sets itself up fom the constructor', () => {
    const workspace = new ProjectWorkspace(
      'root_path',
      'path_to_jest',
      'path_to_config',
      1000,
    );
    expect(workspace.rootPath).toEqual('root_path');
    expect(workspace.pathToJest).toEqual('path_to_jest');
  });
});
