export type ParsedDocx = { blocks: any[] };

export function parseDocxContent(input?: ArrayBuffer | Uint8Array | string): ParsedDocx {
  // TODO: wire real parser; stub unblocks build
  return { blocks: [] };
}
