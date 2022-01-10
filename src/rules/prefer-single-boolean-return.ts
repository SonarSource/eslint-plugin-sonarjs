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
// https://sonarsource.github.io/rspec/#/rspec/S1126
import type { TSESTree, TSESLint } from '@typescript-eslint/experimental-utils';
import {
  isReturnStatement,
  isBlockStatement,
  isBooleanLiteral,
  isIfStatement,
} from '../utils/nodes';
import docsUrl from '../utils/docs-url';

const rule: TSESLint.RuleModule<string, string[]> = {
  meta: {
    messages: {
      replaceIfThenElseByReturn:
        'Replace this if-then-else statement by a single return statement.',
    },
    schema: [],
    type: 'suggestion',
    docs: {
      description:
        'Return of boolean expressions should not be wrapped into an "if-then-else" statement',
      recommended: 'error',
      url: docsUrl(__filename),
    },
  },
  create(context) {
    return {
      IfStatement(node: TSESTree.IfStatement) {
        if (
          // ignore `else if`
          !isIfStatement(node.parent) &&
          (node.alternate ? returnsBoolean(node.alternate) : hasNextNodeReturnStatement(node)) &&
          returnsBoolean(node.consequent)
        ) {
          context.report({
            messageId: 'replaceIfThenElseByReturn',
            node,
          });
        }
      },
    };

    function hasNextNodeReturnStatement(node: TSESTree.Node) {
      const sourceCode = context.getSourceCode();
      const nextToken = sourceCode.getTokenAfter(node);
      if (nextToken) {
        const nextNode = sourceCode.getNodeByRangeIndex(nextToken.range[0]);
        if (nextNode) {
          return isSimpleReturnBooleanLiteral(nextNode);
        }
      }
      return false;
    }

    function returnsBoolean(statement: TSESTree.Statement | undefined) {
      return (
        statement !== undefined &&
        (isBlockReturningBooleanLiteral(statement) || isSimpleReturnBooleanLiteral(statement))
      );
    }

    function isBlockReturningBooleanLiteral(statement: TSESTree.Statement) {
      return (
        isBlockStatement(statement) &&
        statement.body.length === 1 &&
        isSimpleReturnBooleanLiteral(statement.body[0])
      );
    }

    function isSimpleReturnBooleanLiteral(statement: TSESTree.Node) {
      // `statement.argument` can be `null`, replace it with `undefined` in this case
      return isReturnStatement(statement) && isBooleanLiteral(statement.argument || undefined);
    }
  },
};

export = rule;
