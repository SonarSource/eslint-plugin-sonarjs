#!/bin/bash

export VERSION=$(grep version package.json | head -1  | awk -F: '{ print $2 }' | sed 's/[",]//g')

export WS_PROJECTNAME="${CIRRUS_REPO_FULL_NAME} ${VERSION}"
export BUILD_NUMBER=${VERSION}

source ws_scan.sh

