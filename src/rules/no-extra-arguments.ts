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

const rule: Rule.RuleModule = {
  create(context: Rule.RuleContext) {
    const callExpressionsToCheck: Array<{
      callExpr: estree.SimpleCallExpression;
      functionNode: estree.Function;
    }> = [];
    const usingArguments: Set<estree.Node> = new Set();
    const emptyFunctions: Set<estree.Node> = new Set();

    return {
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
            report(callExpr, functionNode.params.length, callExpr.arguments.length);
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
      if (!hasRest) {
        if (callExpr.arguments.length > functionNode.params.length) {
          callExpressionsToCheck.push({ callExpr, functionNode });
        }
      }
    }

    function report(callExpr: estree.SimpleCallExpression, expected: number, provided: number) {
      // prettier-ignore
      const expectedArguments = 
        expected === 0 ? "no arguments" : 
        expected === 1 ? "1 argument" : 
        `${expected} arguments`;

      // prettier-ignore
      const providedArguments = 
        provided === 0 ? "none was" : 
        provided === 1 ? "1 was" : 
        `${provided} were`;

      const message = `This function expects ${expectedArguments}, but ${providedArguments} provided.`;

      context.report({ message, node: callExpr });
    }
  },
};

export = rule;
