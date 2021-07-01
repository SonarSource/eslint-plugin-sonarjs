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
// https://sonarsource.github.io/rspec/#/rspec/S1264

import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { Rule } from '../utils/types';
import docsUrl from '../utils/docs-url';

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'A "while" loop should be used instead of a "for" loop',
      category: 'Best Practices',
      recommended: 'error',
      url: docsUrl(__filename),
    },
    fixable: 'code',
  },
  create(context: Rule.RuleContext) {
    return {
      ForStatement(node: TSESTree.Node) {
        const forLoop = node as TSESTree.ForStatement;
        const forKeyword = context.getSourceCode().getFirstToken(node);
        if (!forLoop.init && !forLoop.update && forLoop.test && forKeyword) {
          context.report({
            message: `Replace this "for" loop with a "while" loop.`,
            loc: forKeyword.loc,
            fix: getFix(forLoop),
          });
        }
      },
    };

    function getFix(forLoop: TSESTree.ForStatement): any {
      const forLoopRange = forLoop.range;
      const closingParenthesisToken = context.getSourceCode().getTokenBefore(forLoop.body);
      const condition = forLoop.test;

      if (condition && forLoopRange && closingParenthesisToken) {
        return (fixer: TSESLint.RuleFixer) => {
          const start = forLoopRange[0];
          const end = closingParenthesisToken.range[1];
          const conditionText = context.getSourceCode().getText(condition);
          return fixer.replaceTextRange([start, end], `while (${conditionText})`);
        };
      }

      return undefined;
    }
  },
};

export = rule;
