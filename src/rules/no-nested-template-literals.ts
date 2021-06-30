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
// https://sonarsource.github.io/rspec/#/rspec/S4624

import { TSESTree } from '@typescript-eslint/experimental-utils';
import { Rule } from '../utils/types';

const message = 'Refactor this code to not use nested template literals.';

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
  },
  create(context: Rule.RuleContext) {
    return {
      'TemplateLiteral TemplateLiteral': (node: TSESTree.Node) => {
        context.report({
          message,
          node,
        });
      },
    };
  },
};

export = rule;
