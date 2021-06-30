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

import { TSESTree } from '@typescript-eslint/experimental-utils';
import { Rule } from '../utils/types';

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '"if ... else if" constructs should end with "else" clauses',
      category: 'Best Practices',
      recommended: false,
      url: 'https://github.com/SonarSource/eslint-plugin-sonarjs/blob/master/docs/rules/elseif-without-else',
    },
  },
  create(context: Rule.RuleContext) {
    return {
      IfStatement: (node: TSESTree.Node) => {
        const ifstmt = node as TSESTree.IfStatement;
        if (isElseIf(ifstmt) && !ifstmt.alternate) {
          const sourceCode = context.getSourceCode();
          const elseKeyword = sourceCode.getTokenBefore(
            node,
            token => token.type === 'Keyword' && token.value === 'else',
          );
          const ifKeyword = sourceCode.getFirstToken(
            node,
            token => token.type === 'Keyword' && token.value === 'if',
          );
          context.report({
            message: `Add the missing "else" clause.`,
            loc: {
              start: elseKeyword!.loc.start,
              end: ifKeyword!.loc.end,
            },
          });
        }
      },
    };
  },
};

function isElseIf(node: TSESTree.IfStatement) {
  const { parent } = node;
  return parent?.type === 'IfStatement' && parent.alternate === node;
}

export = rule;
