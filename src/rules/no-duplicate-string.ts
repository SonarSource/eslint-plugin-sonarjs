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
// https://jira.sonarsource.com/browse/RSPEC-1192

import { Rule } from "eslint";
import { Node, SimpleLiteral } from "estree";
import { getParent } from "../utils/nodes";

// Number of times a literal must be duplicated to trigger an issue
const DEFAULT_THRESHOLD = 3;
const MIN_LENGTH = 10;
const NO_SEPARATOR_REGEXP = /^\w*$/;
const EXCLUDED_CONTEXTS = ["ImportDeclaration", "JSXAttribute", "ExportAllDeclaration", "ExportNamedDeclaration"];
const MESSAGE = "Define a constant instead of duplicating this literal {{times}} times.";

const rule: Rule.RuleModule = {
  meta: {
    schema: [{ type: "integer", minimum: 2 }],
  },

  create(context: Rule.RuleContext) {
    const literalsByValue: Map<string, SimpleLiteral[]> = new Map();
    const threshold: number = context.options[0] !== undefined ? context.options[0] : DEFAULT_THRESHOLD;

    return {
      Literal: (node: Node) => {
        const literal = node as SimpleLiteral;
        const parent = getParent(context);
        if (typeof literal.value === "string" && (parent && parent.type !== "ExpressionStatement")) {
          const stringContent = literal.value.trim();

          if (
            !isExcludedByUsageContext(context, literal) &&
            stringContent.length >= MIN_LENGTH &&
            !stringContent.match(NO_SEPARATOR_REGEXP)
          ) {
            const sameStringLiterals = literalsByValue.get(stringContent) || [];
            sameStringLiterals.push(literal);
            literalsByValue.set(stringContent, sameStringLiterals);
          }
        }
      },

      "Program:exit"() {
        literalsByValue.forEach(literals => {
          if (literals.length >= threshold) {
            context.report({
              message: MESSAGE,
              node: literals[0],
              data: { times: literals.length + "" },
            });
          }
        });
      },
    };
  },
};

function isExcludedByUsageContext(context: Rule.RuleContext, literal: SimpleLiteral) {
  const parent = getParent(context)!;
  const parentType = parent.type;

  return (
    EXCLUDED_CONTEXTS.includes(parentType) || isRequireContext(parent, context) || isObjectPropertyKey(parent, literal)
  );
}

function isRequireContext(parent: Node, context: Rule.RuleContext) {
  return parent.type === "CallExpression" && context.getSourceCode().getText(parent.callee) === "require";
}

function isObjectPropertyKey(parent: Node, literal: SimpleLiteral) {
  return parent.type === "Property" && parent.key === literal;
}

export = rule;
