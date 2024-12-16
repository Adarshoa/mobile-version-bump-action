import { setOutput } from "@actions/core";
import { getExecOutput } from "@actions/exec";
import { bumpedVersion } from "./helpers";
import { Output } from "./types";

async function bumpIosVersion(
  path: string,
  bumpType: string,
  version?: string
) {
  const options = { cwd: path };
  const { stdout: currentIosVersion } = await getExecOutput(
    "agvtool",
    ["what-marketing-version", "-terse1"],
    options
  );
  const newVersion =
    version || bumpedVersion(currentIosVersion.toString().trim(), bumpType);

  if (newVersion) {
    const { stdout: iosVersion } = await getExecOutput(
      "agvtool",
      ["new-marketing-version", newVersion],
      options
    );
    setOutput(Output.IosVersion, iosVersion.toString().split('\n')[0].trim().replace(/a \.+$/, ''));
  } else {
    console.log("No version found for path:", path);
  }
}

async function bumpBuildNumber(path: string, buildNumber?: string) {
  const params = buildNumber
    ? ["new-version", "-all", buildNumber]
    : ["next-version", "-all"];
  const { stdout: iosBuildNumber } = await getExecOutput("agvtool", params, {
    cwd: path,
  });

  setOutput(Output.IosBuildNumber, iosBuildNumber.toString().trim());
}

export function bumpIosValues({
  version,
  iosPath,
  buildNumber,
  bumpType,
}: {
  version?: string;
  iosPath: string;
  buildNumber?: string;
  bumpType: string;
}) {
  bumpIosVersion(iosPath, bumpType, version);
  bumpBuildNumber(iosPath, buildNumber);
}
