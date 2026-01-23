#!/bin/bash
set -e

echo "=== Xcode Cloud Post-Clone Script ==="
echo "CI_PRIMARY_REPOSITORY_PATH: $CI_PRIMARY_REPOSITORY_PATH"

# Disable Homebrew auto-update to speed up builds
export HOMEBREW_NO_AUTO_UPDATE=1
export HOMEBREW_NO_INSTALL_CLEANUP=1

# Install Node.js and CocoaPods via Homebrew
echo "Installing Node.js and CocoaPods via Homebrew..."
brew install node cocoapods

echo "Node version: $(node --version)"
echo "CocoaPods version: $(pod --version)"

# Navigate to project root and install npm dependencies
cd "$CI_PRIMARY_REPOSITORY_PATH/goal-planner-mobile"
echo "Installing npm dependencies..."
npm install

# Navigate to ios directory and install pods
cd ios
echo "Current directory: $(pwd)"

echo "Running pod install..."
pod install --repo-update

echo "=== Setup complete ==="
