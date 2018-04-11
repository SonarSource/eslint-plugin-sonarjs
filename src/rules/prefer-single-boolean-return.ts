import { Rule } from "eslint";
import * as estree from "estree";
import { isReturnStatement, isBlockStatement, isBooleanLiteral, isIfStatement, getParent } from "../utils/nodes";

const rule: Rule.RuleModule = {
  create(context: Rule.RuleContext) {
    return {
      IfStatement(node: estree.Node) {
        const ifStmt = node as estree.IfStatement;
        if (
          // ignore `else if`
          !isIfStatement(getParent(context)) &&
          // `ifStmt.alternate` can be `null`, replace it with `undefined` in this case
          returnsBoolean(ifStmt.alternate || undefined) &&
          returnsBoolean(ifStmt.consequent)
        ) {
          context.report({
            message: "Replace this if-then-else statement by a single return statement.",
            node: ifStmt,
          });
        }
      },
    };

    function returnsBoolean(statement: estree.Statement | undefined) {
      return (
        statement !== undefined &&
        (isBlockReturningBooleanLiteral(statement) || isSimpleReturnBooleanLiteral(statement))
      );
    }

    function isBlockReturningBooleanLiteral(statement: estree.Statement) {
      return (
        isBlockStatement(statement) && statement.body.length === 1 && isSimpleReturnBooleanLiteral(statement.body[0])
      );
    }

    function isSimpleReturnBooleanLiteral(statement: estree.Statement) {
      // `statement.argument` can be `null`, replace it with `undefined` in this case
      return isReturnStatement(statement) && isBooleanLiteral(statement.argument || undefined);
    }
  },
};

export = rule;
