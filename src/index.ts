import { setFailed, getInput } from "@actions/core";
import { bumpAndroidValues } from "./android";
import { bumpIosValues } from "./ios";
import { Input } from "./types";

const run = () => {
  const androidPath = getInput(Input.AndroidProjectPath);
  const iosPath = getInput(Input.IosProjectPath);
  const bumpType = getInput(Input.BumpType);
  const versionCode = getInput(Input.VersionCode);
  const buildNumber = getInput(Input.BuildNumber);
  const appVersion = getInput(Input.AppVersion);

  if (androidPath) {
    bumpAndroidValues({
      version: appVersion,
      androidPath,
      versionCode,
      bumpType,
    });
  } else {
    console.log("No android path provided. Skipping...");
  }

  if (iosPath) {
    bumpIosValues({
      version: appVersion,
      iosPath,
      buildNumber,
      bumpType });
  } else {
    console.log("No ios path provided. Skipping...");
  }
};

try {
  run();
} catch (error) {
  setFailed(error.message);
}
