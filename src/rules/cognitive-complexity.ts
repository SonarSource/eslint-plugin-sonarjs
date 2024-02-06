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
// https://sonarsource.github.io/rspec/#/rspec/S3776

import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { isArrowFunctionExpression, isIfStatement, isLogicalExpression } from '../utils/nodes';
import {
  getFirstToken,
  getFirstTokenAfter,
  getMainFunctionTokenLocation,
  IssueLocation,
  issueLocation,
  report,
} from '../utils/locations';
import docsUrl from '../utils/docs-url';
import { getJsxShortCircuitNodes } from '../utils/jsx';

const DEFAULT_THRESHOLD = 15;

type LoopStatement =
  | TSESTree.ForStatement
  | TSESTree.ForInStatement
  | TSESTree.ForOfStatement
  | TSESTree.DoWhileStatement
  | TSESTree.WhileStatement;

type OptionalLocation = TSESTree.SourceLocation | null | undefined;

const message =
  'Refactor this function to reduce its Cognitive Complexity from {{complexityAmount}} to the {{threshold}} allowed.';

const rule: TSESLint.RuleModule<string, (number | 'metric' | 'sonar-runtime')[]> = {
  meta: {
    messages: {
      refactorFunction: message,
      sonarRuntime: '{{sonarRuntimeData}}',
      fileComplexity: '{{complexityAmount}}',
    },
    type: 'suggestion',
    docs: {
      description: 'Cognitive Complexity of functions should not be too high',
      recommended: 'error',
      url: docsUrl(__filename),
    },
    schema: [
      { type: 'integer', minimum: 0 },
      {
        // internal parameter
        enum: ['sonar-runtime', 'metric'],
      },
    ],
  },
  create(context) {
    const threshold =
      typeof context.options[0] === 'number' ? context.options[0] : DEFAULT_THRESHOLD;
    const isFileComplexity = context.options.includes('metric');

    /** Complexity of the file */
    let fileComplexity = 0;

    /** Complexity of the current function if it is *not* considered nested to the first level function */
    let complexityIfNotNested: ComplexityPoint[] = [];

    /** Complexity of the current function if it is considered nested to the first level function */
    let complexityIfNested: ComplexityPoint[] = [];

    /** Current nesting level (number of enclosing control flow statements and functions) */
    let nesting = 0;

    /** Indicator if the current top level function has a structural (generated by control flow statements) complexity */
    let topLevelHasStructuralComplexity = false;

    /** Indicator if the current top level function is React functional component */
    const reactFunctionalComponent = {
      nameStartsWithCapital: false,
      returnsJsx: false,

      isConfirmed() {
        return this.nameStartsWithCapital && this.returnsJsx;
      },

      init(node: TSESTree.FunctionLike) {
        this.nameStartsWithCapital = nameStartsWithCapital(node);
        this.returnsJsx = false;
      },
    };

    /** Own (not including nested functions) complexity of the current top function */
    let topLevelOwnComplexity: ComplexityPoint[] = [];

    /** Nodes that should increase nesting level  */
    const nestingNodes: Set<TSESTree.Node> = new Set();

    /** Set of already considered (with already computed complexity) logical expressions */
    const consideredLogicalExpressions: Set<TSESTree.Node> = new Set();

    /** Stack of enclosing functions */
    const enclosingFunctions: TSESTree.FunctionLike[] = [];

    let secondLevelFunctions: Array<{
      node: TSESTree.FunctionLike;
      parent: TSESTree.Node | undefined;
      complexityIfThisSecondaryIsTopLevel: ComplexityPoint[];
      complexityIfNested: ComplexityPoint[];
      loc: OptionalLocation;
    }> = [];

    return {
      ':function': (node: TSESTree.Node) => {
        onEnterFunction(node as TSESTree.FunctionLike);
      },
      ':function:exit'(node: TSESTree.Node) {
        onLeaveFunction(node as TSESTree.FunctionLike);
      },

      '*'(node: TSESTree.Node) {
        if (nestingNodes.has(node)) {
          nesting++;
        }
      },
      '*:exit'(node: TSESTree.Node) {
        if (nestingNodes.has(node)) {
          nesting--;
          nestingNodes.delete(node);
        }
      },
      Program() {
        fileComplexity = 0;
      },
      'Program:exit'(node: TSESTree.Node) {
        if (isFileComplexity) {
          // value from the message will be saved in SonarQube as file complexity metric
          context.report({
            node,
            messageId: 'fileComplexity',
            data: { complexityAmount: fileComplexity },
          });
        }
      },

      IfStatement(node: TSESTree.Node) {
        visitIfStatement(node as TSESTree.IfStatement);
      },
      ForStatement(node: TSESTree.Node) {
        visitLoop(node as TSESTree.ForStatement);
      },
      ForInStatement(node: TSESTree.Node) {
        visitLoop(node as TSESTree.ForInStatement);
      },
      ForOfStatement(node: TSESTree.Node) {
        visitLoop(node as TSESTree.ForOfStatement);
      },
      DoWhileStatement(node: TSESTree.Node) {
        visitLoop(node as TSESTree.DoWhileStatement);
      },
      WhileStatement(node: TSESTree.Node) {
        visitLoop(node as TSESTree.WhileStatement);
      },
      SwitchStatement(node: TSESTree.Node) {
        visitSwitchStatement(node as TSESTree.SwitchStatement);
      },
      ContinueStatement(node: TSESTree.Node) {
        visitContinueOrBreakStatement(node as TSESTree.ContinueStatement);
      },
      BreakStatement(node: TSESTree.Node) {
        visitContinueOrBreakStatement(node as TSESTree.BreakStatement);
      },
      CatchClause(node: TSESTree.Node) {
        visitCatchClause(node as TSESTree.CatchClause);
      },
      LogicalExpression(node: TSESTree.Node) {
        visitLogicalExpression(node as TSESTree.LogicalExpression);
      },
      ConditionalExpression(node: TSESTree.Node) {
        visitConditionalExpression(node as TSESTree.ConditionalExpression);
      },
      ReturnStatement(node: TSESTree.Node) {
        visitReturnStatement(node as TSESTree.ReturnStatement);
      },
    };

    function onEnterFunction(node: TSESTree.FunctionLike) {
      if (enclosingFunctions.length === 0) {
        // top level function
        topLevelHasStructuralComplexity = false;
        reactFunctionalComponent.init(node);
        topLevelOwnComplexity = [];
        secondLevelFunctions = [];
      } else if (enclosingFunctions.length === 1) {
        // second level function
        complexityIfNotNested = [];
        complexityIfNested = [];
      } else {
        nesting++;
        nestingNodes.add(node);
      }
      enclosingFunctions.push(node);
    }

    function onLeaveFunction(node: TSESTree.FunctionLike) {
      enclosingFunctions.pop();
      if (enclosingFunctions.length === 0) {
        // top level function
        if (topLevelHasStructuralComplexity && !reactFunctionalComponent.isConfirmed()) {
          let totalComplexity = topLevelOwnComplexity;
          secondLevelFunctions.forEach(secondLevelFunction => {
            totalComplexity = totalComplexity.concat(secondLevelFunction.complexityIfNested);
          });
          checkFunction(totalComplexity, getMainFunctionTokenLocation(node, node.parent, context));
        } else {
          checkFunction(
            topLevelOwnComplexity,
            getMainFunctionTokenLocation(node, node.parent, context),
          );
          secondLevelFunctions.forEach(secondLevelFunction => {
            checkFunction(
              secondLevelFunction.complexityIfThisSecondaryIsTopLevel,
              getMainFunctionTokenLocation(
                secondLevelFunction.node,
                secondLevelFunction.parent,
                context,
              ),
            );
          });
        }
      } else if (enclosingFunctions.length === 1) {
        // second level function
        secondLevelFunctions.push({
          node,
          parent: node.parent,
          complexityIfNested,
          complexityIfThisSecondaryIsTopLevel: complexityIfNotNested,
          loc: getMainFunctionTokenLocation(node, node.parent, context),
        });
      } else {
        // complexity of third+ level functions is computed in their parent functions
        // so we never raise an issue for them
      }
    }

    function visitIfStatement(ifStatement: TSESTree.IfStatement) {
      const { parent } = ifStatement;
      const { loc: ifLoc } = getFirstToken(ifStatement, context);
      // if the current `if` statement is `else if`, do not count it in structural complexity
      if (isIfStatement(parent) && parent.alternate === ifStatement) {
        addComplexity(ifLoc);
      } else {
        addStructuralComplexity(ifLoc);
      }

      // always increase nesting level inside `then` statement
      nestingNodes.add(ifStatement.consequent);

      // if `else` branch is not `else if` then
      // - increase nesting level inside `else` statement
      // - add +1 complexity
      if (ifStatement.alternate && !isIfStatement(ifStatement.alternate)) {
        nestingNodes.add(ifStatement.alternate);
        const elseTokenLoc = getFirstTokenAfter(ifStatement.consequent, context)!.loc;
        addComplexity(elseTokenLoc);
      }
    }

    function visitLoop(loop: LoopStatement) {
      addStructuralComplexity(getFirstToken(loop, context).loc);
      nestingNodes.add(loop.body);
    }

    function visitSwitchStatement(switchStatement: TSESTree.SwitchStatement) {
      addStructuralComplexity(getFirstToken(switchStatement, context).loc);
      for (const switchCase of switchStatement.cases) {
        nestingNodes.add(switchCase);
      }
    }

    function visitContinueOrBreakStatement(
      statement: TSESTree.ContinueStatement | TSESTree.BreakStatement,
    ) {
      if (statement.label) {
        addComplexity(getFirstToken(statement, context).loc);
      }
    }

    function visitCatchClause(catchClause: TSESTree.CatchClause) {
      addStructuralComplexity(getFirstToken(catchClause, context).loc);
      nestingNodes.add(catchClause.body);
    }

    function visitConditionalExpression(conditionalExpression: TSESTree.ConditionalExpression) {
      const questionTokenLoc = getFirstTokenAfter(conditionalExpression.test, context)!.loc;
      addStructuralComplexity(questionTokenLoc);
      nestingNodes.add(conditionalExpression.consequent);
      nestingNodes.add(conditionalExpression.alternate);
    }

    function visitReturnStatement({ argument }: TSESTree.ReturnStatement) {
      // top level function
      if (
        enclosingFunctions.length === 1 &&
        argument &&
        ['JSXElement', 'JSXFragment'].includes(argument.type as any)
      ) {
        reactFunctionalComponent.returnsJsx = true;
      }
    }

    function nameStartsWithCapital(node: TSESTree.FunctionLike) {
      const checkFirstLetter = (name: string) => {
        const firstLetter = name[0];
        return firstLetter === firstLetter.toUpperCase();
      };

      if (!isArrowFunctionExpression(node) && node.id) {
        return checkFirstLetter(node.id.name);
      }

      const { parent } = node;
      if (parent && parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
        return checkFirstLetter(parent.id.name);
      }

      return false;
    }

    function visitLogicalExpression(logicalExpression: TSESTree.LogicalExpression) {
      const jsxShortCircuitNodes = getJsxShortCircuitNodes(logicalExpression);
      if (jsxShortCircuitNodes != null) {
        jsxShortCircuitNodes.forEach(node => consideredLogicalExpressions.add(node));
        return;
      }

      if (isDefaultValuePattern(logicalExpression)) {
        return;
      }

      if (!consideredLogicalExpressions.has(logicalExpression)) {
        const flattenedLogicalExpressions = flattenLogicalExpression(logicalExpression);

        let previous: TSESTree.LogicalExpression | undefined;
        for (const current of flattenedLogicalExpressions) {
          if (!previous || previous.operator !== current.operator) {
            const operatorTokenLoc = getFirstTokenAfter(current.left, context)!.loc;
            addComplexity(operatorTokenLoc);
          }
          previous = current;
        }
      }
    }

    function isDefaultValuePattern(node: TSESTree.LogicalExpression) {
      const { left, right, operator, parent } = node;

      const operators = ['||', '??'];
      const literals = ['Literal', 'ArrayExpression', 'ObjectExpression'];

      switch (parent?.type) {
        /* Matches: const x = a || literal */
        case 'VariableDeclarator':
          return operators.includes(operator) && literals.includes(right.type);
        /* Matches: a = a || literal */
        case 'AssignmentExpression':
          return (
            operators.includes(operator) &&
            literals.includes(right.type) &&
            context.getSourceCode().getText(parent.left) === context.getSourceCode().getText(left)
          );
        default:
          return false;
      }
    }

    function flattenLogicalExpression(node: TSESTree.Node): TSESTree.LogicalExpression[] {
      if (isLogicalExpression(node)) {
        consideredLogicalExpressions.add(node);
        return [
          ...flattenLogicalExpression(node.left),
          node,
          ...flattenLogicalExpression(node.right),
        ];
      }
      return [];
    }

    function addStructuralComplexity(location: TSESTree.SourceLocation) {
      const added = nesting + 1;
      const complexityPoint = { complexity: added, location };
      if (enclosingFunctions.length === 0) {
        // top level scope
        fileComplexity += added;
      } else if (enclosingFunctions.length === 1) {
        // top level function
        topLevelHasStructuralComplexity = true;
        topLevelOwnComplexity.push(complexityPoint);
      } else {
        // second+ level function
        complexityIfNested.push({ complexity: added + 1, location });
        complexityIfNotNested.push(complexityPoint);
      }
    }

    function addComplexity(location: TSESTree.SourceLocation) {
      const complexityPoint = { complexity: 1, location };
      if (enclosingFunctions.length === 0) {
        // top level scope
        fileComplexity += 1;
      } else if (enclosingFunctions.length === 1) {
        // top level function
        topLevelOwnComplexity.push(complexityPoint);
      } else {
        // second+ level function
        complexityIfNested.push(complexityPoint);
        complexityIfNotNested.push(complexityPoint);
      }
    }

    function checkFunction(complexity: ComplexityPoint[] = [], loc: TSESTree.SourceLocation) {
      const complexityAmount = complexity.reduce((acc, cur) => acc + cur.complexity, 0);
      fileComplexity += complexityAmount;
      if (isFileComplexity) {
        return;
      }
      if (complexityAmount > threshold) {
        const secondaryLocations: IssueLocation[] = complexity.map(complexityPoint => {
          const { complexity, location } = complexityPoint;
          const message =
            complexity === 1 ? '+1' : `+${complexity} (incl. ${complexity - 1} for nesting)`;
          return issueLocation(location, undefined, message);
        });

        report(
          context,
          {
            messageId: 'refactorFunction',
            data: {
              complexityAmount,
              threshold,
            },
            loc,
          },
          secondaryLocations,
          message,
          complexityAmount - threshold,
        );
      }
    }
  },
};

export = rule;

type ComplexityPoint = {
  complexity: number;
  location: TSESTree.SourceLocation;
};
