#!/bin/bash

# analyze only on one axis of node versions, variable is set in dockerfile
if [ ! "${SONARCLOUD_ANALYSIS:-}" == "true" ]; then
  echo 'Analysis and publish ignored'
  exit 0
fi

set -euo pipefail

sonar-scanner \
  -Dsonar.organization=sonarsource \
  -Dsonar.host.url=https://sonarcloud.io

npm publish --registry https://repox.jfrog.io/artifactory/api/npm/sonarsource-npm-public/