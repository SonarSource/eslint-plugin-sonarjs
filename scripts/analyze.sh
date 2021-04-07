#!/bin/bash

# analyze only on one axis of node versions, variable is set in dockerfile
if [ ! "${SONARCLOUD_ANALYSIS:-}" == "true" ]; then
  echo 'Analysis ignored'
  exit 0
fi

set -euo pipefail

sonar-scanner \
  -Dsonar.organization=sonarsource \
  -Dsonar.host.url=https://sonarcloud.io
