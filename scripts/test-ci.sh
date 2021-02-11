#!/bin/bash

set -euo pipefail

# run tests with coverage and reports only for nodejs 10
# this is required for sonarcloud analysis
if [ "${TRAVIS_NODE_VERSION}" = "10" ]; then
  echo 'Running tests with coverage and reporter'
  # install `jest-sonar-reporter` here, because otherwise `yarn install` fails on nodejs
  yarn add jest-sonar-reporter@2.0.0
  yarn test --coverage --testResultsProcessor jest-sonar-reporter
else
  echo 'Running tests'
  yarn test
fi
