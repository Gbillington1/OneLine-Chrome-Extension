#!/bin/sh

# build css
npm run build

rm -rf ./latest_build/*

# copy css/
cp -r ./src/css ./latest_build/
cp -r ./src/html ./latest_build/
cp -r ./src/js ./latest_build/
cp -r ./src/images ./latest_build/
cp -r ./src/webfonts ./latest_build/
cp ./manifest.json ./latest_build/

# zip using version from manifest
BUILD_VERSION=$(jq -r '.version' manifest.json)
cd ./latest_build/
zip -r OneLine_v$BUILD_VERSION.zip *