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

import { TSESTree, TSESLint } from '@typescript-eslint/experimental-utils';
import { isFunctionExpression, isArrowFunctionExpression, isBlockStatement } from '../utils/nodes';
import docsUrl from '../utils/docs-url';

const EMPTY_RETURN_VALUE_KEYWORDS = new Set<TSESTree.AST_NODE_TYPES>([
  TSESTree.AST_NODE_TYPES.TSVoidKeyword,
  TSESTree.AST_NODE_TYPES.TSNeverKeyword,
  TSESTree.AST_NODE_TYPES.TSUndefinedKeyword,
]);

function isReturnValueUsed(callExpr: TSESTree.Node) {
  const { parent } = callExpr;
  if (!parent) {
    return false;
  }

  if (parent.type === TSESTree.AST_NODE_TYPES.LogicalExpression) {
    return parent.left === callExpr;
  }

  if (parent.type === TSESTree.AST_NODE_TYPES.SequenceExpression) {
    return parent.expressions[parent.expressions.length - 1] === callExpr;
  }

  if (parent.type === TSESTree.AST_NODE_TYPES.ConditionalExpression) {
    return parent.test === callExpr;
  }

  return (
    parent.type !== TSESTree.AST_NODE_TYPES.ExpressionStatement &&
    parent.type !== TSESTree.AST_NODE_TYPES.ArrowFunctionExpression &&
    parent.type !== TSESTree.AST_NODE_TYPES.UnaryExpression &&
    parent.type !== TSESTree.AST_NODE_TYPES.AwaitExpression &&
    parent.type !== TSESTree.AST_NODE_TYPES.ReturnStatement &&
    parent.type !== TSESTree.AST_NODE_TYPES.ThrowStatement
  );
}

const rule: TSESLint.RuleModule<string, string[]> = {
  meta: {
    messages: {
      removeUseOfOutput:
        'Remove this use of the output from "{{name}}"; "{{name}}" doesn\'t return anything.',
    },
    schema: [],
    type: 'problem',
    docs: {
      description: "The output of functions that don't return anything should not be used",
      recommended: 'error',
      url: docsUrl(__filename),
    },
  },
  create(context) {
    const callExpressionsToCheck: Map<
      TSESTree.Identifier | TSESTree.JSXIdentifier,
      TSESTree.FunctionLike
    > = new Map();
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
              node.type === TSESTree.AST_NODE_TYPES.FunctionExpression ||
              node.type === TSESTree.AST_NODE_TYPES.FunctionDeclaration ||
              node.type === TSESTree.AST_NODE_TYPES.ArrowFunctionExpression,
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

      TSDeclareFunction(node: TSESTree.Node) {
        const declareFunction = node as TSESTree.TSDeclareFunction;
        if (
          declareFunction.returnType?.typeAnnotation.type &&
          !EMPTY_RETURN_VALUE_KEYWORDS.has(declareFunction.returnType?.typeAnnotation.type)
        ) {
          functionsWithReturnValue.add(declareFunction);
        }
      },

      'Program:exit'() {
        callExpressionsToCheck.forEach((functionDeclaration, callee) => {
          if (!functionsWithReturnValue.has(functionDeclaration)) {
            context.report({
              messageId: 'removeUseOfOutput',
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
