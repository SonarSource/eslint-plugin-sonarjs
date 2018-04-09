import { Rule } from "eslint";
import * as estree from "estree";
import { getParent, isIfStatement, isBlockStatement } from "../utils/nodes";
import { areEquivalent } from "../utils/equivalence";

const MESSAGE = "This {{type}}'s code block is the same as the block for the {{type}} on line {{line}}.";

const rule: Rule.RuleModule = {
  create(context: Rule.RuleContext) {
    return {
      IfStatement(node: estree.Node) {
        visitIfStatement(node as estree.IfStatement);
      },
      SwitchStatement(node: estree.Node) {
        visitSwitchStatement(node as estree.SwitchStatement);
      },
    };

    function visitIfStatement(ifStmt: estree.IfStatement) {
      const parent = getParent(context);
      if (!isIfStatement(parent)) {
        const branches = collectIfBranches(ifStmt);

        for (let i = 1; i < branches.length; i++) {
          if (hasRequiredSize([branches[i]])) {
            for (let j = 0; j < i; j++) {
              if (compareIfBranches(branches[i], branches[j])) {
                break;
              }
            }
          }
        }
      }
    }

    function visitSwitchStatement({ cases }: estree.SwitchStatement) {
      for (let i = 1; i < cases.length; i++) {
        const firstClauseWithoutBreak = takeWithoutBreak(expandSingleBlockStatement(cases[i].consequent));

        if (hasRequiredSize(firstClauseWithoutBreak)) {
          for (let j = 0; j < i; j++) {
            const secondClauseWithoutBreak = takeWithoutBreak(expandSingleBlockStatement(cases[j].consequent));

            if (areEquivalent(firstClauseWithoutBreak, secondClauseWithoutBreak, context.getSourceCode())) {
              context.report({
                message: MESSAGE,
                data: {
                  type: "case",
                  line: String(cases[j].loc!.start.line),
                },
                node: cases[i],
              });
              break;
            }
          }
        }
      }
    }

    function collectIfBranches(node: estree.IfStatement) {
      const branches: estree.Statement[] = [node.consequent];
      let statement = node.alternate;

      while (statement) {
        if (isIfStatement(statement)) {
          branches.push(statement.consequent);
          statement = statement.alternate;
        } else {
          branches.push(statement);
          break;
        }
      }

      return branches;
    }

    function hasRequiredSize(nodes: estree.Statement[]) {
      if (nodes.length > 0) {
        const tokens = [
          ...context.getSourceCode().getTokens(nodes[0]),
          ...context.getSourceCode().getTokens(nodes[nodes.length - 1]),
        ].filter(token => token.value !== "{" && token.value !== "}");
        return tokens.length > 0 && tokens[tokens.length - 1].loc.end.line > tokens[0].loc.start.line;
      }
      return false;
    }

    function compareIfBranches(a: estree.Statement, b: estree.Statement) {
      const equivalent = areEquivalent(a, b, context.getSourceCode());
      if (equivalent && b.loc) {
        context.report({
          message: MESSAGE,
          data: {
            type: "branch",
            line: String(b.loc.start.line),
          },
          node: a,
        });
      }
      return equivalent;
    }

    function takeWithoutBreak(nodes: estree.Statement[]) {
      return nodes.length > 0 && nodes[nodes.length - 1].type === "BreakStatement" ? nodes.slice(0, -1) : nodes;
    }

    function expandSingleBlockStatement(nodes: estree.Statement[]) {
      if (nodes.length === 1) {
        const node = nodes[0];
        if (isBlockStatement(node)) {
          return node.body;
        }
      }
      return nodes;
    }
  },
};

export = rule;
