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
// https://sonarsource.github.io/rspec/#/rspec/S3699

import { TSESTree } from '@typescript-eslint/experimental-utils';
import { Identifier, Rule } from '../utils/types';
import { isFunctionExpression, isArrowFunctionExpression, isBlockStatement } from '../utils/nodes';
import docsUrl from '../utils/docs-url';

function isReturnValueUsed(callExpr: TSESTree.Node) {
  const { parent } = callExpr;
  if (!parent) {
    return false;
  }

  if (parent.type === 'LogicalExpression') {
    return parent.left === callExpr;
  }

  if (parent.type === 'SequenceExpression') {
    return parent.expressions[parent.expressions.length - 1] === callExpr;
  }

  if (parent.type === 'ConditionalExpression') {
    return parent.test === callExpr;
  }

  return (
    parent.type !== 'ExpressionStatement' &&
    parent.type !== 'ArrowFunctionExpression' &&
    parent.type !== 'UnaryExpression' &&
    parent.type !== 'AwaitExpression' &&
    parent.type !== 'ReturnStatement' &&
    parent.type !== 'ThrowStatement'
  );
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: "The output of functions that don't return anything should not be used",
      category: 'Possible Errors',
      recommended: 'error',
      url: docsUrl(__filename),
    },
  },
  create(context) {
    const callExpressionsToCheck: Map<Identifier, TSESTree.FunctionLike> = new Map();
    const functionsWithReturnValue: Set<TSESTree.FunctionLike> = new Set();

    return {
      CallExpression(node: TSESTree.Node) {
        const callExpr = node as TSESTree.CallExpression;
        if (!isReturnValueUsed(callExpr)) {
          return;
        }
        const scope = context.getScope();
        const reference = scope.references.find(ref => ref.identifier === callExpr.callee);
        if (reference && reference.resolved) {
          const variable = reference.resolved;
          if (variable.defs.length === 1) {
            const definition = variable.defs[0];
            if (definition.type === 'FunctionName') {
              callExpressionsToCheck.set(reference.identifier, definition.node);
            } else if (definition.type === 'Variable') {
              const { init } = definition.node;
              if (init && (isFunctionExpression(init) || isArrowFunctionExpression(init))) {
                callExpressionsToCheck.set(reference.identifier, init);
              }
            }
          }
        }
      },

      ReturnStatement(node: TSESTree.Node) {
        const returnStmt = node as TSESTree.ReturnStatement;
        if (returnStmt.argument) {
          const ancestors = [...context.getAncestors()].reverse();
          const functionNode = ancestors.find(
            node =>
              node.type === 'FunctionExpression' ||
              node.type === 'FunctionDeclaration' ||
              node.type === 'ArrowFunctionExpression',
          );

          functionsWithReturnValue.add(functionNode as TSESTree.FunctionLike);
        }
      },

      ArrowFunctionExpression(node: TSESTree.Node) {
        const arrowFunc = node as TSESTree.ArrowFunctionExpression;
        if (arrowFunc.expression) {
          functionsWithReturnValue.add(arrowFunc);
        }
      },

      ':function'(node: TSESTree.Node) {
        const func = node as
          | TSESTree.FunctionExpression
          | TSESTree.FunctionDeclaration
          | TSESTree.ArrowFunctionExpression;
        if (
          func.async ||
          func.generator ||
          (isBlockStatement(func.body) && func.body.body.length === 0)
        ) {
          functionsWithReturnValue.add(func);
        }
      },

      'Program:exit'() {
        callExpressionsToCheck.forEach((functionDeclaration, callee) => {
          if (!functionsWithReturnValue.has(functionDeclaration)) {
            context.report({
              message: `Remove this use of the output from "{{name}}"; "{{name}}" doesn't return anything.`,
              node: callee,
              data: { name: callee.name },
            });
          }
        });
      },
    };
  },
};

export = rule;
