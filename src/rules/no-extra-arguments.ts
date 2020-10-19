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
// https://jira.sonarsource.com/browse/RSPEC-930

import { Rule, Scope } from "eslint";
import * as estree from "estree";
import {
  isArrowFunctionExpression,
  isFunctionDeclaration,
  isFunctionExpression,
  isIdentifier,
  isBlockStatement,
} from "../utils/nodes";
import { report, issueLocation, getMainFunctionTokenLocation, IssueLocation } from "../utils/locations";

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    schema: [
      {
        // internal parameter
        enum: ["sonar-runtime"],
      },
    ],
  },
  create(context: Rule.RuleContext) {
    const callExpressionsToCheck: Array<{
      callExpr: estree.SimpleCallExpression;
      functionNode: estree.Function;
    }> = [];
    const usingArguments: Set<estree.Node> = new Set();
    const emptyFunctions: Set<estree.Node> = new Set();

    return {
      // eslint-disable-next-line sonarjs/cognitive-complexity
      CallExpression(node: estree.Node) {
        const callExpr = node as estree.SimpleCallExpression;
        if (isIdentifier(callExpr.callee)) {
          const reference = context.getScope().references.find(ref => ref.identifier === callExpr.callee);
          const definition = reference && getSingleDefinition(reference);
          if (definition) {
            if (definition.type === "FunctionName") {
              checkFunction(callExpr, definition.node);
            } else if (definition.type === "Variable") {
              const { init } = definition.node;
              if (init && (isFunctionExpression(init) || isArrowFunctionExpression(init))) {
                checkFunction(callExpr, init);
              }
            }
          }
        } else if (isArrowFunctionExpression(callExpr.callee) || isFunctionExpression(callExpr.callee)) {
          // IIFE
          checkFunction(callExpr, callExpr.callee);
        }
      },

      ":function"(node: estree.Node) {
        const fn = node as estree.Function;
        if (isBlockStatement(fn.body) && fn.body.body.length === 0 && fn.params.length === 0) {
          emptyFunctions.add(node);
        }
      },

      "FunctionDeclaration > BlockStatement Identifier"(node: estree.Node) {
        checkArguments(node as estree.Identifier);
      },

      "FunctionExpression > BlockStatement Identifier"(node: estree.Node) {
        checkArguments(node as estree.Identifier);
      },

      "Program:exit"() {
        callExpressionsToCheck.forEach(({ callExpr, functionNode }) => {
          if (!usingArguments.has(functionNode) && !emptyFunctions.has(functionNode)) {
            reportIssue(callExpr, functionNode);
          }
        });
      },
    };

    function getSingleDefinition(reference: Scope.Reference): Scope.Definition | undefined {
      if (reference && reference.resolved) {
        const variable = reference.resolved;
        if (variable.defs.length === 1) {
          return variable.defs[0];
        }
      }
      return undefined;
    }

    function checkArguments(identifier: estree.Identifier) {
      if (identifier.name === "arguments") {
        const reference = context.getScope().references.find(ref => ref.identifier === identifier);
        const definition = reference && getSingleDefinition(reference);
        // special `arguments` variable has no definition
        if (!definition) {
          const ancestors = context.getAncestors().reverse();
          const fn = ancestors.find(node => isFunctionDeclaration(node) || isFunctionExpression(node));
          if (fn) {
            usingArguments.add(fn);
          }
        }
      }
    }

    function checkFunction(callExpr: estree.SimpleCallExpression, functionNode: estree.Function) {
      const hasRest = functionNode.params.some(param => param.type === "RestElement");
      if (!hasRest && callExpr.arguments.length > functionNode.params.length) {
        callExpressionsToCheck.push({ callExpr, functionNode });
      }
    }

    function reportIssue(callExpr: estree.SimpleCallExpression, functionNode: estree.Function) {
      const paramLength = functionNode.params.length;
      const argsLength = callExpr.arguments.length;
      // prettier-ignore
      const expectedArguments = 
        // eslint-disable-next-line no-nested-ternary
        paramLength === 0 ? "no arguments" : 
        paramLength === 1 ? "1 argument" : 
        `${paramLength} arguments`;

      // prettier-ignore
      const providedArguments = 
        // eslint-disable-next-line no-nested-ternary
        argsLength === 0 ? "none was" : 
        argsLength === 1 ? "1 was" : 
        `${argsLength} were`;

      const message = `This function expects ${expectedArguments}, but ${providedArguments} provided.`;

      report(
        context,
        {
          message,
          node: callExpr.callee,
        },
        getSecondaryLocations(callExpr, functionNode),
      );
    }

    function getSecondaryLocations(callExpr: estree.SimpleCallExpression, functionNode: estree.Function) {
      const paramLength = functionNode.params.length;
      const secondaryLocations: IssueLocation[] = [];
      if (paramLength > 0) {
        const startLoc = functionNode.params[0].loc;
        const endLoc = functionNode.params[paramLength - 1].loc;
        // defensive check as `loc` property may be undefined according to
        // its type declaration
        if (startLoc && endLoc) {
          secondaryLocations.push(issueLocation(startLoc, endLoc, "Formal parameters"));
        }
      } else {
        // as we're not providing parent node, `getMainFunctionTokenLocation` may return `undefined`
        const fnToken = getMainFunctionTokenLocation(functionNode, undefined, context);
        if (fnToken) {
          secondaryLocations.push(issueLocation(fnToken, fnToken, "Formal parameters"));
        }
      }

      // find actual extra arguments to highlight
      callExpr.arguments.forEach((argument, index) => {
        if (index >= paramLength && argument.loc) {
          secondaryLocations.push(issueLocation(argument.loc, argument.loc, "Excess parameter"));
        }
      });

      return secondaryLocations;
    }
  },
};

export = rule;
