#!/bin/bash
set -e

echo "=== Xcode Cloud Post-Clone Script ==="
echo "CI_PRIMARY_REPOSITORY_PATH: $CI_PRIMARY_REPOSITORY_PATH"

# Install CocoaPods
echo "Installing CocoaPods..."
gem install cocoapods --user-install

# Add gem bin to PATH
export PATH="$HOME/.gem/ruby/$(ruby -e 'puts RUBY_VERSION')/bin:$PATH"

echo "CocoaPods version: $(pod --version)"

# Navigate to ios directory and install pods
cd "$CI_PRIMARY_REPOSITORY_PATH/ios"
echo "Current directory: $(pwd)"

echo "Running pod install..."
pod install --repo-update

echo "=== CocoaPods installation complete ==="
