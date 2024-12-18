// import { bumpedVersion } from "./helpers";
// import { setOutput } from "@actions/core";
// import { readFile, writeFile } from "fs";
// import { Output } from "./types";

// const versionCodeRegex = new RegExp(/^(\s*versionCode(?:\s|=)\s*)(\d+.*)/, "g");
// const versionNameRegex = new RegExp(/(versionName(?:\s|=)*)(.*)/, "g");

// const getVersionCodeLine = (
//   versionCodeLine: string,
//   versionCode: string | string[]
// ) => {
//   const forceVersionCode = parseInt(
//     typeof versionCode === "string" ? versionCode : versionCode?.[0]?.toString()
//   );
//   const versionCodeLineArray = versionCodeLine.split(" ");
//   const currentVersionCode = parseInt(versionCodeLineArray.pop()) + 1;
//   const nextVersionCode = forceVersionCode || currentVersionCode;

//   setOutput(Output.AndroidVersionCode, nextVersionCode);
//   return `${versionCodeLineArray.join(" ")} ${nextVersionCode}`;
// };

// const getVersionNameLine = (versionNameLine: string, bumpType: string) => {
//   const versionNameLineArray = versionNameLine.split(" ");
//   const currentVersionName = versionNameLineArray
//     .pop()
//     .replace(new RegExp('"', "g"), "");
//   const nextVersionName = bumpedVersion(currentVersionName, bumpType);

//   setOutput(Output.AndroidVersion, nextVersionName);
//   return `${versionNameLineArray.join(" ")} "${nextVersionName}"`;
// };

// export function bumpAndroidValues({
//   version,
//   androidPath,
//   versionCode,
//   bumpType,
// }: {
//   version?: string;
//   androidPath: string;
//   versionCode: string;
//   bumpType: string;
// }) {
//   const gradlePath = `${androidPath}/app/build.gradle`;

//   readFile(gradlePath, "utf8", (_, data) => {
//     const fileLines = data.split("\n");
//     const versionCodeLineIndex = fileLines.findIndex((line) =>
//       line.match(versionCodeRegex)
//     );
//     const versionNameLineIndex = fileLines.findIndex((line) =>
//       line.match(versionNameRegex)
//     );

//     let newVersionName = version; // Initialize with provided version or leave undefined
//     if (versionCodeLineIndex > 0) {
//       fileLines[versionCodeLineIndex] = getVersionCodeLine(
//         fileLines[versionCodeLineIndex],
//         versionCode
//       );
//     }
//     if (versionNameLineIndex > 0 || version) {
//       const computedVersionName = getVersionNameLine(
//         fileLines[versionNameLineIndex],
//         bumpType
//       );
//       newVersionName = newVersionName || computedVersionName.match(/"(.+)"/)?.[1];
//       fileLines[versionNameLineIndex] = newVersionName;
//     }

//     writeFile(gradlePath, fileLines.join("\n"), (error) => {
//       if (error) throw error;

//       // Output the messages with the updated version
//       console.log(
//         `:large_green_circle: A new Android build version ${newVersionName} has been uploaded to Google Play`
//       );
//       console.log(
//         `:large_green_circle: A new Android build version ${newVersionName} has been uploaded to Browserstack`
//       );
//     });
//   });
// }


import { bumpedVersion } from "./helpers";
import { setOutput } from "@actions/core";
import { readFile, writeFile } from "fs";
import { Output } from "./types";

const versionCodeRegex = new RegExp(/^(\s*versionCode(?:\s|=)\s*)(\d+.*)/, "g");
const versionNameRegex = new RegExp(/(versionName(?:\s|=)*)(.*)/, "g");

const getVersionCodeLine = (
  versionCodeLine: string,
  versionCode: string | string[]
) => {
  const forceVersionCode = parseInt(
    typeof versionCode === "string" ? versionCode : versionCode?.[0]?.toString()
  );
  const versionCodeLineArray = versionCodeLine.split(" ");
  const currentVersionCode = parseInt(versionCodeLineArray.pop()) + 1;
  const nextVersionCode = forceVersionCode || currentVersionCode;
  setOutput(Output.AndroidVersionCode, nextVersionCode);
  return `${versionCodeLineArray.join(" ")} ${nextVersionCode}`;
};

const extractVersionName = (versionNameLine: string, bumpType: string, providedVersion?: string) => {
  // First, try the provided version
  if (providedVersion) return providedVersion;

  // Extract version from the line
  const versionMatch = versionNameLine.match(/"([^"]+)"/);
  const currentVersionName = versionMatch ? versionMatch[1] : '';
  
  // Bump the version
  return bumpedVersion(currentVersionName, bumpType);
};

export function bumpAndroidValues({
  version,
  androidPath,
  versionCode,
  bumpType,
}: {
  version?: string;
  androidPath: string;
  versionCode: string;
  bumpType: string;
}) {
  const gradlePath = `${androidPath}/app/build.gradle`;
  readFile(gradlePath, "utf8", (_, data) => {
    const fileLines = data.split("\n");
    const versionCodeLineIndex = fileLines.findIndex((line) =>
      line.match(versionCodeRegex)
    );
    const versionNameLineIndex = fileLines.findIndex((line) =>
      line.match(versionNameRegex)
    );

    // Extract or compute the version name
    const newVersionName = extractVersionName(
      fileLines[versionNameLineIndex], 
      bumpType, 
      version
    );

    // Set the output explicitly
    setOutput(Output.AndroidVersion, newVersionName);

    // Update version code if applicable
    if (versionCodeLineIndex > 0) {
      fileLines[versionCodeLineIndex] = getVersionCodeLine(
        fileLines[versionCodeLineIndex],
        versionCode
      );
    }

    // Update version name line
    if (versionNameLineIndex > 0) {
      const updatedVersionNameLine = fileLines[versionNameLineIndex].replace(
        /"[^"]*"/,
        `"${newVersionName}"`
      );
      fileLines[versionNameLineIndex] = updatedVersionNameLine;
    }

    // Write updated file
    writeFile(gradlePath, fileLines.join("\n"), (error) => {
      if (error) throw error;

      // Log the version
      console.log(
        `:large_green_circle: A new Android build version ${newVersionName} has been uploaded to Google Play`
      );
      console.log(
        `:large_green_circle: A new Android build version ${newVersionName} has been uploaded to Browserstack`
      );
    });
  });
}
