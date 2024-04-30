#!/bin/bash

set -euo pipefail

source cirrus-env BUILD

echo 'Running tests with coverage and reporter'
npm run test -- --runInBand --coverage --testResultsProcessor jest-sonar-reporter
sonar-scanner \
  -Dsonar.organization=sonarsource \
  -Dsonar.host.url=https://sonarcloud.io \
  -DbuildNumber=$BUILD_NUMBER
