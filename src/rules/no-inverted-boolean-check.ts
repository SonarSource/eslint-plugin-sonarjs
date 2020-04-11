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
// https://jira.sonarsource.com/browse/RSPEC-1940

import { Rule } from "eslint";
import { Node, UnaryExpression } from "estree";
import { isBinaryExpression } from "../utils/nodes";

const MESSAGE = "Use the opposite operator ({{invertedOperator}}) instead.";

const invertedOperators: { [operator: string]: string } = {
  "==": "!=",
  "!=": "==",
  "===": "!==",
  "!==": "===",
  ">": "<=",
  "<": ">=",
  ">=": "<",
  "<=": ">",
};

const rule: Rule.RuleModule = {
  meta: {
    fixable: "code",
    type: "suggestion",
  },
  create(context: Rule.RuleContext) {
    return { UnaryExpression: (node: Node) => visitUnaryExpression(node as UnaryExpression, context) };
  },
};

function visitUnaryExpression(unaryExpression: UnaryExpression, context: Rule.RuleContext) {
  if (unaryExpression.operator === "!" && isBinaryExpression(unaryExpression.argument)) {
    const condition = unaryExpression.argument;
    const invertedOperator = invertedOperators[condition.operator];
    if (invertedOperator) {
      const left = context.getSourceCode().getText(condition.left);
      const right = context.getSourceCode().getText(condition.right);
      context.report({
        message: MESSAGE,
        data: { invertedOperator },
        node: unaryExpression,
        fix: fixer => fixer.replaceText(unaryExpression, `${left} ${invertedOperator} ${right}`),
      });
    }
  }
}

export = rule;
