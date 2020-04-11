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
// https://jira.sonarsource.com/browse/RSPEC-1862

import { Rule } from "eslint";
import * as estree from "estree";
import { isIfStatement } from "../utils/nodes";
import { areEquivalent } from "../utils/equivalence";
import { report, issueLocation } from "../utils/locations";

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
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
        const ifStmt = node as estree.IfStatement;
        const condition = ifStmt.test;
        let statement = ifStmt.alternate;
        while (statement) {
          if (isIfStatement(statement)) {
            if (areEquivalent(condition, statement.test, context.getSourceCode())) {
              const line = ifStmt.loc && ifStmt.loc.start.line;
              if (line && condition.loc) {
                report(
                  context,
                  {
                    message: `This branch duplicates the one on line ${line}`,
                    node: statement.test,
                  },
                  [issueLocation(condition.loc, condition.loc, "Original")],
                );
              }
            }
            statement = statement.alternate;
          } else {
            break;
          }
        }
      },
    };
  },
};

export = rule;
