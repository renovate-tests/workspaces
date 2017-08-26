/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

import type {AggregatedResult, SnapshotSummary} from 'types/TestResult';
import type {GlobalConfig} from 'types/Config';
import type {Context} from 'types/Context';
import type {ReporterOnStartOptions} from 'types/Reporters';

import chalk from 'chalk';
import BaseReporter from './base_reporter';
import {getSummary, pluralize} from './utils';
import getResultHeader from './get_result_header';
import testPathPatternToRegExp from '../test_path_pattern_to_regexp';

const ARROW = ' \u203A ';
const FAIL_COLOR = chalk.bold.red;
const SNAPSHOT_ADDED = chalk.bold.green;
const SNAPSHOT_NOTE = chalk.dim;
const SNAPSHOT_REMOVED = chalk.bold.red;
const SNAPSHOT_SUMMARY = chalk.bold;
const SNAPSHOT_UPDATED = chalk.bold.green;
const TEST_SUMMARY_THRESHOLD = 20;

const NPM_EVENTS = new Set([
  'prepublish',
  'publish',
  'postpublish',
  'preinstall',
  'install',
  'postinstall',
  'preuninstall',
  'uninstall',
  'postuninstall',
  'preversion',
  'version',
  'postversion',
  'pretest',
  'test',
  'posttest',
  'prestop',
  'stop',
  'poststop',
  'prestart',
  'start',
  'poststart',
  'prerestart',
  'restart',
  'postrestart',
]);

class SummaryReporter extends BaseReporter {
  _estimatedTime: number;
  _globalConfig: GlobalConfig;

  constructor(globalConfig: GlobalConfig) {
    super();
    this._globalConfig = globalConfig;
    this._estimatedTime = 0;
  }

  // If we write more than one character at a time it is possible that
  // Node.js exits in the middle of printing the result. This was first observed
  // in Node.js 0.10 and still persists in Node.js 6.7+.
  // Let's print the test failure summary character by character which is safer
  // when hundreds of tests are failing.
  _write(string: string) {
    for (let i = 0; i < string.length; i++) {
      process.stderr.write(string.charAt(i));
    }
  }

  onRunStart(
    aggregatedResults: AggregatedResult,
    options: ReporterOnStartOptions,
  ) {
    super.onRunStart(aggregatedResults, options);
    this._estimatedTime = options.estimatedTime;
  }

  onRunComplete(contexts: Set<Context>, aggregatedResults: AggregatedResult) {
    const {numTotalTestSuites, testResults, wasInterrupted} = aggregatedResults;
    if (numTotalTestSuites) {
      const lastResult = testResults[testResults.length - 1];
      // Print a newline if the last test did not fail to line up newlines
      // similar to when an error would have been thrown in the test.
      if (
        !this._globalConfig.verbose &&
        lastResult &&
        !lastResult.numFailingTests &&
        !lastResult.testExecError
      ) {
        this.log('');
      }

      this._printSummary(aggregatedResults, this._globalConfig);
      this._printSnapshotSummary(
        aggregatedResults.snapshot,
        this._globalConfig,
      );

      if (numTotalTestSuites) {
        let message = getSummary(aggregatedResults, {
          estimatedTime: this._estimatedTime,
        });

        if (!this._globalConfig.silent) {
          message +=
            '\n' +
            (wasInterrupted
              ? chalk.bold.red('Test run was interrupted.')
              : this._getTestSummary(contexts, this._globalConfig));
        }
        this.log(message);
      }
    }
  }

