#!/bin/bash -ex

TARGET=modern-index-pages

rm -rf $TARGET{/,.zip}

cp -R src/ $TARGET/
webpack \
    --entry ./src/index.js \
    --output-path $TARGET/ \
    --output-filename index.js \
    --bail
zip $TARGET.zip -r $TARGET/
rm -rf $TARGET/
