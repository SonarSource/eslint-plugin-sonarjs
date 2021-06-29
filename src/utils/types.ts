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
import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

// utility to make field of the type optional https://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescript
type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export namespace Rule {
  // we should use Optional here, to make either 'messageId' or 'message' mandatory, however something in typescript is broken when I do this
  // this type is quite relaxed, and we should probably make it stronger
  export type ReportDescriptor<TMessageIds extends string = string> = Partial<
    TSESLint.ReportDescriptor<TMessageIds>
  > & { message?: string };

  // redefine TSESLint.RuleContext by omitting report method and re-defining with our RuleDescriptor which allows simple message for reporting
  export type RuleContext<
    TMessageIds extends string = string,
    TOptions extends readonly unknown[] = unknown[],
  > = Omit<TSESLint.RuleContext<TMessageIds, TOptions>, 'report'> & {
    report(descriptor: ReportDescriptor<TMessageIds>): void;
  };

  // this type is based on TSESLint.RuleModule type, but makes messageIds usage optional
  export interface RuleModule<
    TMessageIds extends string = never,
    TOptions extends readonly unknown[] = unknown[],
  > {
    // we don't require 'messages' field in the metadata
    meta: Optional<TSESLint.RuleMetaData<TMessageIds>, 'messages' | 'schema'>;
    create(context: Readonly<RuleContext<TMessageIds, TOptions>>): RuleListener;
  }

  interface RuleListener {
    onCodePathStart?(codePath: CodePath, node: TSESTree.Node): void;

    onCodePathEnd?(codePath: CodePath, node: TSESTree.Node): void;

    onCodePathSegmentStart?(segment: CodePathSegment, node: TSESTree.Node): void;

    onCodePathSegmentEnd?(segment: CodePathSegment, node: TSESTree.Node): void;

    onCodePathSegmentLoop?(
      fromSegment: CodePathSegment,
      toSegment: CodePathSegment,
      node: TSESTree.Node,
    ): void;

    [key: string]:
      | ((codePath: CodePath, node: TSESTree.Node) => void)
      | ((segment: CodePathSegment, node: TSESTree.Node) => void)
      | ((fromSegment: CodePathSegment, toSegment: CodePathSegment, node: TSESTree.Node) => void)
      | ((node: TSESTree.Node) => void)
      | undefined;
  }

  export interface CodePath {
    id: string;
    initialSegment: CodePathSegment;
    finalSegments: CodePathSegment[];
    returnedSegments: CodePathSegment[];
    thrownSegments: CodePathSegment[];
    currentSegments: CodePathSegment[];
    upper: CodePath | null;
    childCodePaths: CodePath[];
  }

  export interface CodePathSegment {
    id: string;
    nextSegments: CodePathSegment[];
    prevSegments: CodePathSegment[];
    reachable: boolean;
  }
}

export type Identifier = TSESTree.Identifier | TSESTree.JSXIdentifier;
