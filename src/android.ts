import { bumpedVersion } from "./helpers";

import { setOutput } from '@actions/core'
import { readFile, writeFile } from 'fs'
import { Output } from "./types";

const versionCodeRegex = new RegExp(/^(\s*versionCode(?:\s|=)\s*)(\d+.*)/, "g");
const versionNameRegex = new RegExp(/(versionName(?:\s|=)*)(.*)/, "g");

const getVersionCodeLine = (versionCodeLine: string, versionCode: string | string[]) => {
  const forceVersionCode = parseInt(typeof versionCode === 'string' ? versionCode : versionCode?.[0]?.toString())
  const versionCodeLineArray = versionCodeLine.split(' ')
  const currentVersionCode = parseInt(versionCodeLineArray.pop()) + 1
  const nextVersionCode = forceVersionCode || currentVersionCode

  setOutput(Output.AndroidVersionCode, nextVersionCode)
  return `${versionCodeLineArray.join(' ')} ${nextVersionCode}`
}

const getVersionNameLine = (versionNameLine: string, bumpType: string) => {
  const versionNameLineArray = versionNameLine.split(' ')
  const currentVersionName = versionNameLineArray.pop().replace(new RegExp('"', 'g'), '')
  const nextVersionName = bumpedVersion(currentVersionName, bumpType)

  setOutput(Output.AndroidVersion, nextVersionName)
  return `${versionNameLineArray.join(' ')} "${nextVersionName}"`
}


export function bumpAndroidValues({ androidPath, versionCode, bumpType }: { androidPath: string; versionCode: string; bumpType: string }) {
  const gradlePath = `${androidPath}/app/build.gradle`

  readFile(gradlePath, 'utf8', (_, data) => {
    const fileLines = data.split("\n")
    const versionCodeLineIndex = fileLines.findIndex(line => line.match(versionCodeRegex))
    const versionNameLineIndex = fileLines.findIndex(line => line.match(versionNameRegex))

    fileLines[versionCodeLineIndex] = getVersionCodeLine(fileLines[versionCodeLineIndex], versionCode)
    fileLines[versionNameLineIndex] = getVersionNameLine(fileLines[versionNameLineIndex], bumpType)

    writeFile(gradlePath, fileLines.join("\n"), (error) => { if (error) throw error })
  })
}