  _printSnapshotSummary(
    snapshots: SnapshotSummary,
    globalConfig: GlobalConfig,
  ) {
    if (
      snapshots.added ||
      snapshots.filesRemoved ||
      snapshots.unchecked ||
      snapshots.unmatched ||
      snapshots.updated
    ) {
      let updateCommand;
      const event = process.env.npm_lifecycle_event;
      const prefix = NPM_EVENTS.has(event) ? '' : 'run ';
      const client =
        typeof process.env.npm_config_user_agent === 'string' &&
        process.env.npm_config_user_agent.match('yarn') !== null
          ? 'yarn'
          : 'npm';
      if (globalConfig.watch) {
        updateCommand = 'press `u`';
      } else if (event) {
        updateCommand = `run with \`${client + ' ' + prefix + event} -- -u\``;
      } else {
        updateCommand = 're-run with `-u`';
      }

      this.log(SNAPSHOT_SUMMARY('Snapshot Summary'));
      if (snapshots.added) {
        this.log(
          SNAPSHOT_ADDED(ARROW + pluralize('snapshot', snapshots.added)) +
            ` written in ${pluralize('test suite', snapshots.filesAdded)}.`,
        );
      }

      if (snapshots.unmatched) {
        this.log(
          FAIL_COLOR(ARROW + pluralize('snapshot test', snapshots.unmatched)) +
            ` failed in ` +
            `${pluralize('test suite', snapshots.filesUnmatched)}. ` +
            SNAPSHOT_NOTE(
              'Inspect your code changes or ' +
                updateCommand +
                ' to update them.',
            ),
        );
      }

      if (snapshots.updated) {
        this.log(
          SNAPSHOT_UPDATED(ARROW + pluralize('snapshot', snapshots.updated)) +
            ` updated in ${pluralize('test suite', snapshots.filesUpdated)}.`,
        );
      }

      if (snapshots.filesRemoved) {
        this.log(
          SNAPSHOT_REMOVED(
            ARROW + pluralize('obsolete snapshot file', snapshots.filesRemoved),
          ) +
            (snapshots.didUpdate
              ? ' removed.'
              : ' found, ' +
                updateCommand +
                ' to remove ' +
                (snapshots.filesRemoved === 1 ? 'it' : 'them.') +
                '.'),
        );
      }

      if (snapshots.unchecked) {
        this.log(
          FAIL_COLOR(
            ARROW + pluralize('obsolete snapshot', snapshots.unchecked),
          ) +
            (snapshots.didUpdate
              ? ' removed.'
              : ' found, ' +
                updateCommand +
                ' to remove ' +
                (snapshots.filesRemoved === 1 ? 'it' : 'them') +
                '.'),
        );
      }

      this.log(''); // print empty line
    }
  }

  _printSummary(
    aggregatedResults: AggregatedResult,
    globalConfig: GlobalConfig,
  ) {
    // If there were any failing tests and there was a large number of tests
    // executed, re-print the failing results at the end of execution output.
    const failedTests = aggregatedResults.numFailedTests;
    const runtimeErrors = aggregatedResults.numRuntimeErrorTestSuites;
    if (
      failedTests + runtimeErrors > 0 &&
      aggregatedResults.numTotalTestSuites > TEST_SUMMARY_THRESHOLD
    ) {
      this.log(chalk.bold('Summary of all failing tests'));
      aggregatedResults.testResults.forEach(testResult => {
        const {failureMessage} = testResult;
        if (failureMessage) {
          this._write(
            getResultHeader(testResult, globalConfig) +
              '\n' +
              failureMessage +
              '\n',
          );
        }
      });
      this.log(''); // print empty line
    }
  }

  _getTestSummary(contexts: Set<Context>, globalConfig: GlobalConfig) {
    const getMatchingTestsInfo = () => {
      const prefix = globalConfig.findRelatedTests
        ? ' related to files matching '
        : ' matching ';

      return (
        chalk.dim(prefix) +
        testPathPatternToRegExp(globalConfig.testPathPattern).toString()
      );
    };

    const testInfo = globalConfig.onlyChanged
      ? chalk.dim(' related to changed files')
      : globalConfig.testPathPattern ? getMatchingTestsInfo() : '';

    const nameInfo = globalConfig.testNamePattern
      ? chalk.dim(' with tests matching ') + `"${globalConfig.testNamePattern}"`
      : '';

    const contextInfo =
      contexts.size > 1
        ? chalk.dim(' in ') + contexts.size + chalk.dim(' projects')
        : '';

    return (
      chalk.dim('Ran all test suites') +
      testInfo +
      nameInfo +
      contextInfo +
      chalk.dim('.')
    );
  }
}

module.exports = SummaryReporter;
