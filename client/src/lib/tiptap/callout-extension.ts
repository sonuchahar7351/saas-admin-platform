import { Node, mergeAttributes } from '@tiptap/core';

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      variant: { default: 'info' }, // info | warning | success
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-callout': node.attrs.variant,
        class: `callout callout-${node.attrs.variant}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (variant: string) =>
        ({ commands }: any) =>
          commands.setNode(this.name, { variant }),
    } as any;
  },
});