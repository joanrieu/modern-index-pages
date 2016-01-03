#!/bin/bash -ex

TARGET=modern-index-pages

mkdir $TARGET/
webpack --entry ./index.js --output-path $TARGET/ --output-filename bundle.js
cp icon128.png listener.js manifest.json style.css $TARGET/
zip $TARGET.zip -r $TARGET/
rm -rf $TARGET/
