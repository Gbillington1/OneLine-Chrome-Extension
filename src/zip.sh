#!/bin/sh

# build css
npm run build

# clear ../latest_build/
rm -rf ../latest_build/*

# copy css/
cp -r ./css ../latest_build/
cp -r ./html ../latest_build/
cp -r ./js ../latest_build/
cp -r ./images ../latest_build/
cp -r ./webfonts ../latest_build/
cp ./manifest.json ../latest_build/

BUILD_VERSION=$(jq -r '.version' manifest.json)
# zip ../latest_build/ into OneLine_v$BUILD_VERSION.zip
cd ../latest_build/
zip -r OneLine_v$BUILD_VERSION.zip *