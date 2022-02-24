// Shortcuts for environment checks
export const hasWindow = window !== undefined;
export const hasHistory = history !== undefined;
export const hasLocation = location !== undefined;
export const hasDocument = document !== undefined;

const pathCleanerRegex = /^(?:\.\.\/|\.\/)+/;

export function makeAbsolutePath(path: string) {
  const alreadyAbsolute = path.startsWith("/");

  if (alreadyAbsolute) {
    return path;
  }

  if (pathCleanerRegex.test(path)) {
    return path.replace(pathCleanerRegex, "/");
  }

  return "/" + path;
}
