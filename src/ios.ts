import { setOutput } from "@actions/core";
import { getExecOutput } from "@actions/exec";
import { bumpedVersion } from "./helpers";
import { Output } from "./types";

async function getCurrentBuildNumber(path: string): Promise<number> {
  try {
    const { stdout } = await getExecOutput(
      "agvtool",
      ["what-version", "-terse"],
      { cwd: path }
    );
    return parseInt(stdout.trim());
  } catch (error) {
    console.error("Error getting current build number:", error);
    return 0;
  }
}

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
  try {
    // Get current build number
    const currentBuildNumber = await getCurrentBuildNumber(path);
    console.log(`Current build number: ${currentBuildNumber}`);

    // If buildNumber is provided, ensure it's higher than current
    let newBuildNumber: string;
    if (buildNumber) {
      const providedNumber = parseInt(buildNumber);
      if (providedNumber <= currentBuildNumber) {
        newBuildNumber = (currentBuildNumber + 1).toString();
        console.log(`Provided build number ${buildNumber} is not higher than current ${currentBuildNumber}. Using ${newBuildNumber} instead.`);
      } else {
        newBuildNumber = buildNumber;
      }
    } else {
      // If no build number provided, increment current by 1
      newBuildNumber = (currentBuildNumber + 1).toString();
    }

    // Set the new build number
    const { stdout: iosBuildNumber } = await getExecOutput(
      "agvtool",
      ["new-version", "-all", newBuildNumber],
      { cwd: path }
    );

    // Verify the new build number
    const verificationNumber = await getCurrentBuildNumber(path);
    if (verificationNumber <= currentBuildNumber) {
      throw new Error(`Failed to increment build number. New build number ${verificationNumber} is not higher than ${currentBuildNumber}`);
    }

    setOutput(Output.IosBuildNumber, iosBuildNumber.toString().trim());
    console.log(`Successfully set new build number to: ${newBuildNumber}`);
  } catch (error) {
    console.error("Error in bumpBuildNumber:", error);
    throw error;
  }
}

export async function bumpIosValues({
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
  try {
    await bumpIosVersion(iosPath, bumpType, version);
    await bumpBuildNumber(iosPath, buildNumber);
  } catch (error) {
    console.error("Error in bumpIosValues:", error);
    throw error;
  }
}
