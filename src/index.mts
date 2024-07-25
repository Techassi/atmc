#! /usr/bin/env node
/* eslint-disable unicorn/prefer-spread */

import { defineCommand, runMain } from 'citty';
import { consola } from 'consola';
import { glob } from 'glob';

import { createGlobPattern } from './utils.mjs';
import { createMarkdownConverter } from './converter/index.mjs';

const app = defineCommand({
  meta: {
    name: 'atmc',
    description: 'AsciiDoc to Markdown Converter',
  },
  args: {
    input: {
      description: 'Input file(s), supports glob patterns',
      type: 'positional',
      required: true,
    },
    output: {
      description: 'Output file or directory',
      type: 'positional',
      required: true,
    },
  },
  async run({ args }) {
    // If the user provided a file extension, make sure it is .adoc
    if (args.input.includes('.') && !args.input.endsWith('adoc'))
      consola.error('Only supports files with .adoc file extension');

    // Append *.adoc if needed
    const inputPattern = createGlobPattern(args.input);
    const files = await glob(inputPattern);

    consola.info(`Found ${files.length} AsciiDoc files`);

    const { convert } = createMarkdownConverter(files);
    consola.log(convert());
  },
});

runMain(app);