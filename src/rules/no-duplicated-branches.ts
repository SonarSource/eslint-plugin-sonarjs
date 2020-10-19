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
import { collectIfBranches, takeWithoutBreak, collectSwitchBranches } from "../utils/conditions";
import { report, issueLocation } from "../utils/locations";

const MESSAGE = "This {{type}}'s code block is the same as the block for the {{type}} on line {{line}}.";

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Two branches in a conditional structure should not have exactly the same implementation",
      category: "Code Smell Detection",
      recommended: true,
      url: "https://github.com/SonarSource/eslint-plugin-sonarjs/blob/master/docs/rules/no-duplicated-branches.md",
    },
    schema: [
      {
        // internal parameter
        enum: ["sonar-runtime"],
      },
    ],
  },
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
      if (isIfStatement(parent)) {
        return;
      }
      const { branches, endsWithElse } = collectIfBranches(ifStmt);

      if (allEquivalentWithoutDefault(branches, endsWithElse)) {
        branches.slice(1).forEach((branch, i) => reportIssue(branch, branches[i], "branch"));
        return;
      }

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

    function visitSwitchStatement(switchStmt: estree.SwitchStatement) {
      const { cases } = switchStmt;
      const { endsWithDefault } = collectSwitchBranches(switchStmt);
      const nonEmptyCases = cases.filter((c) => takeWithoutBreak(expandSingleBlockStatement(c.consequent)).length > 0);
      const casesWithoutBreak = nonEmptyCases.map((c) => takeWithoutBreak(expandSingleBlockStatement(c.consequent)));

      if (allEquivalentWithoutDefault(casesWithoutBreak, endsWithDefault)) {
        nonEmptyCases.slice(1).forEach((caseStmt, i) => reportIssue(caseStmt, nonEmptyCases[i], "case"));
        return;
      }

      for (let i = 1; i < cases.length; i++) {
        const firstClauseWithoutBreak = takeWithoutBreak(expandSingleBlockStatement(cases[i].consequent));

        if (hasRequiredSize(firstClauseWithoutBreak)) {
          for (let j = 0; j < i; j++) {
            const secondClauseWithoutBreak = takeWithoutBreak(expandSingleBlockStatement(cases[j].consequent));

            if (areEquivalent(firstClauseWithoutBreak, secondClauseWithoutBreak, context.getSourceCode())) {
              reportIssue(cases[i], cases[j], "case");
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
        ].filter((token) => token.value !== "{" && token.value !== "}");
        return tokens.length > 0 && tokens[tokens.length - 1].loc.end.line > tokens[0].loc.start.line;
      }
      return false;
    }

    function compareIfBranches(a: estree.Statement, b: estree.Statement) {
      const equivalent = areEquivalent(a, b, context.getSourceCode());
      if (equivalent && b.loc) {
        reportIssue(a, b, "branch");
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

    function allEquivalentWithoutDefault(branches: Array<estree.Node | estree.Node[]>, endsWithDefault: boolean) {
      return (
        !endsWithDefault &&
        branches.length > 1 &&
        branches.slice(1).every((branch, index) => areEquivalent(branch, branches[index], context.getSourceCode()))
      );
    }

    function reportIssue(node: estree.Node, equivalentNode: estree.Node, type: string) {
      const equivalentNodeLoc = equivalentNode.loc as estree.SourceLocation;
      report(context, { message: MESSAGE, data: { type, line: String(equivalentNode.loc!.start.line) }, node }, [
        issueLocation(equivalentNodeLoc, equivalentNodeLoc, "Original"),
      ]);
    }
  },
};

export = rule;
