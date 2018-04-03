import { Rule } from "eslint";
import { Node, SwitchStatement } from "estree";

const MESSAGE = '"switch" statements should have at least 3 "case" clauses';

const rule: Rule.RuleModule = {
  create(context: Rule.RuleContext) {
    return {
      SwitchStatement(node: Node) {
        const switchStatement = node as SwitchStatement;
        const { cases } = switchStatement;
        const hasDefault = cases.some(x => !x.test);
        if (cases.length < 2 || (cases.length === 2 && hasDefault)) {
          const firstToken = context.getSourceCode().getFirstToken(node);
          if (firstToken) {
            context.report({ message: MESSAGE, loc: firstToken.loc });
          }
        }
      },
    };
  },
};

export = rule;
