#!/bin/bash

# analyze only on one axis of node versions
if [ "${TRAVIS_NODE_VERSION}" != "8" ]; then
  echo 'Analysis ignored (nodejs version is not 8)'
  exit 0
fi

set -euo pipefail

sonar-scanner
