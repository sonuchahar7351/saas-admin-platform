export function textToTipTapJson(text: string) {
  const paragraphs = text
    .split(/\n\s*\n/) // split on blank lines
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    type: 'doc',
    content: paragraphs.map((p) => ({
      type: 'paragraph',
      content: [{ type: 'text', text: p }],
    })),
  };
}
