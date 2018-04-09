import { Rule } from "eslint";
import * as estree from "estree";

export function getParent(context: Rule.RuleContext) {
  const ancestors = context.getAncestors();
  return ancestors.length > 0 ? ancestors[ancestors.length - 1] : undefined;
}

export function isBinaryExpression(node: estree.Node): node is estree.BinaryExpression {
  return node.type === "BinaryExpression";
}

export function isBlockStatement(node: estree.Node): node is estree.BlockStatement {
  return node.type === "BlockStatement";
}

export function isBooleanLiteral(node: estree.Node): node is estree.Literal {
  return isLiteral(node) && typeof node.value === "boolean";
}

export function isConditionalExpression(node: estree.Node | undefined): node is estree.ConditionalExpression {
  return node !== undefined && node.type === "ConditionalExpression";
}

export function isFunctionExpression(node: estree.Node | undefined): node is estree.FunctionExpression {
  return node !== undefined && node.type === "FunctionExpression";
}

export function isArrowFunctionExpression(node: estree.Node | undefined): node is estree.ArrowFunctionExpression {
  return node !== undefined && node.type === "ArrowFunctionExpression";
}

export function isIdentifier(node: estree.Node): node is estree.Identifier {
  return node.type === "Identifier";
}

export function isIfStatement(node: estree.Node | undefined): node is estree.IfStatement {
  return node !== undefined && node.type === "IfStatement";
}

export function isLiteral(node: estree.Node): node is estree.Literal {
  return node.type === "Literal";
}

export function isLogicalExpression(node: estree.Node): node is estree.LogicalExpression {
  return node.type === "LogicalExpression";
}

export function isNumericLiteral(node: estree.Node): node is estree.Literal {
  return isLiteral(node) && typeof node.value === "number";
}
