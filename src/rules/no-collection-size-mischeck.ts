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
// https://sonarsource.github.io/rspec/#/rspec/S3981

import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { Rule } from '../utils/types';
import { isRequiredParserServices, RequiredParserServices } from '../utils/parser-services';
import docsUrl from '../utils/docs-url';

const CollectionLike = ['Array', 'Map', 'Set', 'WeakMap', 'WeakSet'];
const CollectionSizeLike = ['length', 'size'];

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Collection sizes and array length comparisons should make sense',
      category: 'Possible Errors',
      recommended: 'error',
      url: docsUrl(__filename),
    },
  },
  create(context: Rule.RuleContext) {
    const services = context.parserServices;
    const isTypeCheckerAvailable = isRequiredParserServices(services);
    return {
      BinaryExpression: (node: TSESTree.Node) => {
        const expr = node as TSESTree.BinaryExpression;
        if (['<', '>='].includes(expr.operator)) {
          const lhs = expr.left;
          const rhs = expr.right;
          if (isZeroLiteral(rhs) && lhs.type === 'MemberExpression') {
            const { object, property } = lhs;
            if (
              property.type === 'Identifier' &&
              CollectionSizeLike.includes(property.name) &&
              (!isTypeCheckerAvailable || isCollection(object, services!))
            ) {
              context.report({
                message: `Fix this expression; ${property.name} of "${context
                  .getSourceCode()
                  .getText(object)}" is always greater or equal to zero.`,
                node,
              });
            }
          }
        }
      },
    };
  },
};

function isZeroLiteral(node: TSESTree.Node) {
  return node.type === 'Literal' && node.value === 0;
}

function isCollection(node: TSESTree.Node, services: RequiredParserServices) {
  const checker = services.program.getTypeChecker();
  const tp = checker.getTypeAtLocation(services.esTreeNodeToTSNodeMap.get(node));
  return !!tp.symbol && CollectionLike.includes(tp.symbol.name);
}

export = rule;
