import { Rule, AST } from "eslint";
import {
  Node,
  SwitchCase,
  BlockStatement,
  Statement,
  AssignmentExpression,
  MemberExpression,
  Expression,
  Program,
  ModuleDeclaration,
} from "estree";
import { areEquivalent } from "../utils/equivalence";
import {
  isExpressionStatement,
  isMemberExpression,
  isAssignmentExpression,
  isLiteral,
  isIdentifier,
  isCallExpression,
} from "../utils/nodes";

const rule: Rule.RuleModule = {
  create(context: Rule.RuleContext) {
    return {
      SwitchCase(node: Node) {
        const switchCase = node as SwitchCase;
        checkStatements(switchCase.consequent);
      },

      BlockStatement(node: Node) {
        const block = node as BlockStatement;
        checkStatements(block.body);
      },

      Program(node: Node) {
        const program = node as Program;
        checkStatements(program.body);
      },
    };

    function checkStatements(statements: Array<Statement | ModuleDeclaration>) {
      const usedKeys: Map<string, KeyWriteCollectionUsage> = new Map();
      let collection: Node | null = null;
      statements.forEach(statement => {
        const keyWriteUsage = getKeyWriteUsage(statement);
        if (keyWriteUsage) {
          if (collection && !areEquivalent(keyWriteUsage.collectionNode, collection, context.getSourceCode())) {
            usedKeys.clear();
          }
          const sameKeyWriteUsage = usedKeys.get(keyWriteUsage.indexOrKey);
          if (sameKeyWriteUsage) {
            context.report({
              node: keyWriteUsage.node,
              message: 'Verify this is the index that was intended; "{{index}}" was already set on line {{line}}.',
              data: {
                index: keyWriteUsage.indexOrKey,
                line: String(sameKeyWriteUsage.node.loc!.start.line),
              },
            });
          }
          usedKeys.set(keyWriteUsage.indexOrKey, keyWriteUsage);
          collection = keyWriteUsage.collectionNode;
        } else {
          usedKeys.clear();
        }
      });
    }

    function getKeyWriteUsage(node: Node): KeyWriteCollectionUsage | undefined {
      if (isExpressionStatement(node)) {
        const expr = node.expression;
        return arrayKeyWriteUsage(expr) || mapOrSetKeyWriteUsage(expr);
      }
    }

    function arrayKeyWriteUsage(node: Node): KeyWriteCollectionUsage | undefined {
      // a[b] = ...
      if (isSimpleAssignment(node) && isMemberExpression(node.left) && node.left.computed) {
        const lhs = node.left as MemberExpression;
        const index = extractIndex(lhs.property);
        if (!index || isUsed(lhs.object, node.right)) return;

        return {
          collectionNode: lhs.object,
          indexOrKey: index,
          node: lhs.object,
        };
      }
    }

    function mapOrSetKeyWriteUsage(node: Node): KeyWriteCollectionUsage | undefined {
      if (isCallExpression(node) && isMemberExpression(node.callee)) {
        const propertyAccess = node.callee;
        if (isIdentifier(propertyAccess.property)) {
          const methodName = propertyAccess.property.name;
          const addMethod = methodName === "add" && node.arguments.length == 1;
          const setMethod = methodName === "set" && node.arguments.length == 2;

          if (addMethod || setMethod) {
            const key = extractIndex(node.arguments[0]);
            if (!key) return;
            return {
              collectionNode: propertyAccess.object,
              indexOrKey: key,
              node: propertyAccess.object,
            };
          }
        }
      }
    }

    function extractIndex(node: Node): string | undefined {
      if (isLiteral(node)) {
        const value = node.value;
        return typeof value === "number" || typeof value === "string" ? String(value) : undefined;
      } else if (isIdentifier(node)) {
        return node.name;
      }
    }

    function isUsed(value: Node, expression: Expression) {
      const valueTokens = context.getSourceCode().getTokens(value);
      const expressionTokens = context.getSourceCode().getTokens(expression);

      const foundUsage = expressionTokens.find((token, index) => {
        if (eq(token, valueTokens[0])) {
          for (
            let expressionIndex = index, valueIndex = 0;
            expressionIndex < expressionTokens.length && valueIndex < valueTokens.length;
            expressionIndex++, valueIndex++
          ) {
            if (!eq(expressionTokens[expressionIndex], valueTokens[valueIndex])) {
              break;
            } else if (valueIndex === valueTokens.length - 1) {
              return true;
            }
          }
        }
        return false;
      });

      return foundUsage !== undefined;
    }
  },
};

function eq(token1: AST.Token, token2: AST.Token) {
  return token1.value === token2.value;
}

function isSimpleAssignment(node: Node): node is AssignmentExpression {
  return isAssignmentExpression(node) && node.operator === "=";
}

interface KeyWriteCollectionUsage {
  collectionNode: Node;
  indexOrKey: string;
  node: Node;
}

export = rule;
