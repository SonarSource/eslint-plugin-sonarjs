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
// https://sonarsource.github.io/rspec/#/rspec/S1192

import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { Rule } from '../utils/types';
import docsUrl from '../utils/docs-url';
import { issueLocation, report } from '../utils/locations';

// Number of times a literal must be duplicated to trigger an issue
const DEFAULT_THRESHOLD = 3;
const MIN_LENGTH = 10;
const NO_SEPARATOR_REGEXP = /^\w*$/;
const EXCLUDED_CONTEXTS = [
  'ImportDeclaration',
  'JSXAttribute',
  'ExportAllDeclaration',
  'ExportNamedDeclaration',
];
const MESSAGE = 'Define a constant instead of duplicating this literal {{times}} times.';

type Options = [number];

const rule: Rule.RuleModule<string, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'String literals should not be duplicated',
      category: 'Best Practices',
      recommended: 'error',
      url: docsUrl(__filename),
    },
    schema: [
      { type: 'integer', minimum: 2 },
      { enum: ['sonar-runtime'] /* internal parameter for rules having secondary locations */ },
    ],
  },

  create(context) {
    const literalsByValue: Map<string, TSESTree.Literal[]> = new Map();
    const threshold: number =
      context.options[0] !== undefined ? context.options[0] : DEFAULT_THRESHOLD;

    return {
      Literal: (node: TSESTree.Node) => {
        const literal = node as TSESTree.Literal;
        const { parent } = literal;
        if (
          typeof literal.value === 'string' &&
          parent &&
          !['ExpressionStatement', 'TSLiteralType'].includes(parent.type)
        ) {
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

      'Program:exit'() {
        literalsByValue.forEach(literals => {
          if (literals.length >= threshold) {
            const [primaryNode, ...secondaryNodes] = literals;
            const secondaryIssues = secondaryNodes.map(node =>
              issueLocation(node.loc, node.loc, 'Duplication'),
            );
            report(
              context,
              { message: MESSAGE, node: primaryNode, data: { times: literals.length.toString() } },
              secondaryIssues,
            );
          }
        });
      },
    };
  },
};

function isExcludedByUsageContext(context: Rule.RuleContext, literal: TSESTree.Literal) {
  const parent = literal.parent!;
  const parentType = parent.type;

  return (
    EXCLUDED_CONTEXTS.includes(parentType) ||
    isRequireContext(parent, context) ||
    isObjectPropertyKey(parent, literal)
  );
}

function isRequireContext(parent: TSESTree.Node, context: Rule.RuleContext) {
  return (
    parent.type === 'CallExpression' && context.getSourceCode().getText(parent.callee) === 'require'
  );
}

function isObjectPropertyKey(parent: TSESTree.Node, literal: TSESTree.Literal) {
  return parent.type === 'Property' && parent.key === literal;
}

export = rule;
