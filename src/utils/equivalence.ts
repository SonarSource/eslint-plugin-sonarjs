import { Node } from "estree";
import { SourceCode, AST } from "eslint";

/**
 * Equivalence is implemented by comparing node types and their tokens.
 * Classic implementation would recursively compare children,
 * but "estree" doesn't provide access to children when node type is unknown
 */
export function areEquivalent(first: Node | Node[], second: Node | Node[], sourceCode: SourceCode): boolean {
  if (Array.isArray(first) && Array.isArray(second)) {
    return (
      first.length === second.length &&
      first.every((firstNode, index) => areEquivalent(firstNode, second[index], sourceCode))
    );
  } else if (!Array.isArray(first) && !Array.isArray(second)) {
    return first.type === second.type && compareTokens(sourceCode.getTokens(first), sourceCode.getTokens(second));
  }
  return false;
}

function compareTokens(firstTokens: AST.Token[], secondTokens: AST.Token[]) {
  return (
    firstTokens.length === secondTokens.length &&
    firstTokens.every((firstToken, index) => firstToken.value === secondTokens[index].value)
  );
}
