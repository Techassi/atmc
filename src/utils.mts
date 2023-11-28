export const createGlobPattern = (inputPattern: string): string => {
  return inputPattern.endsWith('.adoc') ? inputPattern : (inputPattern.endsWith('/') ? `${inputPattern}*.adoc` : `${inputPattern}/*.adoc`);
};