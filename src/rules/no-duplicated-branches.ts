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
// https://jira.sonarsource.com/browse/RSPEC-1871

import { Rule } from "eslint";
import * as estree from "estree";
import { getParent, isIfStatement, isBlockStatement } from "../utils/nodes";
import { areEquivalent } from "../utils/equivalence";
import { collectIfBranches, takeWithoutBreak } from "../utils/conditions";

const MESSAGE = "This {{type}}'s code block is the same as the block for the {{type}} on line {{line}}.";

const rule: Rule.RuleModule = {
  create(context: Rule.RuleContext) {
    return {
      IfStatement(node: estree.Node) {
        visitIfStatement(node as estree.IfStatement);
      },
      SwitchStatement(node: estree.Node) {
        visitSwitchStatement(node as estree.SwitchStatement);
      },
    };

    function visitIfStatement(ifStmt: estree.IfStatement) {
      const parent = getParent(context);
      if (!isIfStatement(parent)) {
        const { branches } = collectIfBranches(ifStmt);

        for (let i = 1; i < branches.length; i++) {
          if (hasRequiredSize([branches[i]])) {
            for (let j = 0; j < i; j++) {
              if (compareIfBranches(branches[i], branches[j])) {
                break;
              }
            }
          }
        }
      }
    }

    function visitSwitchStatement({ cases }: estree.SwitchStatement) {
      for (let i = 1; i < cases.length; i++) {
        const firstClauseWithoutBreak = takeWithoutBreak(expandSingleBlockStatement(cases[i].consequent));

        if (hasRequiredSize(firstClauseWithoutBreak)) {
          for (let j = 0; j < i; j++) {
            const secondClauseWithoutBreak = takeWithoutBreak(expandSingleBlockStatement(cases[j].consequent));

            if (areEquivalent(firstClauseWithoutBreak, secondClauseWithoutBreak, context.getSourceCode())) {
              context.report({
                message: MESSAGE,
                data: {
                  type: "case",
                  line: String(cases[j].loc!.start.line),
                },
                node: cases[i],
              });
              break;
            }
          }
        }
      }
    }

    function hasRequiredSize(nodes: estree.Statement[]) {
      if (nodes.length > 0) {
        const tokens = [
          ...context.getSourceCode().getTokens(nodes[0]),
          ...context.getSourceCode().getTokens(nodes[nodes.length - 1]),
        ].filter(token => token.value !== "{" && token.value !== "}");
        return tokens.length > 0 && tokens[tokens.length - 1].loc.end.line > tokens[0].loc.start.line;
      }
      return false;
    }

    function compareIfBranches(a: estree.Statement, b: estree.Statement) {
      const equivalent = areEquivalent(a, b, context.getSourceCode());
      if (equivalent && b.loc) {
        context.report({
          message: MESSAGE,
          data: {
            type: "branch",
            line: String(b.loc.start.line),
          },
          node: a,
        });
      }
      return equivalent;
    }

    function expandSingleBlockStatement(nodes: estree.Statement[]) {
      if (nodes.length === 1) {
        const node = nodes[0];
        if (isBlockStatement(node)) {
          return node.body;
        }
      }
      return nodes;
    }
  },
};

export = rule;
