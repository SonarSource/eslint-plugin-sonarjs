// https://jira.sonarsource.com/browse/RSPEC-3923

import { Rule } from "eslint";
import * as estree from "estree";
import { getParent, isIfStatement } from "../utils/nodes";
import { areEquivalent } from "../utils/equivalence";
import { collectIfBranches, collectSwitchBranches } from "../utils/conditions";

const MESSAGE = "Remove this conditional structure or edit its code blocks so that they're not all the same.";
const MESSAGE_CONDITIONAL_EXPRESSION =
  'This conditional operation returns the same value whether the condition is "true" or "false".';

const rule: Rule.RuleModule = {
  create(context: Rule.RuleContext) {
    return {
      IfStatement(node: estree.Node) {
        const ifStmt = node as estree.IfStatement;

        // don't visit `else if` statements
        const parent = getParent(context);
        if (!isIfStatement(parent)) {
          const { branches, endsWithElse } = collectIfBranches(ifStmt);
          if (endsWithElse && allDuplicated(branches)) {
            context.report({ message: MESSAGE, node: ifStmt });
          }
        }
      },

      SwitchStatement(node: estree.Node) {
        const switchStmt = node as estree.SwitchStatement;
        const { branches, endsWithDefault } = collectSwitchBranches(switchStmt);
        if (endsWithDefault && allDuplicated(branches)) {
          context.report({ message: MESSAGE, node: switchStmt });
        }
      },

      ConditionalExpression(node: estree.Node) {
        const conditional = node as estree.ConditionalExpression;
        const branches = [conditional.consequent, conditional.alternate];
        if (allDuplicated(branches)) {
          context.report({ message: MESSAGE_CONDITIONAL_EXPRESSION, node: conditional });
        }
      },
    };

    function allDuplicated(branches: Array<estree.Node | estree.Node[]>) {
      return (
        branches.length > 1 &&
        branches.slice(1).every((branch, index) => {
          return areEquivalent(branch, branches[index], context.getSourceCode());
        })
      );
    }
  },
};

export = rule;
