#!/bin/sh

BUILD_DIR="./latest_build"

# build css and bundle project
npm run tailwind-build
npm run build

# clear build folder for new build
rm -rf $BUILD_DIR/*

# copy files to build dir
cp -r ./src/css $BUILD_DIR/
cp -r ./src/html $BUILD_DIR/
cp -r ./src/js $BUILD_DIR/
cp -r ./src/images $BUILD_DIR/
cp -r ./src/webfonts $BUILD_DIR/
cp ./manifest.json $BUILD_DIR/

# zip using version from manifest
BUILD_VERSION=$(jq -r '.version' manifest.json)
cd $BUILD_DIR/
zip -r OneLine_v$BUILD_VERSION.zip *

# remove static files, leaving zip
rm -rf ./css
rm -rf ./html
rm -rf ./images
rm -rf ./js
rm -rf ./webfonts
rm manifest.json