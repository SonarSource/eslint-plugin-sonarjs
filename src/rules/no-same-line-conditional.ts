/*
 * eslint-plugin-sonarjs
 * Copyright (C) 2018-2021 SonarSource SA
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
// https://jira.sonarsource.com/browse/RSPEC-3972

import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { toEncodedMessage } from '../utils/locations';
import { Rule } from '../utils/types';

interface SiblingIfStatement {
  first: TSESTree.IfStatement;
  following: TSESTree.IfStatement;
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Conditionals should start on new lines',
      category: 'Stylistic Issues',
      recommended: 'error',
      url: 'https://github.com/SonarSource/eslint-plugin-sonarjs/blob/master/docs/rules/no-same-line-conditional.md',
    },
    schema: [
      {
        // internal parameter
        enum: ['sonar-runtime'],
      },
    ],
  },
  create(context: Rule.RuleContext) {
    function checkStatements(statements: TSESTree.Node[]) {
      const sourceCode = context.getSourceCode();
      const siblingIfStatements = getSiblingIfStatements(statements);

      siblingIfStatements.forEach(siblingIfStatement => {
        const precedingIf = siblingIfStatement.first;
        const followingIf = siblingIfStatement.following;
        if (
          !!precedingIf.loc &&
          !!followingIf.loc &&
          precedingIf.loc.end.line === followingIf.loc.start.line &&
          precedingIf.loc.start.line !== followingIf.loc.end.line
        ) {
          const precedingIfLastToken = sourceCode.getLastToken(precedingIf) as TSESLint.AST.Token;
          const followingIfToken = sourceCode.getFirstToken(followingIf) as TSESLint.AST.Token;
          context.report({
            message: toEncodedMessage(`Move this "if" to a new line or add the missing "else".`, [
              precedingIfLastToken,
            ]),
            loc: followingIfToken.loc,
          });
        }
      });
    }

    return {
      Program: (node: TSESTree.Node) => checkStatements((node as TSESTree.Program).body),
      BlockStatement: (node: TSESTree.Node) =>
        checkStatements((node as TSESTree.BlockStatement).body),
      SwitchCase: (node: TSESTree.Node) =>
        checkStatements((node as TSESTree.SwitchCase).consequent),
    };
  },
};

function getSiblingIfStatements(statements: TSESTree.Node[]): SiblingIfStatement[] {
  return statements.reduce<SiblingIfStatement[]>((siblingsArray, statement, currentIndex) => {
    const previousStatement = statements[currentIndex - 1];
    if (
      statement.type === 'IfStatement' &&
      !!previousStatement &&
      previousStatement.type === 'IfStatement'
    ) {
      return [{ first: previousStatement, following: statement }, ...siblingsArray];
    }
    return siblingsArray;
  }, []);
}

export = rule;
