#!/bin/bash

# analyze only on one axis of node versions
if [ "${TRAVIS_NODE_VERSION}" != "8" ]; then
  echo 'Analysis ignored (nodejs version is not 8)'
  exit 0
fi

set -euo pipefail


if [ "${TRAVIS_BRANCH}" == "master" ] && [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  sonar-scanner \
      -Dsonar.analysis.buildNumber=$TRAVIS_BUILD_NUMBER \
      -Dsonar.analysis.pipeline=$TRAVIS_BUILD_NUMBER \
      -Dsonar.analysis.sha1=$TRAVIS_COMMIT  \
      -Dsonar.analysis.repository=$TRAVIS_REPO_SLUG
elif [ "$TRAVIS_PULL_REQUEST" != "false" ]
  sonar-scanner \
      -Dsonar.analysis.buildNumber=$TRAVIS_BUILD_NUMBER \
      -Dsonar.analysis.pipeline=$TRAVIS_BUILD_NUMBER \
      -Dsonar.analysis.sha1=$TRAVIS_PULL_REQUEST_SHA \
      -Dsonar.analysis.repository=$TRAVIS_REPO_SLUG \
      -Dsonar.analysis.prNumber=$TRAVIS_PULL_REQUEST
fi
