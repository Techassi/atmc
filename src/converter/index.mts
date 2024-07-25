/* eslint-disable unicorn/prefer-spread */
import type { AbstractBlock, Asciidoctor, Block, Document, ListItem } from '@asciidoctor/core';
import _asciidoctor from '@asciidoctor/core';
import { consola } from 'consola';
import { convertIfInclude } from './helpers.mjs';

const asciidoctor = _asciidoctor as unknown as () => Asciidoctor;

interface State {
  unorderedListLevel: boolean;
  inCalloutList: boolean;
}

const getBlocks = (block: AbstractBlock, depth = 0): AbstractBlock[] => {
  const blocks: AbstractBlock[] = [];

  if (depth > 5)
    return [];


  if (block.hasBlocks()) {
    const subBlocks = block.getBlocks();
    for (const subBlock of subBlocks)
      blocks.push(subBlock, ...getBlocks(subBlock));
  }

  return blocks;
};

const listingToMarkdown = (listing: Block): string => {
  const lines = listing.getSourceLines();
  consola.log(convertIfInclude(lines[0]));
  const content = lines.length === 1 ? convertIfInclude(lines[0]) ?? lines : lines;

  return '```\n'.concat(...content, '\n', '```\n');
};

// eslint-disable-next-line complexity
const blockToMarkdown = (block: AbstractBlock, state: State): string => {
  consola.log(block.getContext());
  switch (block.getContext()) {
    case 'preamble': {
      break;
    }

    case 'paragraph': {
      state.unorderedListLevel = false;
      return `${block.getContent()?.trim() || ''}\n`;
    }

    case 'section': {
      state.unorderedListLevel = false;
      return '#'.repeat(block.getLevel() + 1).concat(` ${block.getTitle() || ''}\n`);
    }

    case 'ulist': {
      state.unorderedListLevel = true;
      break;
    }

    case 'list_item': {
      return `- ${(block as ListItem).getText()}`;
    }

    case 'listing': {
      return listingToMarkdown(block as Block);
    }

    case 'colist': {
      state.inCalloutList = true;
      break;
    }

    default: {
      break;
    }
  }

  return '';
};

const documentToMarkdown = (document: Document, state: State): string => {
  let output = `# ${document.getTitle() || ''} \n\n`;

  const blocks = getBlocks(document);

  for (const block of blocks) {
    const content = blockToMarkdown(block, state);
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

const createState = (): State => {
  return {
    unorderedListLevel: false,
    inCalloutList: false,
  };
};

export const createMarkdownConverter = (files: string[]) => {
  const processor = asciidoctor();
  const states: Map<string, State> = new Map();

  const convert = async () => {
    for await (const file of files) {
      const document = processor.loadFile(file, { parse: true });

      const state = createState();
      states.set(file, state);

      const mdContent = documentToMarkdown(document, state);
      console.log(mdContent);
    }
  };

  return { convert };
};