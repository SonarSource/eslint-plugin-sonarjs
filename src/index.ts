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
import type { TSESLint } from '@typescript-eslint/utils';
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';
import * as cognitiveComplexity from './rules/cognitive-complexity';
import * as elseifWithoutElse from './rules/elseif-without-else';
import * as maxSwitchCases from './rules/max-switch-cases';
import * as noAllDuplicatedBranches from './rules/no-all-duplicated-branches';
import * as noCollapsibleIf from './rules/no-collapsible-if';
import * as noCollectionSizeMischeck from './rules/no-collection-size-mischeck';
import * as noDuplicateString from './rules/no-duplicate-string';
import * as noDuplicatedBranches from './rules/no-duplicated-branches';
import * as noElementOverwrite from './rules/no-element-overwrite';
import * as noEmptyCollection from './rules/no-empty-collection';
import * as noExtraArguments from './rules/no-extra-arguments';
import * as noGratuitousExpressions from './rules/no-gratuitous-expressions';
import * as noIdenticalConditions from './rules/no-identical-conditions';
import * as noIdenticalExpressions from './rules/no-identical-expressions';
import * as noIdenticalFunctions from './rules/no-identical-functions';
import * as noIgnoredReturn from './rules/no-ignored-return';
import * as noInvertedBooleanCheck from './rules/no-inverted-boolean-check';
import * as noNestedSwitch from './rules/no-nested-switch';
import * as noNestedTemplateLiterals from './rules/no-nested-template-literals';
import * as noOneIterationLoop from './rules/no-one-iteration-loop';
import * as noRedundantBoolean from './rules/no-redundant-boolean';
import * as noRedundantJump from './rules/no-redundant-jump';
import * as noSameLineConditional from './rules/no-same-line-conditional';
import * as noSmallSwitch from './rules/no-small-switch';
import * as noUnusedCollection from './rules/no-unused-collection';
import * as noUseOfEmptyReturnValue from './rules/no-use-of-empty-return-value';
import * as noUselessCatch from './rules/no-useless-catch';
import * as nonExistentOperator from './rules/non-existent-operator';
import * as preferImmediateReturn from './rules/prefer-immediate-return';
import * as preferObjectLiteral from './rules/prefer-object-literal';
import * as preferSingleBooleanReturn from './rules/prefer-single-boolean-return';
import * as preferWhile from './rules/prefer-while';

const rules: Record<string, TSESLint.RuleModule<string, Array<unknown>>> = {
  'cognitive-complexity': cognitiveComplexity,
  'elseif-without-else': elseifWithoutElse,
  'max-switch-cases': maxSwitchCases,
  'no-all-duplicated-branches': noAllDuplicatedBranches,
  'no-collapsible-if': noCollapsibleIf,
  'no-collection-size-mischeck': noCollectionSizeMischeck,
  'no-duplicate-string': noDuplicateString,
  'no-duplicated-branches': noDuplicatedBranches,
  'no-element-overwrite': noElementOverwrite,
  'no-empty-collection': noEmptyCollection,
  'no-extra-arguments': noExtraArguments,
  'no-gratuitous-expressions': noGratuitousExpressions,
  'no-identical-conditions': noIdenticalConditions,
  'no-identical-expressions': noIdenticalExpressions,
  'no-identical-functions': noIdenticalFunctions,
  'no-ignored-return': noIgnoredReturn,
  'no-inverted-boolean-check': noInvertedBooleanCheck,
  'no-nested-switch': noNestedSwitch,
  'no-nested-template-literals': noNestedTemplateLiterals,
  'no-one-iteration-loop': noOneIterationLoop,
  'no-redundant-boolean': noRedundantBoolean,
  'no-redundant-jump': noRedundantJump,
  'no-same-line-conditional': noSameLineConditional,
  'no-small-switch': noSmallSwitch,
  'no-unused-collection': noUnusedCollection,
  'no-use-of-empty-return-value': noUseOfEmptyReturnValue,
  'no-useless-catch': noUselessCatch,
  'non-existent-operator': nonExistentOperator,
  'prefer-immediate-return': preferImmediateReturn,
  'prefer-object-literal': preferObjectLiteral,
  'prefer-single-boolean-return': preferSingleBooleanReturn,
  'prefer-while': preferWhile,
};

const recommendedLegacyConfig: TSESLint.Linter.ConfigType = { plugins: ['sonarjs'], rules: {} };
const recommendedConfig: FlatConfig.Config = {
  plugins: {
    sonarjs: {
      rules,
    },
  },
  rules: {},
};

for (const key in rules) {
  const rule = rules[key];
  const recommended = rule.meta.docs?.recommended;

  recommendedConfig.rules![`sonarjs/${key}`] = recommended === undefined ? 'off' : 'error';
}

recommendedLegacyConfig.rules = recommendedConfig.rules;

const configs = {
  recommended: recommendedConfig,
  'recommended-legacy': recommendedLegacyConfig,
};

export { rules, configs };
