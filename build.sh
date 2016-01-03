#!/bin/bash
set -ex

TARGET=modern-index-pages

cp -R src/ build/
webpack --bail
zip $TARGET.zip -r build/
