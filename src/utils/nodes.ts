/*
 * eslint-plugin-sonarjs
 * Copyright (C) 2018-2021 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import { Rule } from 'eslint';
import * as estree from 'estree';

const MODULE_DECLARATION_NODES = [
  'ImportDeclaration',
  'ExportNamedDeclaration',
  'ExportDefaultDeclaration',
  'ExportAllDeclaration',
];

export function getParent(context: Rule.RuleContext) {
  const ancestors = context.getAncestors();
  return ancestors.length > 0 ? ancestors[ancestors.length - 1] : undefined;
}

export function isArrowFunctionExpression(
  node: estree.Node | undefined,
): node is estree.ArrowFunctionExpression {
  return node !== undefined && node.type === 'ArrowFunctionExpression';
}

export function isAssignmentExpression(
  node: estree.Node | undefined,
): node is estree.AssignmentExpression {
  return node !== undefined && node.type === 'AssignmentExpression';
}

export function isBinaryExpression(node: estree.Node | undefined): node is estree.BinaryExpression {
  return node !== undefined && node.type === 'BinaryExpression';
}

export function isBlockStatement(node: estree.Node | undefined): node is estree.BlockStatement {
  return node !== undefined && node.type === 'BlockStatement';
}

export function isBooleanLiteral(node: estree.Node | undefined): node is estree.Literal {
  return isLiteral(node) && typeof node.value === 'boolean';
}

export function isCallExpression(node: estree.Node | undefined): node is estree.CallExpression {
  return node !== undefined && node.type === 'CallExpression';
}

export function isConditionalExpression(
  node: estree.Node | undefined,
): node is estree.ConditionalExpression {
  return node !== undefined && node.type === 'ConditionalExpression';
}

export function isContinueStatement(
  node: estree.Node | undefined,
): node is estree.ContinueStatement {
  return node !== undefined && node.type === 'ContinueStatement';
}

export function isExpressionStatement(
  node: estree.Node | undefined,
): node is estree.ExpressionStatement {
  return node !== undefined && node.type === 'ExpressionStatement';
}

export function isFunctionDeclaration(
  node: estree.Node | undefined,
): node is estree.FunctionDeclaration {
  return node !== undefined && node.type === 'FunctionDeclaration';
}

export function isFunctionExpression(
  node: estree.Node | undefined,
): node is estree.FunctionExpression {
  return node !== undefined && node.type === 'FunctionExpression';
}

export function isIdentifier(node: estree.Node | undefined): node is estree.Identifier {
  return node !== undefined && node.type === 'Identifier';
}

export function isIfStatement(node: estree.Node | undefined): node is estree.IfStatement {
  return node !== undefined && node.type === 'IfStatement';
}

export function isLiteral(node: estree.Node | undefined): node is estree.Literal {
  return node !== undefined && node.type === 'Literal';
}

export function isLogicalExpression(
  node: estree.Node | undefined,
): node is estree.LogicalExpression {
  return node !== undefined && node.type === 'LogicalExpression';
}

export function isMemberExpression(node: estree.Node | undefined): node is estree.MemberExpression {
  return node !== undefined && node.type === 'MemberExpression';
}

export function isModuleDeclaration(
  node: estree.Node | undefined,
): node is estree.ModuleDeclaration {
  return node !== undefined && MODULE_DECLARATION_NODES.includes(node.type);
}

export function isObjectExpression(node: estree.Node | undefined): node is estree.ObjectExpression {
  return node !== undefined && node.type === 'ObjectExpression';
}

export function isReturnStatement(node: estree.Node | undefined): node is estree.ReturnStatement {
  return node !== undefined && node.type === 'ReturnStatement';
}

export function isThrowStatement(node: estree.Node | undefined): node is estree.ThrowStatement {
  return node !== undefined && node.type === 'ThrowStatement';
}

export function isVariableDeclaration(
  node: estree.Node | undefined,
): node is estree.VariableDeclaration {
  return node !== undefined && node.type === 'VariableDeclaration';
}
