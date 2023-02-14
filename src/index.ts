import { setFailed, getInput } from "@actions/core"
import { bumpAndroidValues } from "./android"
import { bumpIosValues } from "./ios"
import { Input } from "./types"

const run = () => {
  const androidPath = getInput(Input.AndroidProjectPath)
  const iosPath = getInput(Input.IosProjectPath)
  const bumpType = getInput(Input.BumpType)
  const versionCode = getInput(Input.VersionCode)
  const buildNumber = getInput(Input.BuildNumber)

  if (androidPath) bumpAndroidValues({ androidPath, versionCode, bumpType })
  if (iosPath) bumpIosValues({ iosPath, buildNumber, bumpType })
}

try {
  run()
} catch (error) {
  setFailed(error.message)
}
