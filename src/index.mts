#! /usr/bin/env node
/* eslint-disable unicorn/prefer-spread */

import { defineCommand, runMain } from 'citty';
import type { AbstractBlock, Asciidoctor, Document } from '@asciidoctor/core';
import _asciidoctor from '@asciidoctor/core';
import { consola } from 'consola';
import { glob } from 'glob';

import { createGlobPattern } from './utils.mjs';

// const asciidoctor = asciidoctorPkg.default;
const asciidoctor = _asciidoctor as unknown as () => Asciidoctor;

const getBlocks = (block: AbstractBlock, depth = 0): any[] => {
  const blocks: any[] = [];

  if (depth > 5)
    return [];


  if (block.hasBlocks()) {
    const subBlocks = block.getBlocks();
    for (const subBlock of subBlocks)
      blocks.push(subBlock, ...getBlocks(subBlock));

  }

  return blocks;
};

const blockToMarkdown = (block: any): string => {
  switch (block.getContext()) {
    case 'preamble': {
      break;
    }

    case 'paragraph': {
      return `${block.getContent()?.trim() || ''} \n`;
    }

    case 'section': {
      return '#'.repeat(block.getLevel() + 1).concat(` ${block.getTitle() || ''} \n`);
    }

    default: {
      break;
    }
  }

  return '';
};

const documentToMarkdown = (document: Document): string => {
  let output = `# ${document.getTitle() || ''} \n\n`;

  const blocks = getBlocks(document);

  for (const block of blocks) {
    const content = blockToMarkdown(block);
    if (content.length > 0)
      output = output.concat(content, '\n');
  }

  return output;
};

declare global {
  interface String {
    insertAt(index: number, content: string): string;
  }
}

String.prototype.insertAt = function (index: number, content: string): string {
  return this.slice(0, Math.max(0, index)).concat(content, this.slice(Math.max(0, index)));
};

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

    for (const file of files) {
      const document = processor.loadFile(file, { parse: true });
      // const metadata = document.getAttributes();
      const mdContent = documentToMarkdown(document);

      consola.log(mdContent);
    }
  },
});

runMain(app);