#!/bin/bash
export VERSION=$(grep version package.json | head -1  | awk -F: '{ print $2 }' | sed 's/[",]//g')
source cirrus-env BUILD
npm version $VERSION-$BUILD_NUMBER