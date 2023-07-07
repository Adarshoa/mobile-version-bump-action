# Mobile Version Bump Action

Bump Android & iOS versions and build numbers in your project.

## Usage

```yaml
name: Bump Version

on:
  push:
    branches:
      - master

jobs:
  bump:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: ults-io/mobile-version-bump-action@v2
        with:
          version-code: 1 # optional param for Android versionCode - if not provided, will be incremented by 1
          build-number: 1 # optional param for iOS build number - if not provided, will be incremented by 1
          android-project-path: ./android # required if you want to trigger Android version bump
          ios-project-path: ./ios # required if you want to trigger iOS version bump
          bump-type: patch # optional param for version bump type - can be one of: major, minor, patch
          app-version: 1.0.0 # optional param for Android & iOS version
```

## Inputs

| Name                   | Description                   | Required |
| ---------------------- | ----------------------------- | -------- |
| `version-code`         | Android versionCode           | No       |
| `build-number`         | iOS build number              | No       |
| `android-project-path` | Path to Android project       | No       |
| `ios-project-path`     | Path to iOS project           | No       |
| `bump-type`            | Version bump type             | No       |
| `app-version`          | App for Android & iOS version | No       |

## Outputs

| Name                   | Description         |
| ---------------------- | ------------------- |
| `android-version-code` | Android versionCode |
| `android-version`      | Android version     |
| `ios-build-number`     | iOS build number    |
| `ios-version`          | iOS version         |
