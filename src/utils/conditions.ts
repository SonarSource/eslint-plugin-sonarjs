import * as estree from "estree";
import { isIfStatement } from "./nodes";

/** Returns a list of statements corresponding to a `if - else if - else` chain */
export function collectIfBranches(node: estree.IfStatement) {
  const branches: estree.Statement[] = [node.consequent];
  let endsWithElse = false;
  let statement = node.alternate;

  while (statement) {
    if (isIfStatement(statement)) {
      branches.push(statement.consequent);
      statement = statement.alternate;
    } else {
      branches.push(statement);
      endsWithElse = true;
      break;
    }
  }

  return { branches, endsWithElse };
}

/** Returns a list of `switch` clauses (both `case` and `default`) */
export function collectSwitchBranches(node: estree.SwitchStatement) {
  let endsWithDefault = false;
  const branches = node.cases
    .filter((clause, index) => {
      if (!clause.test) {
        endsWithDefault = true;
      }
      // if a branch has no implementation, it's fall-through and it should not be considered
      // the only expection is the last case
      const isLast = index === node.cases.length - 1;
      return isLast || clause.consequent.length > 0;
    })
    .map(clause => takeWithoutBreak(clause.consequent));
  return { branches, endsWithDefault };
}

/** Excludes the break statement from the list */
export function takeWithoutBreak(nodes: estree.Statement[]) {
  return nodes.length > 0 && nodes[nodes.length - 1].type === "BreakStatement" ? nodes.slice(0, -1) : nodes;
}
