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
// https://sonarsource.github.io/rspec/#/rspec/S3923

import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { Rule } from '../utils/types';
import { isIfStatement } from '../utils/nodes';
import { areEquivalent } from '../utils/equivalence';
import { collectIfBranches, collectSwitchBranches } from '../utils/conditions';
import docsUrl from '../utils/docs-url';

const MESSAGE =
  "Remove this conditional structure or edit its code blocks so that they're not all the same.";
const MESSAGE_CONDITIONAL_EXPRESSION =
  'This conditional operation returns the same value whether the condition is "true" or "false".';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'All branches in a conditional structure should not have exactly the same implementation',
      category: 'Possible Errors',
      recommended: 'error',
      url: docsUrl(__filename),
    },
  },
  create(context: Rule.RuleContext) {
    return {
      IfStatement(node: TSESTree.Node) {
        const ifStmt = node as TSESTree.IfStatement;

        // don't visit `else if` statements
        if (!isIfStatement(node.parent)) {
          const { branches, endsWithElse } = collectIfBranches(ifStmt);
          if (endsWithElse && allDuplicated(branches)) {
            context.report({ message: MESSAGE, node: ifStmt });
          }
        }
      },

      SwitchStatement(node: TSESTree.Node) {
        const switchStmt = node as TSESTree.SwitchStatement;
        const { branches, endsWithDefault } = collectSwitchBranches(switchStmt);
        if (endsWithDefault && allDuplicated(branches)) {
          context.report({ message: MESSAGE, node: switchStmt });
        }
      },

      ConditionalExpression(node: TSESTree.Node) {
        const conditional = node as TSESTree.ConditionalExpression;
        const branches = [conditional.consequent, conditional.alternate];
        if (allDuplicated(branches)) {
          context.report({ message: MESSAGE_CONDITIONAL_EXPRESSION, node: conditional });
        }
      },
    };

    function allDuplicated(branches: Array<TSESTree.Node | TSESTree.Node[]>) {
      return (
        branches.length > 1 &&
        branches.slice(1).every((branch, index) => {
          return areEquivalent(branch, branches[index], context.getSourceCode());
        })
      );
    }
  },
};

export = rule;
