import { Rule } from "eslint";
import { BinaryExpression, Node, Literal, LogicalExpression, UnaryExpression, Expression, IfStatement } from "estree";

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

        // ignore `x || true` and `x || false` expressions outside of `if` statements
        if (expression.operator === "&&" || (expression.operator === "||" && isIfStatement(getParent(context)))) {
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

// TODO move to utils/nodes
function isIfStatement(node: Node | undefined): node is IfStatement {
  return node !== undefined && node.type === "IfStatement";
}

// TODO move to utils/nodes
function isBooleanLiteral(node: Node): node is Literal {
  return node.type === "Literal" && typeof node.value === "boolean";
}

// TODO move to utils/nodes
function getParent(context: Rule.RuleContext) {
  const ancestors = context.getAncestors();
  return ancestors.length > 0 ? ancestors[ancestors.length - 1] : undefined;
}
