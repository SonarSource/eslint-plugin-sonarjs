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
// https://jira.sonarsource.com/browse/RSPEC-1125

import { Rule } from "eslint";
import { BinaryExpression, Node, LogicalExpression, UnaryExpression, Expression } from "estree";
import { getParent, isBooleanLiteral, isIfStatement, isConditionalExpression } from "../utils/nodes";

const MESSAGE = "Remove the unnecessary boolean literal.";

const rule: Rule.RuleModule = {
  create(context: Rule.RuleContext) {
    return {
      BinaryExpression(node: Node) {
        const expression = node as BinaryExpression;
        if (expression.operator === "==" || expression.operator === "!=") {
          checkBooleanLiteral(expression.left);
          checkBooleanLiteral(expression.right);
        }
      },

      LogicalExpression(node: Node) {
        const expression = node as LogicalExpression;
        checkBooleanLiteral(expression.left);

        if (expression.operator === "&&") {
          checkBooleanLiteral(expression.right);
        }

        // ignore `x || true` and `x || false` expressions outside of conditional expressions and `if` statements
        const parent = getParent(context);
        if (
          expression.operator === "||" &&
          ((isConditionalExpression(parent) && parent.test === expression) || isIfStatement(parent))
        ) {
          checkBooleanLiteral(expression.right);
        }
      },

      UnaryExpression(node: Node) {
        const unaryExpression = node as UnaryExpression;
        if (unaryExpression.operator === "!") {
          checkBooleanLiteral(unaryExpression.argument);
        }
      },
    };

    function checkBooleanLiteral(expression: Expression) {
      if (isBooleanLiteral(expression)) {
        context.report({ message: MESSAGE, node: expression });
      }
    }
  },
};

export = rule;
