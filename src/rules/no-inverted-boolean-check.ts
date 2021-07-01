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
// https://jira.sonarsource.com/browse/RSPEC-1940

import { TSESTree } from '@typescript-eslint/experimental-utils';
import { Rule } from '../utils/types';
import { isBinaryExpression } from '../utils/nodes';
import docsUrl from '../utils/docs-url';

const MESSAGE = 'Use the opposite operator ({{invertedOperator}}) instead.';

const invertedOperators: { [operator: string]: string } = {
  '==': '!=',
  '!=': '==',
  '===': '!==',
  '!==': '===',
  '>': '<=',
  '<': '>=',
  '>=': '<',
  '<=': '>',
};

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Boolean checks should not be inverted',
      category: 'Best Practices',
      recommended: 'error',
      url: docsUrl(__filename),
    },
    fixable: 'code',
  },
  create(context) {
    return {
      UnaryExpression: (node: TSESTree.Node) =>
        visitUnaryExpression(node as TSESTree.UnaryExpression, context),
    };
  },
};

function visitUnaryExpression(
  unaryExpression: TSESTree.UnaryExpression,
  context: Rule.RuleContext,
) {
  if (unaryExpression.operator === '!' && isBinaryExpression(unaryExpression.argument)) {
    const condition: TSESTree.BinaryExpression = unaryExpression.argument;
    const invertedOperator = invertedOperators[condition.operator];
    if (invertedOperator) {
      const left = context.getSourceCode().getText(condition.left);
      const right = context.getSourceCode().getText(condition.right);
      context.report({
        message: MESSAGE,
        data: { invertedOperator },
        node: unaryExpression,
        fix: fixer => fixer.replaceText(unaryExpression, `${left} ${invertedOperator} ${right}`),
      });
    }
  }
}

export = rule;
