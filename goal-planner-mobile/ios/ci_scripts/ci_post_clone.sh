#!/bin/bash
set -e

echo "Installing CocoaPods dependencies..."
cd "$CI_PRIMARY_REPOSITORY_PATH/ios"
pod install

echo "CocoaPods installation complete."
