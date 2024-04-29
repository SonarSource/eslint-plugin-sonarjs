#!/bin/bash

set -euo pipefail

# run tests with coverage and reports only for nodejs 12
# this is required for sonarcloud analysis
# variable is set in dockerfile
if [ "${SONARCLOUD_ANALYSIS:-}" == "true" ]; then
  echo 'Running tests with coverage and reporter'
  npm run test -- --runInBand --coverage --testResultsProcessor jest-sonar-reporter
  sonar-scanner \
    -Dsonar.organization=sonarsource \
    -Dsonar.host.url=https://sonarcloud.io \
    -DbuildNumber=$BUILD_NUMBER
else
  echo 'Running tests'
  npm run test
fi
