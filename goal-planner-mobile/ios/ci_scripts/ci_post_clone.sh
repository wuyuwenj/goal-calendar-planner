#!/bin/bash
set -e

echo "=== Xcode Cloud Post-Clone Script ==="
echo "CI_PRIMARY_REPOSITORY_PATH: $CI_PRIMARY_REPOSITORY_PATH"

# Install CocoaPods via Homebrew (avoids Ruby version issues)
echo "Installing CocoaPods via Homebrew..."
brew install cocoapods

echo "CocoaPods version: $(pod --version)"

# Navigate to ios directory and install pods
cd "$CI_PRIMARY_REPOSITORY_PATH/ios"
echo "Current directory: $(pwd)"

echo "Running pod install..."
pod install --repo-update

echo "=== CocoaPods installation complete ==="
