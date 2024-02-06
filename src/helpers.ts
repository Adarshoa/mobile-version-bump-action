export const bumpedVersion = (version: string, bumpType: string) => {
  const [major, minor, patch] = version
    .replace(new RegExp('"', "g"), "")
    .split(".");

  switch (bumpType) {
    case "major":
      return `${parseInt(major) + 1}.0.0`;
    case "minor":
      return `${major}.${parseInt(minor) + 1}.0`;
    case "patch":
      return `${major}.${minor}.${parseInt(patch) + 1}`;
    default:
      return version;
  }
};
