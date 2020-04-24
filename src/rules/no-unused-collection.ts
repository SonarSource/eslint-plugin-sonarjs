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
// https://jira.sonarsource.com/browse/RSPEC-4030

import { Rule, Scope } from "eslint";
import * as estree from "estree";
import { TSESTree } from "@typescript-eslint/experimental-utils";
import { collectionConstructor, writingMethods } from "../utils/collections";

const message = "Either use this collection's contents or remove the collection.";

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
  },
  create(context: Rule.RuleContext) {
    return {
      "Program:exit": () => {
        const unusedArrays: Scope.Variable[] = [];
        collectUnusedCollections(context.getScope(), unusedArrays);

        unusedArrays.forEach((unusedArray) => {
          context.report({
            message,
            node: unusedArray.identifiers[0],
          });
        });
      },
    };
  },
};

function collectUnusedCollections(scope: Scope.Scope, unusedArray: Scope.Variable[]) {
  if (scope.type !== "global") {
    scope.variables.filter(isUnusedCollection).forEach((v) => {
      unusedArray.push(v);
    });
  }

  scope.childScopes.forEach((childScope) => {
    collectUnusedCollections(childScope, unusedArray);
  });
}

function isUnusedCollection(variable: Scope.Variable) {
  if (variable.references.length <= 1) {
    return false;
  }
  let assignCollection = false;

  for (const ref of variable.references) {
    if (ref.isWriteOnly()) {
      if (isReferenceAssigningCollection(ref)) {
        assignCollection = true;
      } else {
        //One assignment is not a collection, we don't go further
        return false;
      }
    } else if (isRead(ref)) {
      //Unfortunately, isRead (!isWrite) from Scope.Reference consider A[1] = 1; and A.xxx(); as a read operation, we need to filter further
      return false;
    }
  }
  return assignCollection;
}

function isReferenceAssigningCollection(ref: Scope.Reference) {
  const declOrExprStmt = findFirstMatchingAncestor(
    ref.identifier as TSESTree.Node,
    (n) => n.type === "VariableDeclarator" || n.type === "ExpressionStatement",
  ) as estree.Node;
  if (declOrExprStmt) {
    if (declOrExprStmt.type === "VariableDeclarator" && declOrExprStmt.init) {
      return isCollectionType(declOrExprStmt.init);
    }

    if (declOrExprStmt.type === "ExpressionStatement") {
      const { expression } = declOrExprStmt;
      return (
        expression.type === "AssignmentExpression" &&
        isReferenceTo(ref, expression.left) &&
        isCollectionType(expression.right)
      );
    }
  }
  return false;
}

function isCollectionType(node: estree.Node) {
  if (node && node.type === "ArrayExpression") {
    return true;
  } else if (node && (node.type === "CallExpression" || node.type === "NewExpression")) {
    return isIdentifier(node.callee, ...collectionConstructor);
  }
  return false;
}

function isRead(ref: Scope.Reference) {
  const expressionStatement = findFirstMatchingAncestor(
    ref.identifier as TSESTree.Node,
    (n) => n.type === "ExpressionStatement",
  ) as estree.ExpressionStatement;

  if (expressionStatement) {
    return !(isElementWrite(expressionStatement, ref) || isWritingMethodCall(expressionStatement, ref));
  }

  //All the write statement that we search are part of ExpressionStatement, if there is none, it's a read
  return true;
}

/**
 * Detect expression statements like the following:
 * myArray.push(1);
 */
function isWritingMethodCall(statement: estree.ExpressionStatement, ref: Scope.Reference) {
  if (statement.expression.type === "CallExpression") {
    const { callee } = statement.expression;
    if (isMemberExpression(callee)) {
      const { property } = callee;
      return isReferenceTo(ref, callee.object) && isIdentifier(property, ...writingMethods);
    }
  }
  return false;
}

function isMemberExpression(node: estree.Node): node is estree.MemberExpression {
  return node.type === "MemberExpression";
}

/**
 * Detect expression statements like the following:
 *  myArray[1] = 42;
 *  myArray[1] += 42;
 *  myObj.prop1 = 3;
 *  myObj.prop1 += 3;
 */
function isElementWrite(statement: estree.ExpressionStatement, ref: Scope.Reference) {
  if (statement.expression.type === "AssignmentExpression") {
    const assignmentExpression = statement.expression;
    const lhs = assignmentExpression.left;
    return isMemberExpressionReference(lhs, ref);
  }
  return false;
}

function isMemberExpressionReference(lhs: estree.Node, ref: Scope.Reference): boolean {
  return (
    lhs.type === "MemberExpression" && (isReferenceTo(ref, lhs.object) || isMemberExpressionReference(lhs.object, ref))
  );
}

function isIdentifier(node: estree.Node, ...values: string[]): node is estree.Identifier {
  return node.type === "Identifier" && values.some((value) => value === node.name);
}

function isReferenceTo(ref: Scope.Reference, node: estree.Node) {
  return node.type === "Identifier" && node === ref.identifier;
}

function findFirstMatchingAncestor(node: TSESTree.Node, predicate: (node: TSESTree.Node) => boolean) {
  return ancestorsChain(node, new Set()).find(predicate);
}

function ancestorsChain(node: TSESTree.Node, boundaryTypes: Set<string>) {
  const chain: TSESTree.Node[] = [];

  let currentNode = node.parent;
  while (currentNode) {
    chain.push(currentNode);
    if (boundaryTypes.has(currentNode.type)) {
      break;
    }
    currentNode = currentNode.parent;
  }
  return chain;
}

export = rule;
