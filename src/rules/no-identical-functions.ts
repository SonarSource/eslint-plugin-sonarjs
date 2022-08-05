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
// https://sonarsource.github.io/rspec/#/rspec/S4144

import type { TSESTree, TSESLint } from '@typescript-eslint/experimental-utils';
import { areEquivalent } from '../utils/equivalence';
import { getMainFunctionTokenLocation, report, issueLocation } from '../utils/locations';
import docsUrl from '../utils/docs-url';

const DEFAULT_MIN_LINES = 3;

type FunctionNode =
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.ArrowFunctionExpression;

const message =
  'Update this function so that its implementation is not identical to the one on line {{line}}.';

type Options = (number | 'sonar-runtime')[];

const rule: TSESLint.RuleModule<string, Options> = {
  meta: {
    messages: {
      identicalFunctions: message,
      sonarRuntime: '{{sonarRuntimeData}}',
    },
    type: 'problem',
    docs: {
      description: 'Functions should not have identical implementations',
      recommended: 'error',
      url: docsUrl(__filename),
    },
    schema: [
      { type: 'integer', minimum: 3 },
      {
        enum: ['sonar-runtime'],
      },
    ],
  },
  create(context) {
    const functions: Array<{ function: FunctionNode; parent: TSESTree.Node | undefined }> = [];
    const minLines: number =
      typeof context.options[0] === 'number' ? context.options[0] : DEFAULT_MIN_LINES;

    return {
      FunctionDeclaration(node: TSESTree.Node) {
        visitFunction(node as TSESTree.FunctionDeclaration);
      },
      'VariableDeclarator > FunctionExpression, MethodDefinition > FunctionExpression': (
        node: TSESTree.Node,
      ) => {
        visitFunction(node as TSESTree.FunctionExpression);
      },
      'VariableDeclarator > ArrowFunctionExpression, MethodDefinition > ArrowFunctionExpression': (
        node: TSESTree.Node,
      ) => {
        visitFunction(node as TSESTree.ArrowFunctionExpression);
      },

      'Program:exit'() {
        processFunctions();
      },
    };

    function visitFunction(node: FunctionNode) {
      if (isBigEnough(node.body)) {
        functions.push({ function: node, parent: node.parent });
      }
    }

    function processFunctions() {
      for (let i = 1; i < functions.length; i++) {
        const duplicatingFunction = functions[i].function;

        for (let j = 0; j < i; j++) {
          const originalFunction = functions[j].function;

          if (
            areEquivalent(
              duplicatingFunction.body,
              originalFunction.body,
              context.getSourceCode(),
            ) &&
            originalFunction.loc
          ) {
            const loc = getMainFunctionTokenLocation(
              duplicatingFunction,
              functions[i].parent,
              context,
            );
            const originalFunctionLoc = getMainFunctionTokenLocation(
              originalFunction,
              functions[j].parent,
              context,
            );
            const secondaryLocations = [
              issueLocation(originalFunctionLoc, originalFunctionLoc, 'Original implementation'),
            ];
            report(
              context,
              {
                messageId: 'identicalFunctions',
                data: {
                  line: originalFunction.loc.start.line,
                },
                loc,
              },
              secondaryLocations,
              message,
            );
            break;
          }
        }
      }
    }

    function isBigEnough(node: TSESTree.Node) {
      const tokens = context.getSourceCode().getTokens(node);

      if (tokens.length > 0 && tokens[0].value === '{') {
        tokens.shift();
      }

      if (tokens.length > 0 && tokens[tokens.length - 1].value === '}') {
        tokens.pop();
      }

      if (tokens.length > 0) {
        const firstLine = tokens[0].loc.start.line;
        const lastLine = tokens[tokens.length - 1].loc.end.line;

        return lastLine - firstLine + 1 >= minLines;
      }

      return false;
    }
  },
};

export = rule;
