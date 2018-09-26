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
import { Node, Statement, Program, Identifier, BlockStatement } from "estree";
import {
  isModuleDeclaration,
  isVariableDeclaration,
  isObjectExpression,
  isExpressionStatement,
  isAssignmentExpression,
  isMemberExpression,
  isIdentifier,
  isFunctionLike,
} from "../utils/nodes";
import { areEquivalent } from "../utils/equivalence";

const MESSAGE = "Convert this declaration to object literal syntax.";

const rule: Rule.RuleModule = {
  create(context: Rule.RuleContext) {
    return {
      BlockStatement: (node: Node) => checkPropertyAssignment((node as BlockStatement).body, context),
      Program: (node: Node) => {
        const statements = (node as Program).body.filter(
          (statement): statement is Statement => !isModuleDeclaration(statement),
        );
        checkPropertyAssignment(statements, context);
      },
    };
  },
};

function checkPropertyAssignment(statements: Statement[], context: Rule.RuleContext) {
  let index = 0;
  while (index <= statements.length - 2) {
    const objectDeclaration = getObjectDeclaration(statements[index]);
    if (objectDeclaration && isIdentifier(objectDeclaration.id)) {
      if (isPropertyAssignement(statements[index + 1], objectDeclaration.id, context.getSourceCode())) {
        context.report({ message: MESSAGE, node: objectDeclaration });
      }
    }
    index++;
  }
}

function getObjectDeclaration(statement: Statement) {
  if (isVariableDeclaration(statement)) {
    return statement.declarations.find(declaration => !!declaration.init && isObjectExpression(declaration.init));
  }
  return undefined;
}

function isPropertyAssignement(statement: Statement, objectIdentifier: Identifier, sourceCode: SourceCode) {
  if (isExpressionStatement(statement) && isAssignmentExpression(statement.expression)) {
    const { left, right } = statement.expression;
    if (isMemberExpression(left)) {
      return !left.computed && !isFunctionLike(right) && areEquivalent(left.object, objectIdentifier, sourceCode);
    }
  }
  return false;
}

export = rule;
