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
// https://jira.sonarsource.com/browse/RSPEC-4144

import { Rule } from "eslint";
import * as estree from "estree";
import { areEquivalent } from "../utils/equivalence";
import { getMainFunctionTokenLocation, report, issueLocation } from "../utils/locations";
import { getParent } from "../utils/nodes";

const MESSAGE = "Update this function so that its implementation is not identical to the one on line {{line}}.";

const rule: Rule.RuleModule = {
  meta: {
    schema: [
      {
        enum: ["sonar-runtime"],
      },
    ],
  },
  create(context: Rule.RuleContext) {
    const functions: Array<{ function: estree.Function; parent: estree.Node | undefined }> = [];

    return {
      FunctionDeclaration(node: estree.Node) {
        visitFunction(node as estree.FunctionDeclaration);
      },
      FunctionExpression(node: estree.Node) {
        visitFunction(node as estree.FunctionExpression);
      },
      ArrowFunctionExpression(node: estree.Node) {
        visitFunction(node as estree.ArrowFunctionExpression);
      },

      "Program:exit"() {
        processFunctions();
      },
    };

    function visitFunction(node: estree.Function) {
      if (isBigEnough(node.body)) {
        functions.push({ function: node, parent: getParent(context) });
      }
    }

    function processFunctions() {
      if (functions.length < 2) return;

      for (let i = 1; i < functions.length; i++) {
        const duplicatingFunction = functions[i].function;

        for (let j = 0; j < i; j++) {
          const originalFunction = functions[j].function;

          if (
            areEquivalent(duplicatingFunction.body, originalFunction.body, context.getSourceCode()) &&
            originalFunction.loc
          ) {
            const loc = getMainFunctionTokenLocation(duplicatingFunction, functions[i].parent, context);
            const originalFunctionLoc = getMainFunctionTokenLocation(originalFunction, functions[j].parent, context);
            const secondaryLocations = [
              issueLocation(originalFunctionLoc, originalFunctionLoc, "Original implementation"),
            ];
            report(
              context,
              {
                message: MESSAGE,
                data: { line: String(originalFunction.loc.start.line) },
                loc,
              },
              secondaryLocations,
            );
            break;
          }
        }
      }
    }

    function isBigEnough(node: estree.Expression | estree.Statement) {
      const tokens = context.getSourceCode().getTokens(node);

      if (tokens.length > 0 && tokens[0].value === "{") {
        tokens.shift();
      }

      if (tokens.length > 0 && tokens[tokens.length - 1].value === "}") {
        tokens.pop();
      }

      if (tokens.length > 0) {
        const firstLine = tokens[0].loc.start.line;
        const lastLine = tokens[tokens.length - 1].loc.end.line;

        return lastLine - firstLine > 1;
      }

      return false;
    }
  },
};

export = rule;
