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

#upload to repox QA repository
strace -e trace=open jfrog npm publish --build-name=eslint-plugin-sonarjs --build-number=$BUILD_NUMBER
#publish buildinfo
jfrog rt build-publish eslint-plugin-sonarjs $BUILD_NUMBER
#QA tests could be run now to validate the artifacts and on success we promote.
#configure jfrog cli to be able to promote build
jfrog config edit repox --url $ARTIFACTORY_URL --access-token $ARTIFACTORY_PROMOTE_ACCESS_TOKEN
#promote from QA to public builds
jfrog rt bpr --status it-passed eslint-plugin-sonarjs $BUILD_NUMBER sonarsource-npm-public-builds
