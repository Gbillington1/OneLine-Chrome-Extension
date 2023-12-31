#!/bin/sh
BUILD_DIR = "./test_build"
# build css
npm run tailwind-build

# bundle application
npm run build

rm -rf ./$BUILD_DIR/*

# copy css/
cp -r ./dist/css ./$BUILD_DIR/
cp -r ./dist/html ./$BUILD_DIR/
cp -r ./dist/js ./$BUILD_DIR/
cp -r ./dist/images ./$BUILD_DIR/
cp -r ./dist/webfonts ./$BUILD_DIR/
cp ./manifest.json ./$BUILD_DIR/

# zip using version from manifest
BUILD_VERSION=$(jq -r '.version' manifest.json)
cd ./$BUILD_DIR/
zip -r OneLine_v$BUILD_VERSION.zip *

rm -rf ./css
rm -rf ./html
rm -rf ./js
rm -rf ./images
rm -rf ./webfonts
rm ./mainfest.json
