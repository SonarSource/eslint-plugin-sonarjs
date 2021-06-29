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
// https://jira.sonarsource.com/browse/RSPEC-1751

import { Rule } from 'eslint';
import { Node, WhileStatement, ForStatement } from 'estree';
import { isContinueStatement, getParent } from '../utils/nodes';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
  },
  create(context: Rule.RuleContext) {
    const loopingNodes: Set<Node> = new Set();
    const loops: Set<Node> = new Set();
    const loopsAndTheirSegments: Array<{
      loop: WhileStatement | ForStatement;
      segments: Rule.CodePathSegment[];
    }> = [];
    const currentCodePaths: Rule.CodePath[] = [];

    return {
      ForStatement(node: Node) {
        loops.add(node);
      },
      WhileStatement(node: Node) {
        loops.add(node);
      },
      DoWhileStatement(node: Node) {
        loops.add(node);
      },

      onCodePathStart(codePath: Rule.CodePath) {
        currentCodePaths.push(codePath);
      },

      onCodePathEnd() {
        currentCodePaths.pop();
      },

      'WhileStatement > *'() {
        const parent = getParent(context);
        visitLoopChild(parent as WhileStatement);
      },

      'ForStatement > *'() {
        const parent = getParent(context);
        visitLoopChild(parent as ForStatement);
      },

      onCodePathSegmentLoop(_, toSegment: Rule.CodePathSegment, node: Node) {
        if (isContinueStatement(node)) {
          loopsAndTheirSegments.forEach(({ segments, loop }) => {
            if (segments.includes(toSegment)) {
              loopingNodes.add(loop);
            }
          });
        } else {
          loopingNodes.add(node);
        }
      },

      'Program:exit'() {
        loops.forEach(loop => {
          if (!loopingNodes.has(loop)) {
            context.report({
              message: 'Refactor this loop to do more than one iteration.',
              loc: context.getSourceCode().getFirstToken(loop)!.loc,
            });
          }
        });
      },
    };

    // Required to correctly process "continue" looping.
    // When a loop has a "continue" statement, this "continue" statement triggers a "onCodePathSegmentLoop" event,
    // and the corresponding event node is that "continue" statement. Current implementation is based on the fact
    // that the "onCodePathSegmentLoop" event is triggerent with a loop node. To work this special case around,
    // we visit loop children and collect corresponding path segments as these segments are "toSegment"
    // in "onCodePathSegmentLoop" event.
    function visitLoopChild(parent: WhileStatement | ForStatement) {
      if (currentCodePaths.length > 0) {
        const currentCodePath = currentCodePaths[currentCodePaths.length - 1];
        loopsAndTheirSegments.push({ segments: currentCodePath.currentSegments, loop: parent });
      }
    }
  },
};

export = rule;
