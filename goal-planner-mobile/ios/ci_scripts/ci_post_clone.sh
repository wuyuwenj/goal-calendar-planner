#!/bin/bash
set -e

echo "=== Xcode Cloud Post-Clone Script ==="
echo "CI_PRIMARY_REPOSITORY_PATH: $CI_PRIMARY_REPOSITORY_PATH"

# Install CocoaPods via Homebrew (avoids Ruby version issues)
echo "Installing CocoaPods via Homebrew..."
brew install cocoapods

echo "CocoaPods version: $(pod --version)"

# Navigate to ios directory and install pods
# The script is at goal-planner-mobile/ios/ci_scripts/, so ios is one level up
cd "$CI_PRIMARY_REPOSITORY_PATH/goal-planner-mobile/ios"
echo "Current directory: $(pwd)"

echo "Running pod install..."
pod install --repo-update

echo "=== CocoaPods installation complete ==="
