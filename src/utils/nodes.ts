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
import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';

const MODULE_DECLARATION_NODES = [
  AST_NODE_TYPES.ImportDeclaration,
  AST_NODE_TYPES.ExportNamedDeclaration,
  AST_NODE_TYPES.ExportDefaultDeclaration,
  AST_NODE_TYPES.ExportAllDeclaration,
];

export function isArrowFunctionExpression(
  node: TSESTree.Node | undefined,
): node is TSESTree.ArrowFunctionExpression {
  return node !== undefined && node.type === 'ArrowFunctionExpression';
}

export function isAssignmentExpression(
  node: TSESTree.Node | undefined,
): node is TSESTree.AssignmentExpression {
  return node !== undefined && node.type === 'AssignmentExpression';
}

export function isBinaryExpression(
  node: TSESTree.Node | undefined,
): node is TSESTree.BinaryExpression {
  return node !== undefined && node.type === 'BinaryExpression';
}

export function isBlockStatement(node: TSESTree.Node | undefined): node is TSESTree.BlockStatement {
  return node !== undefined && node.type === 'BlockStatement';
}

export function isBooleanLiteral(node: TSESTree.Node | undefined): node is TSESTree.Literal {
  return isLiteral(node) && typeof node.value === 'boolean';
}

export function isCallExpression(node: TSESTree.Node | undefined): node is TSESTree.CallExpression {
  return node !== undefined && node.type === 'CallExpression';
}

export function isConditionalExpression(
  node: TSESTree.Node | undefined,
): node is TSESTree.ConditionalExpression {
  return node !== undefined && node.type === 'ConditionalExpression';
}

export function isContinueStatement(
  node: TSESTree.Node | undefined,
): node is TSESTree.ContinueStatement {
  return node !== undefined && node.type === 'ContinueStatement';
}

export function isExpressionStatement(
  node: TSESTree.Node | undefined,
): node is TSESTree.ExpressionStatement {
  return node !== undefined && node.type === 'ExpressionStatement';
}

export function isFunctionDeclaration(
  node: TSESTree.Node | undefined,
): node is TSESTree.FunctionDeclaration {
  return node !== undefined && node.type === 'FunctionDeclaration';
}

export function isFunctionExpression(
  node: TSESTree.Node | undefined,
): node is TSESTree.FunctionExpression {
  return node !== undefined && node.type === 'FunctionExpression';
}

export function isIdentifier(node: TSESTree.Node | undefined): node is TSESTree.Identifier {
  return node !== undefined && node.type === 'Identifier';
}

export function isIfStatement(node: TSESTree.Node | undefined): node is TSESTree.IfStatement {
  return node !== undefined && node.type === 'IfStatement';
}

export function isLiteral(node: TSESTree.Node | undefined): node is TSESTree.Literal {
  return node !== undefined && node.type === 'Literal';
}

export function isLogicalExpression(
  node: TSESTree.Node | undefined,
): node is TSESTree.LogicalExpression {
  return node !== undefined && node.type === 'LogicalExpression';
}

export function isMemberExpression(
  node: TSESTree.Node | undefined,
): node is TSESTree.MemberExpression {
  return node !== undefined && node.type === 'MemberExpression';
}

export function isModuleDeclaration(
  node: TSESTree.Node | undefined,
): node is
  | TSESTree.ExportAllDeclaration
  | TSESTree.ExportDefaultDeclaration
  | TSESTree.ExportNamedDeclaration
  | TSESTree.ImportDeclaration {
  return node !== undefined && MODULE_DECLARATION_NODES.includes(node.type);
}

export function isObjectExpression(
  node: TSESTree.Node | undefined,
): node is TSESTree.ObjectExpression {
  return node !== undefined && node.type === 'ObjectExpression';
}

export function isReturnStatement(
  node: TSESTree.Node | undefined,
): node is TSESTree.ReturnStatement {
  return node !== undefined && node.type === 'ReturnStatement';
}

export function isThrowStatement(node: TSESTree.Node | undefined): node is TSESTree.ThrowStatement {
  return node !== undefined && node.type === 'ThrowStatement';
}

export function isVariableDeclaration(
  node: TSESTree.Node | undefined,
): node is TSESTree.VariableDeclaration {
  return node !== undefined && node.type === 'VariableDeclaration';
}
