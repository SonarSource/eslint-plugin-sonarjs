import { Rule } from "eslint";
import * as estree from "estree";
import { getParent } from "./nodes";

/**
 * Returns a location of the "main" function token:
 * - function name for a function declaration, method or accessor
 * - "function" keyword for a function expression
 * - "=>" for an arrow function
 */
export function getMainFunctionTokenLocation(fn: estree.Function, context: Rule.RuleContext) {
  let location: estree.SourceLocation | null | undefined;

  if (fn.type === "FunctionDeclaration") {
    // `fn.id` can be null when it is `export default function` (despite of the @types/estree definition)
    if (fn.id) {
      location = fn.id.loc;
    } else {
      const token = context.getSourceCode().getFirstToken(fn);
      location = token && token.loc;
    }
  } else if (fn.type === "FunctionExpression") {
    const parent = getParent(context);
    if (parent && parent.type === "MethodDefinition") {
      location = parent.key.loc;
    } else {
      const token = context.getSourceCode().getFirstToken(fn);
      location = token && token.loc;
    }
  } else if (fn.type === "ArrowFunctionExpression") {
    const token = context.getSourceCode().getTokenBefore(fn.body);
    location = token && token.loc;
  }

  return location!;
}
