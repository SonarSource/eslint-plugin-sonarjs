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

type Writeable<T> = { -readonly [P in keyof T]: T[P] };
export type MutableReportDescriptor = Writeable<TSESLint.ReportDescriptor<string>>;

export interface IssueLocation {
  column: number;
  line: number;
  endColumn: number;
  endLine: number;
  message?: string;
  data?: Record<string, unknown>;
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
export function getMainFunctionTokenLocation<T = string>(
  fn: TSESTree.FunctionLike,
  parent: TSESTree.Node | undefined,
  context: TSESLint.RuleContext<string, T[]>,
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
export function report<T = string>(
  context: TSESLint.RuleContext<string, T[]>,
  reportDescriptor: MutableReportDescriptor,
  secondaryLocations: IssueLocation[] = [],
  message: string,
  cost?: number,
) {
  const lastOptionsElement = context.options[context.options.length - 1];

  if (typeof lastOptionsElement !== 'string' || lastOptionsElement !== 'sonar-runtime') {
    context.report(reportDescriptor);

    return;
  }

  const encodedMessage: EncodedMessage = {
    secondaryLocations,
    message: expandMessage(message, reportDescriptor.data),
    cost,
  };
  reportDescriptor.messageId = 'sonarRuntime';

  if (reportDescriptor.data === undefined) {
    reportDescriptor.data = {};
  }

  (reportDescriptor.data as Record<string, unknown>).sonarRuntimeData =
    JSON.stringify(encodedMessage);

  context.report(reportDescriptor);
}

export function expandMessage(
  message: string,
  reportDescriptorData: Record<string, unknown> | undefined,
): string {
  let expandedMessage = message;
  if (reportDescriptorData !== undefined) {
    for (const dataName of Object.keys(reportDescriptorData)) {
      const dataValue = reportDescriptorData[dataName];
      if (
        typeof dataValue === 'string' ||
        typeof dataValue === 'number' ||
        typeof dataValue === 'boolean'
      ) {
        expandedMessage = replaceAll(expandedMessage, `{{${dataName}}}`, dataValue.toString());
      }
    }
  }

  return expandedMessage;
}

function replaceAll(target: string, search: string, replacement: string): string {
  return target.split(search).join(replacement);
}

/**
 * Converts `SourceLocation` range into `IssueLocation`
 */
export function issueLocation(
  startLoc: TSESTree.SourceLocation,
  endLoc: TSESTree.SourceLocation = startLoc,
  message = '',
  data: Record<string, unknown> = {},
): IssueLocation {
  const issueLocation: IssueLocation = {
    line: startLoc.start.line,
    column: startLoc.start.column,
    endLine: endLoc.end.line,
    endColumn: endLoc.end.column,
    message,
  };

  if (data !== undefined && Object.keys(data).length > 0) {
    issueLocation.data = data;
  }

  return issueLocation;
}

export function toEncodedMessage(
  secondaryLocationsHolder: Array<TSESLint.AST.Token | TSESTree.Node>,
  secondaryMessages?: string[],
): string {
  return JSON.stringify(
    secondaryLocationsHolder.map((locationHolder, index) =>
      toSecondaryLocation(locationHolder, secondaryMessages ? secondaryMessages[index] : undefined),
    ),
  );
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

function getTokenByValue<T = string>(
  node: TSESTree.Node,
  value: string,
  context: TSESLint.RuleContext<string, T[]>,
) {
  return context
    .getSourceCode()
    .getTokens(node)
    .find(token => token.value === value);
}

export function getFirstTokenAfter<T = string>(
  node: TSESTree.Node,
  context: TSESLint.RuleContext<string, T[]>,
): TSESLint.AST.Token | null {
  return context.getSourceCode().getTokenAfter(node);
}

export function getFirstToken<T = string>(
  node: TSESTree.Node,
  context: TSESLint.RuleContext<string, T[]>,
): TSESLint.AST.Token {
  return context.getSourceCode().getTokens(node)[0];
}
