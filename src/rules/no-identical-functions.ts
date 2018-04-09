import { Rule } from "eslint";
import * as estree from "estree";
import { areEquivalent } from "../utils/equivalence";
import { getMainFunctionTokenLocation } from "../utils/locations";
import { getParent } from "../utils/nodes";

const MESSAGE = "Update this function so that its implementation is not identical to the one on line {{line}}.";

const rule: Rule.RuleModule = {
  create(context: Rule.RuleContext) {
    const functions: Array<{ function: estree.Function; parent: estree.Node | undefined }> = [];

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
      if (isBigEnough(node.body)) {
        functions.push({ function: node, parent: getParent(context) });
      }
    }

    function processFunctions() {
      if (functions.length < 2) return;

      for (let i = 1; i < functions.length; i++) {
        const duplicatingFunction = functions[i].function;

        for (let j = 0; j < i; j++) {
          const originalFunction = functions[j].function;

          if (
            areEquivalent(duplicatingFunction.body, originalFunction.body, context.getSourceCode()) &&
            originalFunction.loc
          ) {
            const loc = getMainFunctionTokenLocation(duplicatingFunction, functions[i].parent, context);
            context.report({
              message: MESSAGE,
              data: { line: String(originalFunction.loc.start.line) },
              loc,
            });
            break;
          }
        }
      }
    }

    function isBigEnough(node: estree.Expression | estree.Statement) {
      const tokens = context.getSourceCode().getTokens(node);

      if (tokens.length > 0 && tokens[0].value === "{") {
        tokens.shift();
      }

      if (tokens.length > 0 && tokens[tokens.length - 1].value === "}") {
        tokens.pop();
      }

      if (tokens.length > 0) {
        const firstLine = tokens[0].loc.start.line;
        const lastLine = tokens[tokens.length - 1].loc.end.line;

        return lastLine - firstLine > 1;
      }

      return false;
    }
  },
};

export = rule;
