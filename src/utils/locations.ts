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

import type { TSESTree, TSESLint } from '@typescript-eslint/experimental-utils';
import { Rule } from './types';

export interface IssueLocation {
  column: number;
  line: number;
  endColumn: number;
  endLine: number;
  message?: string;
}

export interface EncodedMessage {
  message: string;
  cost?: number;
  secondaryLocations: IssueLocation[];
}

/**
 * Returns a location of the "main" function token:
 * - function name for a function declaration, method or accessor
 * - "function" keyword for a function expression
 * - "=>" for an arrow function
 */
export function getMainFunctionTokenLocation(
  fn: TSESTree.FunctionLike,
  parent: TSESTree.Node | undefined,
  context: Rule.RuleContext,
) {
  let location: TSESTree.SourceLocation | null | undefined;

  if (fn.type === 'FunctionDeclaration') {
    // `fn.id` can be null when it is `export default function` (despite of the @types/TSESTree definition)
    if (fn.id) {
      location = fn.id.loc;
    } else {
      const token = getTokenByValue(fn, 'function', context);
      location = token && token.loc;
    }
  } else if (fn.type === 'FunctionExpression') {
    if (parent && (parent.type === 'MethodDefinition' || parent.type === 'Property')) {
      location = parent.key.loc;
    } else {
      const token = getTokenByValue(fn, 'function', context);
      location = token && token.loc;
    }
  } else if (fn.type === 'ArrowFunctionExpression') {
    const token = context
      .getSourceCode()
      .getTokensBefore(fn.body)
      .reverse()
      .find(token => token.value === '=>');

    location = token && token.loc;
  }

  return location!;
}

/**
 * Wrapper for `context.report`, supporting secondary locations and cost.
 * Encode those extra information in the issue message when rule is executed
 * in Sonar* environment.
 */
export function report(
  context: Rule.RuleContext,
  reportDescriptor: Rule.ReportDescriptor,
  secondaryLocations: IssueLocation[] = [],
  cost?: number,
) {
  const { message } = reportDescriptor;
  if (context.options[context.options.length - 1] === 'sonar-runtime') {
    const encodedMessage: EncodedMessage = { secondaryLocations, message: message!, cost };
    reportDescriptor.message = JSON.stringify(encodedMessage);
  }
  context.report(reportDescriptor);
}

/**
 * Converts `SourceLocation` range into `IssueLocation`
 */
export function issueLocation(
  startLoc: TSESTree.SourceLocation,
  endLoc: TSESTree.SourceLocation = startLoc,
  message = '',
): IssueLocation {
  return {
    line: startLoc.start.line,
    column: startLoc.start.column,
    endLine: endLoc.end.line,
    endColumn: endLoc.end.column,
    message,
  };
}

export function toEncodedMessage(
  message: string,
  secondaryLocationsHolder: Array<TSESLint.AST.Token | TSESTree.Node>,
  secondaryMessages?: string[],
  cost?: number,
): string {
  const encodedMessage: EncodedMessage = {
    message,
    cost,
    secondaryLocations: secondaryLocationsHolder.map((locationHolder, index) =>
      toSecondaryLocation(locationHolder, secondaryMessages ? secondaryMessages[index] : undefined),
    ),
  };
  return JSON.stringify(encodedMessage);
}

export function toSecondaryLocation(
  locationHolder: TSESLint.AST.Token | TSESTree.Node,
  message?: string,
): IssueLocation {
  const { loc } = locationHolder;
  return {
    message,
    column: loc.start.column,
    line: loc.start.line,
    endColumn: loc.end.column,
    endLine: loc.end.line,
  };
}

function getTokenByValue(node: TSESTree.Node, value: string, context: Rule.RuleContext) {
  return context
    .getSourceCode()
    .getTokens(node)
    .find(token => token.value === value);
}

export function getFirstTokenAfter(
  node: TSESTree.Node,
  context: Rule.RuleContext,
): TSESLint.AST.Token | null {
  return context.getSourceCode().getTokenAfter(node);
}

export function getFirstToken(node: TSESTree.Node, context: Rule.RuleContext): TSESLint.AST.Token {
  return context.getSourceCode().getTokens(node)[0];
}
