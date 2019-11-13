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
// https://jira.sonarsource.com/browse/RSPEC-2428

import { Rule, SourceCode } from "eslint";
import { Node, Statement, Program, Identifier, BlockStatement, Expression } from "estree";
import {
  isModuleDeclaration,
  isVariableDeclaration,
  isObjectExpression,
  isExpressionStatement,
  isAssignmentExpression,
  isMemberExpression,
  isIdentifier,
} from "../utils/nodes";
import { areEquivalent } from "../utils/equivalence";

const MESSAGE =
  "Declare one or more properties of this object inside of the object literal syntax instead of using separate statements.";

const rule: Rule.RuleModule = {
  create(context: Rule.RuleContext) {
    return {
      BlockStatement: (node: Node) => checkObjectInitialization((node as BlockStatement).body, context),
      Program: (node: Node) => {
        const statements = (node as Program).body.filter(
          (statement): statement is Statement => !isModuleDeclaration(statement),
        );
        checkObjectInitialization(statements, context);
      },
    };
  },
};

function checkObjectInitialization(statements: Statement[], context: Rule.RuleContext) {
  let index = 0;
  while (index < statements.length - 1) {
    const objectDeclaration = getObjectDeclaration(statements[index]);
    // eslint-disable-next-line sonarjs/no-collapsible-if
    if (objectDeclaration && isIdentifier(objectDeclaration.id)) {
      if (isPropertyAssignment(statements[index + 1], objectDeclaration.id, context.getSourceCode())) {
        context.report({ message: MESSAGE, node: objectDeclaration });
      }
    }
    index++;
  }
}

function getObjectDeclaration(statement: Statement) {
  if (isVariableDeclaration(statement)) {
    return statement.declarations.find(declaration => !!declaration.init && isEmptyObjectExpression(declaration.init));
  }
  return undefined;
}

function isEmptyObjectExpression(expression: Expression) {
  return isObjectExpression(expression) && expression.properties.length === 0;
}

function isPropertyAssignment(statement: Statement, objectIdentifier: Identifier, sourceCode: SourceCode) {
  if (isExpressionStatement(statement) && isAssignmentExpression(statement.expression)) {
    const { left, right } = statement.expression;
    if (isMemberExpression(left)) {
      return (
        !left.computed &&
        isSingleLineExpression(right, sourceCode) &&
        areEquivalent(left.object, objectIdentifier, sourceCode)
      );
    }
  }
  return false;
}

function isSingleLineExpression(expression: Expression, sourceCode: SourceCode) {
  const first = sourceCode.getFirstToken(expression)!.loc;
  const last = sourceCode.getLastToken(expression)!.loc;
  return first.start.line === last.end.line;
}

export = rule;
