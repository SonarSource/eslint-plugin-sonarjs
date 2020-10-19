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
// https://jira.sonarsource.com/browse/RSPEC-1126

import { Rule } from "eslint";
import * as estree from "estree";
import { isReturnStatement, isBlockStatement, isBooleanLiteral, isIfStatement, getParent } from "../utils/nodes";

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: 'Return of boolean expressions should not be wrapped into an "if-then-else" statement',
      category: "Code Smell Detection",
      recommended: true,
      url:
        "https://github.com/SonarSource/eslint-plugin-sonarjs/blob/master/docs/rules/prefer-single-boolean-return.md",
    },
  },
  create(context: Rule.RuleContext) {
    return {
      IfStatement(node: estree.Node) {
        const ifStmt = node as estree.IfStatement;
        if (
          // ignore `else if`
          !isIfStatement(getParent(context)) &&
          // `ifStmt.alternate` can be `null`, replace it with `undefined` in this case
          returnsBoolean(ifStmt.alternate || undefined) &&
          returnsBoolean(ifStmt.consequent)
        ) {
          context.report({
            message: "Replace this if-then-else statement by a single return statement.",
            node: ifStmt,
          });
        }
      },
    };

    function returnsBoolean(statement: estree.Statement | undefined) {
      return (
        statement !== undefined &&
        (isBlockReturningBooleanLiteral(statement) || isSimpleReturnBooleanLiteral(statement))
      );
    }

    function isBlockReturningBooleanLiteral(statement: estree.Statement) {
      return (
        isBlockStatement(statement) && statement.body.length === 1 && isSimpleReturnBooleanLiteral(statement.body[0])
      );
    }

    function isSimpleReturnBooleanLiteral(statement: estree.Statement) {
      // `statement.argument` can be `null`, replace it with `undefined` in this case
      return isReturnStatement(statement) && isBooleanLiteral(statement.argument || undefined);
    }
  },
};

export = rule;
