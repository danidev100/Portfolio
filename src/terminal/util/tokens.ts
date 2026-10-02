/** Leading whitespace, or a word together with the whitespace that follows it. */
const TOKEN = /^\s+|\S+\s*/g;

/** Splits a text into the chunks a model would stream, without losing a character. */
export function toTokens(text: string): string[] {
  return text.match(TOKEN) ?? [];
}
