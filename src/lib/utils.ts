// Shortcuts for environment checks
export const hasWindow = window !== undefined;
export const hasHistory = history !== undefined;
export const hasLocation = location !== undefined;
export const hasDocument = document !== undefined;

const pathCleanerRegex = /^(?:\.\.\/|\.\/)+/;

/**
 * Removes any leading '../' or './' from a path.
 * Note that this doesn't resolve the relative path.
 *
 * @param {string} path a path to clean
 * @returns {string} an absolute path
 */
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
