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

// copied from SonarJS for convenience: https://github.com/SonarSource/SonarJS/blob/1d8ca013f6c8e2e31cd12041358ee476096c4e2e/src/linting/eslint/rules/decorators/helpers/merger.ts#L38

import { Rule } from 'eslint';

/**
 * Merges the listeners of an arbitrary number of ESLint-based rules
 *
 * The purpose of this helper function is to merge the behaviour of a
 * variable number of rules. An ESLint rule "listens to" node visits based
 * on a node selector. If the node selector matches, the listener then
 * invokes a callback to proceed further with the node being visited.
 *
 * One needs to pay special attention when merging multiple rules that
 * their respective listeners don't overlap with one another, e.g., two
 * rules listen to `CallExpression` node vists. Unexpected behaviours
 * could happen otherwise.
 *
 * @param rules rules to merge
 * @returns the merge of the rules' listeners
 */
export function mergeRules(...rules: Rule.RuleListener[]): Rule.RuleListener {
  const merged = Object.assign({}, ...rules);

  for (const listener of Object.keys(merged)) {
    merged[listener] = mergeListeners(...rules.map(rule => rule[listener]));
  }
  return merged;
}

function mergeListeners(...listeners: (Function | undefined)[]) {
  return (...args: any[]) => {
    for (const listener of listeners) {
      if (listener) {
        listener(...args);
      }
    }
  };
}
