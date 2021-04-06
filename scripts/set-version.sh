#!/bin/bash
export VERSION=$(grep version package.json | head -1  | awk -F: '{ print $2 }' | sed 's/[",]//g')
source cirrus-env BUILD
npm version --no-git-tag-version $VERSION-$BUILD_NUMBER