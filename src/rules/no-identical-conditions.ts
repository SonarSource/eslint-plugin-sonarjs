import { Rule } from "eslint";
import * as estree from "estree";
import { isIfStatement } from "../utils/nodes";
import { areEquivalent } from "../utils/equivalence";

const rule: Rule.RuleModule = {
  create(context: Rule.RuleContext) {
    return {
      IfStatement(node: estree.Node) {
        const ifStmt = node as estree.IfStatement;
        const condition = ifStmt.test;
        let statement = ifStmt.alternate;
        while (statement) {
          if (isIfStatement(statement)) {
            if (areEquivalent(condition, statement.test, context.getSourceCode())) {
              const line = ifStmt.loc && ifStmt.loc.start.line;
              if (line !== undefined) {
                context.report({ message: `This branch duplicates the one on line ${line}`, node: statement.test });
              }
            }
            statement = statement.alternate;
          } else {
            break;
          }
        }
      },
    };
  },
};

export = rule;
