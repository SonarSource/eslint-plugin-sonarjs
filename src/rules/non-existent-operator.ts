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
// https://jira.sonarsource.com/browse/RSPEC-2757

import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { Rule } from '../utils/types';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Non-existent operators "=+", "=-" and "=!" should not be used',
      category: 'Possible Errors',
      recommended: 'error',
      url: 'https://github.com/SonarSource/eslint-plugin-sonarjs/blob/master/docs/rules/non-existent-operator.md',
    },
  },
  create(context) {
    return {
      AssignmentExpression(node: TSESTree.Node) {
        const assignmentExpression = node as TSESTree.AssignmentExpression;
        if (assignmentExpression.operator === '=') {
          checkOperator(context, assignmentExpression.right);
        }
      },
      VariableDeclarator(node: TSESTree.Node) {
        const variableDeclarator = node as TSESTree.VariableDeclarator;
        checkOperator(context, variableDeclarator.init);
      },
    };
  },
};

function checkOperator(context: Rule.RuleContext, unaryNode?: TSESTree.Expression | null) {
  if (
    unaryNode &&
    unaryNode.type === 'UnaryExpression' &&
    isUnaryOperatorOfInterest(unaryNode.operator)
  ) {
    const sourceCode = context.getSourceCode();
    const assignmentOperatorToken = sourceCode.getTokenBefore(
      unaryNode,
      token => token.value === '=',
    );
    const unaryOperatorToken = sourceCode.getFirstToken(unaryNode);
    const expressionFirstToken = sourceCode.getFirstToken(unaryNode.argument);

    if (
      assignmentOperatorToken != null &&
      unaryOperatorToken != null &&
      expressionFirstToken != null &&
      areAdjacent(assignmentOperatorToken, unaryOperatorToken) &&
      !areAdjacent(unaryOperatorToken, expressionFirstToken)
    ) {
      context.report({
        message: `Was "${unaryNode.operator}=" meant instead?`,
        loc: { start: assignmentOperatorToken.loc.start, end: unaryOperatorToken.loc.end },
      });
    }
  }
}

function isUnaryOperatorOfInterest(operator: TSESTree.UnaryExpression['operator']): boolean {
  return operator === '-' || operator === '+' || operator === '!';
}

function areAdjacent(first: TSESLint.AST.Token, second: TSESLint.AST.Token): boolean {
  return (
    first.loc.end.column === second.loc.start.column && first.loc.end.line === second.loc.start.line
  );
}

export = rule;
