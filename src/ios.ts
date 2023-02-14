import { setOutput } from "@actions/core"
import { getExecOutput } from "@actions/exec"
import { bumpedVersion } from "./helpers"
import { Output } from "./types"

async function bumpIosVersion(path: string, bumpType: string) {
  const options = { cwd: path }
  const { stdout: currentIosVersion } = await getExecOutput("agvtool", ["what-marketing-version", "-terse1"], options)
  const version = bumpedVersion(currentIosVersion.toString().trim(), bumpType)

  const { stdout: iosVersion } = await getExecOutput("agvtool", ["new-marketing-version", version], options)
  setOutput(Output.IosVersion, iosVersion.toString().trim())
}

async function bumpBuildNumber(path: string, buildNumber?: string) {
  const params = buildNumber ? ["new-version", "-all", buildNumber] : ["next-version", "-all"]
  const { stdout: iosBuildNumber } = await getExecOutput("agvtool", params, { cwd: path })

  setOutput(Output.IosBuildNumber, iosBuildNumber.toString().trim())
}

export function bumpIosValues({ iosPath, buildNumber, bumpType }: { iosPath: string; buildNumber?: string; bumpType: string }) {
  bumpIosVersion(iosPath, bumpType)
  bumpBuildNumber(iosPath, buildNumber)
}
