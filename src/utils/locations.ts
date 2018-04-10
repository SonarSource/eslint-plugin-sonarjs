import { Rule } from "eslint";
import * as estree from "estree";

/**
 * Returns a location of the "main" function token:
 * - function name for a function declaration, method or accessor
 * - "function" keyword for a function expression
 * - "=>" for an arrow function
 */
export function getMainFunctionTokenLocation(
  fn: estree.Function,
  parent: estree.Node | undefined,
  context: Rule.RuleContext,
) {
  let location: estree.SourceLocation | null | undefined;

  if (fn.type === "FunctionDeclaration") {
    // `fn.id` can be null when it is `export default function` (despite of the @types/estree definition)
    if (fn.id) {
      location = fn.id.loc;
    } else {
      const token = getTokenByValue(fn, "function", context);
      location = token && token.loc;
    }
  } else if (fn.type === "FunctionExpression") {
    if (parent && (parent.type === "MethodDefinition" || parent.type === "Property")) {
      location = parent.key.loc;
    } else {
      const token = getTokenByValue(fn, "function", context);
      location = token && token.loc;
    }
  } else if (fn.type === "ArrowFunctionExpression") {
    const token = context
      .getSourceCode()
      .getTokensBefore(fn.body)
      .reverse()
      .find(token => token.value === "=>");

    location = token && token.loc;
  }

  return location!;
}

function getTokenByValue(node: estree.Node, value: string, context: Rule.RuleContext) {
  return context
    .getSourceCode()
    .getTokens(node)
    .find(token => token.value === value);
}
