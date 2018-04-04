import { Rule } from "eslint";
import { Node, CallExpression, Function, ReturnStatement, Identifier, ArrowFunctionExpression } from "estree";
import { isFunctionExpression, isArrowFunctionExpression, isBlockStatement } from "../utils/nodes";

function message(name: string) {
  return `Remove this use of the output from "${name}"; "${name}" doesn't return anything.`;
}

function isReturnValueUsed(node: Node, parent: Node) {
  if (parent.type === "LogicalExpression") {
    return parent.left === node;
  }

  if (parent.type === "SequenceExpression") {
    return parent.expressions[parent.expressions.length - 1] === node;
  }

  if (parent.type === "ConditionalExpression") {
    return parent.test === node;
  }

  return (
    parent.type !== "ExpressionStatement" &&
    parent.type !== "ArrowFunctionExpression" &&
    parent.type !== "UnaryExpression" &&
    parent.type !== "AwaitExpression" &&
    parent.type !== "ReturnStatement" &&
    parent.type !== "ThrowStatement"
  );
}

const rule: Rule.RuleModule = {
  create(context: Rule.RuleContext) {
    const callExpressionsToCheck: Map<Identifier, Function> = new Map();
    const functionsWithReturnValue: Function[] = [];

    return {
      CallExpression(node: Node) {
        const ancestors = context.getAncestors();
        if (!isReturnValueUsed(node, ancestors[ancestors.length - 1])) {
          return;
        }
        const callExpr = node as CallExpression;
        const scope = context.getScope();
        const reference = scope.references.find(ref => ref.identifier === callExpr.callee);
        if (reference && reference.resolved) {
          const variable = reference.resolved;
          if (variable.defs.length === 1) {
            const definition = variable.defs[0];
            if (definition.type === "FunctionName") {
              callExpressionsToCheck.set(reference.identifier, definition.node);
            } else if (definition.type === "Variable") {
              const init = definition.node.init;
              if (init && (isFunctionExpression(init) || isArrowFunctionExpression(init))) {
                callExpressionsToCheck.set(reference.identifier, init);
              }
            }
          }
        }
      },

      ReturnStatement(node: Node) {
        const returnStmt = node as ReturnStatement;
        const ancestors = [...context.getAncestors()].reverse();
        const functionNode = ancestors.find(
          node =>
            node.type === "FunctionExpression" ||
            node.type === "FunctionDeclaration" ||
            node.type === "ArrowFunctionExpression",
        );

        if (returnStmt.argument) {
          functionsWithReturnValue.push(functionNode as Function);
        }
      },

      ArrowFunctionExpression(node: Node) {
        const arrowFunc = node as ArrowFunctionExpression;
        if (!isBlockStatement(arrowFunc.body)) {
          functionsWithReturnValue.push(arrowFunc);
        }
      },

      ":function"(node: Node) {
        const func = node as Function;
        if (func.async || (isBlockStatement(func.body) && func.body.body.length === 0)) {
          functionsWithReturnValue.push(func);
        }
      },

      "Program:exit": function() {
        callExpressionsToCheck.forEach((functionDeclaration, callee) => {
          if (!functionsWithReturnValue.includes(functionDeclaration)) {
            context.report({ message: message(callee.name), node: callee });
          }
        });
      },
    };
  },
};

export = rule;
