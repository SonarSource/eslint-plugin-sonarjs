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

const message = 'This branch duplicates the one on line {{line}}';

const rule: TSESLint.RuleModule<string, string[]> = {
  meta: {
    messages: {
      duplicatedBranch: message,
      sonarRuntime: '{{sonarRuntimeData}}',
    },
    type: 'problem',
    docs: {
      description: 'Related "if/else if" statements should not have the same condition',
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
    return {
      IfStatement(node: TSESTree.Node) {
        const ifStmt = node as TSESTree.IfStatement;
        const condition = ifStmt.test;
        let statement = ifStmt.alternate;
        while (statement) {
          if (isIfStatement(statement)) {
            if (areEquivalent(condition, statement.test, context.getSourceCode())) {
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
                  message,
                );
              }
            }
            statement = statement.alternate;
          } else {
            break;
          }
        }
      },
    };
  },
};

export = rule;
