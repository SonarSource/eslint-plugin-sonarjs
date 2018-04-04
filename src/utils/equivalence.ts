import { Node } from "estree";
import { SourceCode } from "eslint";

/**
 * Equivalence is implemented by comparing node types and their tokens.
 * Classic implementation would recursively compare children,
 * but "estree" doesn't provide access to children when node type is unknown
 */
export function areEquivalent(first: Node, second: Node, sourceCode: SourceCode): boolean {
  if (first.type !== second.type) {
    return false;
  }

  const firstTokens = sourceCode.getTokens(first);
  const secondTokens = sourceCode.getTokens(second);
  if (firstTokens.length !== secondTokens.length) {
    return false;
  }

  return firstTokens.every((firstToken, index) => firstToken.value === secondTokens[index].value);
}
