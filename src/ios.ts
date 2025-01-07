import { setOutput } from "@actions/core";
import { getExecOutput } from "@actions/exec";
import { bumpedVersion } from "./helpers";
import { Output } from "./types";

const MINIMUM_BUILD_NUMBER = 402; // Setting this higher than the known problematic value (398)

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
    return MINIMUM_BUILD_NUMBER;
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

    // Determine new build number
    let newBuildNumber: number;
    if (buildNumber) {
      newBuildNumber = Math.max(
        parseInt(buildNumber),
        currentBuildNumber + 1,
        MINIMUM_BUILD_NUMBER
      );
    } else {
      newBuildNumber = Math.max(currentBuildNumber + 1, MINIMUM_BUILD_NUMBER);
    }

    console.log(`Setting new build number to: ${newBuildNumber}`);

    // Set the new build number
    const { stdout: iosBuildNumber } = await getExecOutput(
      "agvtool",
      ["new-version", "-all", newBuildNumber.toString()],
      { cwd: path }
    );

    // Double-check the new build number
    const verificationNumber = await getCurrentBuildNumber(path);
    console.log(`Verification: new build number is ${verificationNumber}`);

    if (verificationNumber < MINIMUM_BUILD_NUMBER) {
      throw new Error(`Failed to set build number higher than minimum required (${MINIMUM_BUILD_NUMBER})`);
    }

    setOutput(Output.IosBuildNumber, newBuildNumber.toString());
    console.log(`Successfully set new build number to: ${newBuildNumber}`);
    
    // Additional logging for debugging
    console.log('Build number details:');
    console.log(`- Original build number: ${currentBuildNumber}`);
    console.log(`- Minimum required: ${MINIMUM_BUILD_NUMBER}`);
    console.log(`- New build number: ${newBuildNumber}`);
    console.log(`- Verified build number: ${verificationNumber}`);

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
