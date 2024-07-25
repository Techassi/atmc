const includeRegex = /link:([\d$.A-Za-z-]+)\[role=include]/;

export const detectInclude = (input: string): string | undefined => {
  const matches = input.match(includeRegex);

  if (matches === null || matches.length > 2)
    return undefined;

  // eslint-disable-next-line consistent-return
  return matches[1];
};

export const convertInclude = (include: string): string => {
  return `--8<-- "${include}"`;
};

export const convertIfInclude = (input: string): string | undefined => {
  const include = detectInclude(input);

  if (include === undefined)
    return undefined;

  // eslint-disable-next-line consistent-return
  return convertInclude(include);
};
