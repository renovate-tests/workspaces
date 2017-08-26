/**
 * Copyright (c) 2014, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * @flow
 */

import type {
  AggregatedResult,
  AggregatedResultWithoutCoverage,
  CoverageMap,
} from 'types/TestResult';

type PhabricatorReport = AggregatedResultWithoutCoverage & {
  coverageMap?: ?{[string]: string},
};

function summarize(coverageMap: CoverageMap) {
  const summaries = Object.create(null);

  coverageMap.files().forEach(file => {
    const covered = [];
    const lineCoverage = coverageMap.fileCoverageFor(file).getLineCoverage();

    Object.keys(lineCoverage).forEach(lineNumber => {
      // Line numbers start at one
      const number = parseInt(lineNumber, 10) - 1;
      covered[number] = lineCoverage[lineNumber] ? 'C' : 'U';
    });

    for (let i = 0; i < covered.length; i++) {
      if (!covered[i]) {
        covered[i] = 'N';
      }
    }

    summaries[file] = covered.join('');
  });

  return summaries;
}

module.exports = function(results: AggregatedResult): PhabricatorReport {
  // $FlowFixMe: This should work, but it does not.
  return Object.assign({}, results, {
    coverageMap: results.coverageMap && summarize(results.coverageMap),
  });
};
