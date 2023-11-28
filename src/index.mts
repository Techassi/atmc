#! /usr/bin/env node

import { defineCommand, runMain } from 'citty';
import asciidoctor from '@asciidoctor/core';
import { consola } from 'consola';
import { glob } from 'glob';

import { createGlobPattern } from './utils.mjs';

// const asciidoctor = asciidoctorPkg.default;

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

    const processor = asciidoctor();

    const document = processor.loadFile(files[0]);
    consola.log(document);
  },
});

runMain(app);