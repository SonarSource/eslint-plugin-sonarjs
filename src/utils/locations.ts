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
import { Rule } from "eslint";
import * as estree from "estree";

/**
 * Returns a location of the "main" function token:
 * - function name for a function declaration, method or accessor
 * - "function" keyword for a function expression
 * - "=>" for an arrow function
 */
export function getMainFunctionTokenLocation(
  fn: estree.Function,
  parent: estree.Node | undefined,
  context: Rule.RuleContext,
) {
  let location: estree.SourceLocation | null | undefined;

  if (fn.type === "FunctionDeclaration") {
    // `fn.id` can be null when it is `export default function` (despite of the @types/estree definition)
    if (fn.id) {
      location = fn.id.loc;
    } else {
      const token = getTokenByValue(fn, "function", context);
      location = token && token.loc;
    }
  } else if (fn.type === "FunctionExpression") {
    if (parent && (parent.type === "MethodDefinition" || parent.type === "Property")) {
      location = parent.key.loc;
    } else {
      const token = getTokenByValue(fn, "function", context);
      location = token && token.loc;
    }
  } else if (fn.type === "ArrowFunctionExpression") {
    const token = context
      .getSourceCode()
      .getTokensBefore(fn.body)
      .reverse()
      .find(token => token.value === "=>");

    location = token && token.loc;
  }

  return location!;
}

function getTokenByValue(node: estree.Node, value: string, context: Rule.RuleContext) {
  return context
    .getSourceCode()
    .getTokens(node)
    .find(token => token.value === value);
}
