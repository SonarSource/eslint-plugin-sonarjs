import { Rule } from "eslint";
import * as estree from "estree";
import { areEquivalent } from "../utils/equivalence";
import { isBlockStatement } from "../utils/nodes";
import { getMainFunctionTokenLocation } from "../utils/locations";

const MESSAGE = "Update this function so that its implementation is not identical to the one on line {{line}}.";

const rule: Rule.RuleModule = {
  create(context: Rule.RuleContext) {
    const functions: estree.Function[] = [];

    return {
      FunctionDeclaration(node: estree.Node) {
        visitFunction(node as estree.FunctionDeclaration);
      },
      FunctionExpression(node: estree.Node) {
        visitFunction(node as estree.FunctionExpression);
      },
      ArrowFunctionExpression(node: estree.Node) {
        visitFunction(node as estree.ArrowFunctionExpression);
      },

      "Program:exit"() {
        processFunctions();
      },
    };

    function visitFunction(node: estree.Function) {
      if (isBlockStatement(node.body) && isBigEnough(node.body)) {
        functions.push(node);
      }
    }

    function processFunctions() {
      if (functions.length < 2) return;

      for (let i = 1; i < functions.length; i++) {
        const duplicatingFunctionBlock = functions[i].body;

        for (let j = 0; j < i; j++) {
          const originalFunctionBlock = functions[j].body;

          if (areEquivalent(duplicatingFunctionBlock, originalFunctionBlock, context.getSourceCode())) {
            const loc = getMainFunctionTokenLocation(functions[i], context);
            context.report({
              message: MESSAGE,
              data: { line: String(functions[j].loc!.start.line) },
              loc,
            });
            break;
          }
        }
      }
    }

    function isBigEnough(block: estree.BlockStatement) {
      if (block.body.length > 0) {
        const firstLine = block.body[0].loc!.start.line;
        const lastLine = block.body[block.body.length - 1].loc!.end.line;
        return lastLine - firstLine > 1;
      }

      return false;
    }
  },
};

export = rule;
