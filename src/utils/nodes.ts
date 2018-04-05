import { Node, Identifier, Literal, BinaryExpression, LogicalExpression } from "estree";

export function isBinaryExpression(node: Node): node is BinaryExpression {
  return node.type === "BinaryExpression";
}

export function isIdentifier(node: Node): node is Identifier {
  return node.type === "Identifier";
}

export function isLiteral(node: Node): node is Literal {
  return node.type === "Literal";
}

export function isLogicalExpression(node: Node): node is LogicalExpression {
  return node.type === "LogicalExpression";
}

export function isNumericLiteral(node: Node): node is Literal {
  return isLiteral(node) && typeof node.value === "number";
}
