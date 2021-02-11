#!/bin/bash

set -euo pipefail

# run tests with coverage and reports only for nodejs 10
# this is required for sonarcloud analysis
if [ "${TRAVIS_NODE_VERSION}" = "10" ]; then
  echo 'Running tests with coverage and reporter'
  yarn test --coverage --testResultsProcessor jest-sonar-reporter
else
  echo 'Running tests'
  yarn test
fi
