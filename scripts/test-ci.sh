#!/bin/bash

set -euo pipefail

# run tests with coverage and reports only for nodejs 10
# this is required for sonarcloud analysis
# variable is set in dockerfile
if [ "${SONARCLOUD_ANALYSIS:-}" == "true" ]; then
  echo 'Running tests with coverage and reporter'
  yarn test --coverage --testResultsProcessor jest-sonar-reporter
else
  echo 'Running tests'
  yarn test
fi
