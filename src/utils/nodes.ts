import { Rule } from "eslint";
import * as estree from "estree";

export function getParent(context: Rule.RuleContext) {
  const ancestors = context.getAncestors();
  return ancestors.length > 0 ? ancestors[ancestors.length - 1] : undefined;
}

export function isArrowFunctionExpression(node: estree.Node | undefined): node is estree.ArrowFunctionExpression {
  return node !== undefined && node.type === "ArrowFunctionExpression";
}

export function isAssignmentExpression(node: estree.Node): node is estree.AssignmentExpression {
  return node.type === "AssignmentExpression";
}

export function isBinaryExpression(node: estree.Node): node is estree.BinaryExpression {
  return node.type === "BinaryExpression";
}

export function isBlockStatement(node: estree.Node | undefined): node is estree.BlockStatement {
  return node !== undefined && node.type === "BlockStatement";
}

export function isBooleanLiteral(node: estree.Node | undefined): node is estree.Literal {
  return isLiteral(node) && typeof node.value === "boolean";
}

export function isCallExpression(node: estree.Node | undefined): node is estree.CallExpression {
  return node !== undefined && node.type === "CallExpression";
}

export function isConditionalExpression(node: estree.Node | undefined): node is estree.ConditionalExpression {
  return node !== undefined && node.type === "ConditionalExpression";
}

export function isContinueStatement(node: estree.Node | undefined): node is estree.ContinueStatement {
  return node !== undefined && node.type === "ContinueStatement";
}

export function isExpressionStatement(node: estree.Node | undefined): node is estree.ExpressionStatement {
  return node !== undefined && node.type === "ExpressionStatement";
}
export function isFunctionDeclaration(node: estree.Node | undefined): node is estree.FunctionDeclaration {
  return node !== undefined && node.type === "FunctionDeclaration";
}

export function isForStatement(node: estree.Node | undefined): node is estree.ForStatement {
  return node !== undefined && node.type === "ForStatement";
}

export function isFunctionExpression(node: estree.Node | undefined): node is estree.FunctionExpression {
  return node !== undefined && node.type === "FunctionExpression";
}

export function isIdentifier(node: estree.Node): node is estree.Identifier {
  return node.type === "Identifier";
}

export function isIfStatement(node: estree.Node | undefined): node is estree.IfStatement {
  return node !== undefined && node.type === "IfStatement";
}

export function isLiteral(node: estree.Node | undefined): node is estree.Literal {
  return node !== undefined && node.type === "Literal";
}

export function isLogicalExpression(node: estree.Node): node is estree.LogicalExpression {
  return node.type === "LogicalExpression";
}

export function isMemberExpression(node: estree.Node | undefined): node is estree.MemberExpression {
  return node !== undefined && node.type === "MemberExpression";
}

export function isMethodDefinition(node: estree.Node | undefined): node is estree.MethodDefinition {
  return node !== undefined && node.type === "MethodDefinition";
}

export function isNumericLiteral(node: estree.Node): node is estree.Literal {
  return isLiteral(node) && typeof node.value === "number";
}

export function isReturnStatement(node: estree.Node | undefined): node is estree.ReturnStatement {
  return node !== undefined && node.type === "ReturnStatement";
}

export function isThrowStatement(node: estree.Node | undefined): node is estree.ThrowStatement {
  return node !== undefined && node.type === "ThrowStatement";
}

export function isVariableDeclaration(node: estree.Node | undefined): node is estree.VariableDeclaration {
  return node !== undefined && node.type === "VariableDeclaration";
}

export function isWhileStatement(node: estree.Node | undefined): node is estree.WhileStatement {
  return node !== undefined && node.type === "WhileStatement";
}
