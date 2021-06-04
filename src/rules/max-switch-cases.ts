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
// https://jira.sonarsource.com/browse/RSPEC-1479

import { Rule } from 'eslint';
import { Node, SwitchStatement, SwitchCase } from 'estree';

const MESSAGE =
  'Reduce the number of non-empty switch cases from {{numSwitchCases}} to at most {{maxSwitchCases}}.';

const DEFAULT_MAX_SWITCH_CASES = 30;
let maxSwitchCases = DEFAULT_MAX_SWITCH_CASES;

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    schema: [
      {
        type: 'integer',
        minimum: 0,
      },
    ],
  },
  create(context: Rule.RuleContext) {
    if (context.options.length > 0) {
      maxSwitchCases = context.options[0];
    }
    return {
      SwitchStatement: (node: Node) => visitSwitchStatement(node as SwitchStatement, context),
    };
  },
};

function visitSwitchStatement(switchStatement: SwitchStatement, context: Rule.RuleContext) {
  const nonEmptyCases = switchStatement.cases.filter(
    switchCase => switchCase.consequent.length > 0 && !isDefaultCase(switchCase),
  );
  if (nonEmptyCases.length > maxSwitchCases) {
    const switchKeyword = context.getSourceCode().getFirstToken(switchStatement)!;
    context.report({
      message: MESSAGE,
      loc: switchKeyword.loc,
      data: {
        numSwitchCases: nonEmptyCases.length.toString(),
        maxSwitchCases: maxSwitchCases.toString(),
      },
    });
  }
}

function isDefaultCase(switchCase: SwitchCase) {
  return switchCase.test === null;
}

export = rule;
