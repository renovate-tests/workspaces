/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

import type {Context} from 'types/Context';
import type {ChangedFilesPromise} from 'types/ChangedFiles';
import type {GlobalConfig} from 'types/Config';
import type {AggregatedResult} from 'types/TestResult';
import type TestWatcher from './test_watcher';

import path from 'path';
import {Console, formatTestResults} from 'jest-util';
import fs from 'graceful-fs';
import getNoTestsFoundMessage from './get_no_test_found_message';
import SearchSource from './search_source';
import TestScheduler from './test_scheduler';
import TestSequencer from './test_sequencer';
import {makeEmptyAggregatedTestResult} from './test_result_helpers';

const setConfig = (contexts, newConfig) =>
  contexts.forEach(
    context =>
      (context.config = Object.freeze(
        Object.assign({}, context.config, newConfig),
      )),
  );

const getTestPaths = async (
  globalConfig,
  context,
  outputStream,
  changedFilesPromise,
) => {
  const source = new SearchSource(context);
  let data = await source.getTestPaths(globalConfig, changedFilesPromise);
  if (!data.tests.length) {
    if (globalConfig.onlyChanged && data.noSCM) {
      if (globalConfig.watch) {
        data = await source.getTestPaths(globalConfig);
      } else {
        new Console(outputStream, outputStream).log(
          'Jest can only find uncommitted changed files in a git or hg ' +
            'repository. If you make your project a git or hg ' +
            'repository (`git init` or `hg init`), Jest will be able ' +
            'to only run tests related to files changed since the last ' +
            'commit.',
        );
      }
    }
  }
  return data;
};

const processResults = (runResults, options) => {
  const {outputFile} = options;
  if (options.testResultsProcessor) {
    /* $FlowFixMe */
    runResults = require(options.testResultsProcessor)(runResults);
  }
  if (options.isJSON) {
    if (outputFile) {
      const filePath = path.resolve(process.cwd(), outputFile);

      fs.writeFileSync(filePath, JSON.stringify(formatTestResults(runResults)));
      process.stdout.write(
        `Test results written to: ` +
          `${path.relative(process.cwd(), filePath)}\n`,
      );
    } else {
      process.stdout.write(JSON.stringify(formatTestResults(runResults)));
    }
  }
  return options.onComplete && options.onComplete(runResults);
};

const runJest = async ({
  contexts,
  globalConfig,
  outputStream,
  testWatcher,
  startRun,
  changedFilesPromise,
  onComplete,
}: {
  globalConfig: GlobalConfig,
  contexts: Array<Context>,
  outputStream: stream$Writable | tty$WriteStream,
  testWatcher: TestWatcher,
  startRun: (globalConfig: GlobalConfig) => *,
  changedFilesPromise: ?ChangedFilesPromise,
  onComplete: (testResults: AggregatedResult) => any,
}) => {
  const sequencer = new TestSequencer();
  let allTests = [];
  const testRunData = await Promise.all(
    contexts.map(async context => {
      const matches = await getTestPaths(
        globalConfig,
        context,
        outputStream,
        changedFilesPromise,
      );
      allTests = allTests.concat(matches.tests);
      return {context, matches};
    }),
  );

  allTests = sequencer.sort(allTests);

  if (globalConfig.listTests) {
    const testsPaths = allTests.map(test => test.path);
    if (globalConfig.json) {
      outputStream.write(JSON.stringify(testsPaths));
    } else {
      outputStream.write(testsPaths.join('\n'));
    }

    onComplete && onComplete(makeEmptyAggregatedTestResult());
    return null;
  }

  if (!allTests.length) {
    new Console(outputStream, outputStream).log(
      getNoTestsFoundMessage(testRunData, globalConfig),
    );
  } else if (
    allTests.length === 1 &&
    globalConfig.silent !== true &&
    globalConfig.verbose !== false
  ) {
    globalConfig = Object.freeze(
      Object.assign({}, globalConfig, {verbose: true}),
    );
  }

  // When using more than one context, make all printed paths relative to the
  // current cwd. rootDir is only used as a token during normalization and
  // has no special meaning afterwards except for printing information to the
  // CLI.
  setConfig(contexts, {rootDir: process.cwd()});

  const results = await new TestScheduler(globalConfig, {
    startRun,
  }).scheduleTests(allTests, testWatcher);

  sequencer.cacheResults(allTests, results);

  return processResults(results, {
    isJSON: globalConfig.json,
    onComplete,
    outputFile: globalConfig.outputFile,
    testResultsProcessor: globalConfig.testResultsProcessor,
  });
};

module.exports = runJest;
