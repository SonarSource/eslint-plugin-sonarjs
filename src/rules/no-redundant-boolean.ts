import { Rule } from "eslint";
import { BinaryExpression, Node, LogicalExpression, UnaryExpression, Expression } from "estree";
import { getParent, isBooleanLiteral, isIfStatement, isConditionalExpression } from "../utils/nodes";

const MESSAGE = "Remove the unnecessary boolean literal.";

const rule: Rule.RuleModule = {
  create(context: Rule.RuleContext) {
    return {
      BinaryExpression(node: Node) {
        const expression = node as BinaryExpression;
        if (expression.operator === "==" || expression.operator === "!=") {
          checkBooleanLiteral(expression.left);
          checkBooleanLiteral(expression.right);
        }
      },

      LogicalExpression(node: Node) {
        const expression = node as LogicalExpression;
        checkBooleanLiteral(expression.left);

        if (expression.operator === "&&") {
          checkBooleanLiteral(expression.right);
        }

        // ignore `x || true` and `x || false` expressions outside of conditional expressions and `if` statements
        const parent = getParent(context);
        if (expression.operator === "||" && (isConditionalExpression(parent) || isIfStatement(parent))) {
          checkBooleanLiteral(expression.right);
        }
      },

      UnaryExpression(node: Node) {
        const unaryExpression = node as UnaryExpression;
        if (unaryExpression.operator === "!") {
          checkBooleanLiteral(unaryExpression.argument);
        }
      },
    };

    function checkBooleanLiteral(expression: Expression) {
      if (isBooleanLiteral(expression)) {
        context.report({ message: MESSAGE, node: expression });
      }
    }
  },
};

export = rule;
