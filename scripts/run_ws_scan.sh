#!/bin/bash

export VERSION=$(grep version package.json | head -1  | awk -F: '{ print $2 }' | sed 's/[",]//g')

export WS_PRODUCTNAME="org.sonarsource.sonarjs:eslint-plugin-sonarjs"
export WS_PROJECTNAME="org.sonarsource.sonarjs:eslint-plugin-sonarjs ${VERSION}"
export BUILD_NUMBER=${VERSION}

source ws_scan.sh

