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
// https://sonarsource.github.io/rspec/#/rspec/S1862

import type { TSESTree, TSESLint } from '@typescript-eslint/experimental-utils';
import { isIfStatement } from '../utils/nodes';
import { areEquivalent } from '../utils/equivalence';
import { report, issueLocation } from '../utils/locations';
import docsUrl from '../utils/docs-url';

const duplicatedBranchMessage = 'This branch duplicates the one on line {{line}}';
const duplicatedCaseMessage = 'This case duplicates the one on line {{line}}';

const rule: TSESLint.RuleModule<string, string[]> = {
  meta: {
    messages: {
      duplicatedBranch: duplicatedBranchMessage,
      duplicatedCase: duplicatedCaseMessage,
      sonarRuntime: '{{sonarRuntimeData}}',
    },
    type: 'problem',
    docs: {
      description:
        'Related "if-else-if" and "switch-case" statements should not have the same condition',
      recommended: 'error',
      url: docsUrl(__filename),
    },
    schema: [
      {
        // internal parameter
        enum: ['sonar-runtime'],
      },
    ],
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    return {
      IfStatement(node: TSESTree.Node) {
        const ifStmt = node as TSESTree.IfStatement;
        const condition = ifStmt.test;
        let statement = ifStmt.alternate;
        while (statement) {
          if (isIfStatement(statement)) {
            if (areEquivalent(condition, statement.test, sourceCode)) {
              const line = ifStmt.loc && ifStmt.loc.start.line;
              if (line && condition.loc) {
                report(
                  context,
                  {
                    messageId: 'duplicatedBranch',
                    data: {
                      line,
                    },
                    node: statement.test,
                  },
                  [issueLocation(condition.loc, condition.loc, 'Original')],
                  duplicatedBranchMessage,
                );
              }
            }
            statement = statement.alternate;
          } else {
            break;
          }
        }
      },
      SwitchStatement(node: TSESTree.Node) {
        const switchStmt = node as TSESTree.SwitchStatement;
        const previousTests: TSESTree.Expression[] = [];
        for (const switchCase of switchStmt.cases) {
          if (switchCase.test) {
            const { test } = switchCase;
            const duplicateTest = previousTests.find(previousTest =>
              areEquivalent(test, previousTest, sourceCode),
            );
            if (duplicateTest) {
              report(
                context,
                {
                  messageId: 'duplicatedCase',
                  data: {
                    line: duplicateTest.loc.start.line,
                  },
                  node: test,
                },
                [issueLocation(duplicateTest.loc, duplicateTest.loc, 'Original')],
                duplicatedCaseMessage,
              );
            } else {
              previousTests.push(test);
            }
          }
        }
      },
    };
  },
};

export = rule;
