/*
 * eslint-plugin-sonarjs
 * Copyright (C) 2018 SonarSource SA
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
// https://jira.sonarsource.com/browse/RSPEC-3923

import { Rule } from 'eslint';
import * as estree from 'estree';
import { getParent, isIfStatement } from '../utils/nodes';
import { areEquivalent } from '../utils/equivalence';
import { collectIfBranches, collectSwitchBranches } from '../utils/conditions';

const MESSAGE =
  "Remove this conditional structure or edit its code blocks so that they're not all the same.";
const MESSAGE_CONDITIONAL_EXPRESSION =
  'This conditional operation returns the same value whether the condition is "true" or "false".';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
  },
  create(context: Rule.RuleContext) {
    return {
      IfStatement(node: estree.Node) {
        const ifStmt = node as estree.IfStatement;

        // don't visit `else if` statements
        const parent = getParent(context);
        if (!isIfStatement(parent)) {
          const { branches, endsWithElse } = collectIfBranches(ifStmt);
          if (endsWithElse && allDuplicated(branches)) {
            context.report({ message: MESSAGE, node: ifStmt });
          }
        }
      },

      SwitchStatement(node: estree.Node) {
        const switchStmt = node as estree.SwitchStatement;
        const { branches, endsWithDefault } = collectSwitchBranches(switchStmt);
        if (endsWithDefault && allDuplicated(branches)) {
          context.report({ message: MESSAGE, node: switchStmt });
        }
      },

      ConditionalExpression(node: estree.Node) {
        const conditional = node as estree.ConditionalExpression;
        const branches = [conditional.consequent, conditional.alternate];
        if (allDuplicated(branches)) {
          context.report({ message: MESSAGE_CONDITIONAL_EXPRESSION, node: conditional });
        }
      },
    };

    function allDuplicated(branches: Array<estree.Node | estree.Node[]>) {
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
