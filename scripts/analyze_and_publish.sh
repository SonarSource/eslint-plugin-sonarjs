#!/bin/bash

# analyze only on one axis of node versions, variable is set in dockerfile
if [ ! "${SONARCLOUD_ANALYSIS:-}" == "true" ]; then
  echo 'Analysis and publish ignored'
  exit 0
fi

set -euo pipefail

export VERSION=$(grep version package.json | head -1  | awk -F: '{ print $2 }' | sed 's/[",]//g')
source cirrus-env BUILD
npm version --no-git-tag-version --allow-same-version $VERSION-$BUILD_NUMBER

sonar-scanner \
  -Dsonar.organization=sonarsource \
  -Dsonar.host.url=https://sonarcloud.io \
  -DbuildNumber=$BUILD_NUMBER

jfrog rt npm-publish --build-name=eslint-plugin-sonarjs --build-number=$BUILD_NUMBER
jfrog rt build-publish eslint-plugin-sonarjs $BUILD_NUMBER
jfrog config import $REPOX_CLI_CONFIG_BUILD_PROMOTER
jfrog rt bpr --status it-passed eslint-plugin-sonarjs $BUILD_NUMBER sonarsource-npm-public