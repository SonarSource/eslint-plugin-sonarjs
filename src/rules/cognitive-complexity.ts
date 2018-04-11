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
// https://jira.sonarsource.com/browse/RSPEC-3776

import { Rule } from "eslint";
import * as estree from "estree";
import { getParent, isIfStatement, isLogicalExpression } from "../utils/nodes";
import { getMainFunctionTokenLocation } from "../utils/locations";

const MESSAGE =
  "Refactor this function to reduce its Cognitive Complexity from {{complexity}} to the {{threshold}} allowed.";
const DEFAULT_THRESHOLD = 15;

type LoopStatement =
  | estree.ForStatement
  | estree.ForInStatement
  | estree.ForOfStatement
  | estree.DoWhileStatement
  | estree.WhileStatement;

type OptionalLocation = estree.SourceLocation | null | undefined;

const rule: Rule.RuleModule = {
  meta: {
    schema: [{ type: "integer", minimum: 0 }],
  },
  create(context: Rule.RuleContext) {
    const threshold: number = context.options[0] !== undefined ? context.options[0] : DEFAULT_THRESHOLD;

    /** Complexity of the current function if it is *not* considered nested to the first level function */
    let complexityIfNotNested = 0;

    /** Complexity of the current function if it is considered nested to the first level function */
    let complexityIfNested = 0;

    /** Current nesting level (number of enclosing control flow statements and functions) */
    let nesting = 0;

    /** Indicator if the current top level function has a structural (generated by control flow statements) complexity */
    let topLevelHasStructuralComplexity = false;

    /** Own (not including nested functions) complexity of the current top function */
    let topLevelOwnComplexity = 0;

    /** Nodes that should increase nesting level  */
    const nestingNodes: Set<estree.Node> = new Set();

    /** Set of already considered (with already computed complexity) logical expressions */
    const consideredLogicalExpressions: Set<estree.Node> = new Set();

    /** Stack of enclosing functions */
    const enclosingFunctions: estree.Function[] = [];

    let secondLevelFunctions: Array<{
      node: estree.Function;
      parent: estree.Node | undefined;
      complexityIfThisSecondaryIsTopLevel: number;
      complexityIfNested: number;
      loc: OptionalLocation;
    }> = [];

    return {
      ":function"(node: estree.Node) {
        onEnterFunction(node as estree.Function);
      },
      ":function:exit"(node: estree.Node) {
        onLeaveFunction(node as estree.Function);
      },

      "*"(node: estree.Node) {
        if (nestingNodes.has(node)) {
          nesting++;
        }
      },
      "*:exit"(node: estree.Node) {
        if (nestingNodes.has(node)) {
          nesting--;
          nestingNodes.delete(node);
        }
      },

      IfStatement(node: estree.Node) {
        visitIfStatement(node as estree.IfStatement);
      },
      ForStatement(node: estree.Node) {
        visitLoop(node as estree.ForStatement);
      },
      ForInStatement(node: estree.Node) {
        visitLoop(node as estree.ForInStatement);
      },
      ForOfStatement(node: estree.Node) {
        visitLoop(node as estree.ForOfStatement);
      },
      DoWhileStatement(node: estree.Node) {
        visitLoop(node as estree.DoWhileStatement);
      },
      WhileStatement(node: estree.Node) {
        visitLoop(node as estree.WhileStatement);
      },
      SwitchStatement(node: estree.Node) {
        visitSwitchStatement(node as estree.SwitchStatement);
      },
      ContinueStatement(node: estree.Node) {
        visitContinueOrBreakStatement(node as estree.ContinueStatement);
      },
      BreakStatement(node: estree.Node) {
        visitContinueOrBreakStatement(node as estree.BreakStatement);
      },
      CatchClause(node: estree.Node) {
        visitCatchClause(node as estree.CatchClause);
      },
      LogicalExpression(node: estree.Node) {
        visitLogicalExpression(node as estree.LogicalExpression);
      },
      ConditionalExpression(node: estree.Node) {
        visitConditionalExpression(node as estree.ConditionalExpression);
      },
    };

    function onEnterFunction(node: estree.Function) {
      if (enclosingFunctions.length === 0) {
        // top level function
        topLevelHasStructuralComplexity = false;
        topLevelOwnComplexity = 0;
        secondLevelFunctions = [];
      } else if (enclosingFunctions.length === 1) {
        // second level function
        complexityIfNotNested = 0;
        complexityIfNested = 0;
      } else {
        nesting++;
        nestingNodes.add(node);
      }
      enclosingFunctions.push(node);
    }

    function onLeaveFunction(node: estree.Function) {
      enclosingFunctions.pop();
      if (enclosingFunctions.length === 0) {
        // top level function
        if (topLevelHasStructuralComplexity) {
          let totalComplexity = topLevelOwnComplexity;
          secondLevelFunctions.forEach(secondLevelFunction => {
            totalComplexity += secondLevelFunction.complexityIfNested;
          });
          checkFunction(totalComplexity, getMainFunctionTokenLocation(node, getParent(context), context));
        } else {
          checkFunction(topLevelOwnComplexity, getMainFunctionTokenLocation(node, getParent(context), context));
          secondLevelFunctions.forEach(secondLevelFunction => {
            checkFunction(
              secondLevelFunction.complexityIfThisSecondaryIsTopLevel,
              getMainFunctionTokenLocation(secondLevelFunction.node, secondLevelFunction.parent, context),
            );
          });
        }
      } else if (enclosingFunctions.length === 1) {
        // second level function
        secondLevelFunctions.push({
          node,
          parent: getParent(context),
          complexityIfNested,
          complexityIfThisSecondaryIsTopLevel: complexityIfNotNested,
          loc: getMainFunctionTokenLocation(node, getParent(context), context),
        });
      } else {
        // complexity of third+ level functions is computed in their parent functions
        // so we never raise an issue for them
      }
    }

    function visitIfStatement(ifStatement: estree.IfStatement) {
      const parent = getParent(context);
      // if the current `if` statement is `else if`, do not count it in structural complexity
      if (isIfStatement(parent) && parent.alternate === ifStatement) {
        addComplexity();
      } else {
        addStructuralComplexity();
      }

      // always increase nesting level inside `then` statement
      nestingNodes.add(ifStatement.consequent);

      // if `else` branch is not `else if` then
      // - increase nesting level inside `else` statement
      // - add +1 complexity
      if (ifStatement.alternate && !isIfStatement(ifStatement.alternate)) {
        nestingNodes.add(ifStatement.alternate);
        addComplexity();
      }
    }

    function visitLoop(loop: LoopStatement) {
      addStructuralComplexity();
      nestingNodes.add(loop.body);
    }

    function visitSwitchStatement(switchStatement: estree.SwitchStatement) {
      addStructuralComplexity();
      for (const switchCase of switchStatement.cases) {
        nestingNodes.add(switchCase);
      }
    }

    function visitContinueOrBreakStatement(statement: estree.ContinueStatement | estree.BreakStatement) {
      if (statement.label) {
        addComplexity();
      }
    }

    function visitCatchClause(catchClause: estree.CatchClause) {
      addStructuralComplexity();
      nestingNodes.add(catchClause.body);
    }

    function visitConditionalExpression(conditionalExpression: estree.ConditionalExpression) {
      addStructuralComplexity();
      nestingNodes.add(conditionalExpression.consequent);
      nestingNodes.add(conditionalExpression.alternate);
    }

    function visitLogicalExpression(logicalExpression: estree.LogicalExpression) {
      if (!consideredLogicalExpressions.has(logicalExpression)) {
        const flattenedLogicalExpressions = flattenLogicalExpression(logicalExpression);

        let previous: estree.LogicalExpression | undefined;
        for (const current of flattenedLogicalExpressions) {
          if (!previous || previous.operator !== current.operator) {
            addComplexity();
          }
          previous = current;
        }
      }
    }

    function flattenLogicalExpression(node: estree.Node): estree.LogicalExpression[] {
      if (isLogicalExpression(node)) {
        consideredLogicalExpressions.add(node);
        return [...flattenLogicalExpression(node.left), node, ...flattenLogicalExpression(node.right)];
      }
      return [];
    }

    function addStructuralComplexity() {
      const added = nesting + 1;
      if (enclosingFunctions.length === 1) {
        // top level function
        topLevelHasStructuralComplexity = true;
        topLevelOwnComplexity += added;
      } else {
        // second+ level function
        complexityIfNested += added + 1;
        complexityIfNotNested += added;
      }
    }

    function addComplexity() {
      if (enclosingFunctions.length === 1) {
        // top level function
        topLevelOwnComplexity++;
      } else {
        // second+ level function
        complexityIfNested++;
        complexityIfNotNested++;
      }
    }

    function checkFunction(complexity: number, loc: estree.SourceLocation) {
      if (complexity > threshold) {
        context.report({
          message: MESSAGE,
          data: { complexity: String(complexity), threshold: String(threshold) },
          loc,
        });
      }
    }
  },
};

export = rule;
