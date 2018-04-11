// https://jira.sonarsource.com/browse/RSPEC-4143

import { Rule, AST } from "eslint";
import * as estree from "estree";
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
      SwitchCase(node: estree.Node) {
        const switchCase = node as estree.SwitchCase;
        checkStatements(switchCase.consequent);
      },

      BlockStatement(node: estree.Node) {
        const block = node as estree.BlockStatement;
        checkStatements(block.body);
      },

      Program(node: estree.Node) {
        const program = node as estree.Program;
        checkStatements(program.body);
      },
    };

    function checkStatements(statements: Array<estree.Statement | estree.ModuleDeclaration>) {
      const usedKeys: Map<string, KeyWriteCollectionUsage> = new Map();
      let collection: estree.Node | undefined;
      statements.forEach(statement => {
        const keyWriteUsage = getKeyWriteUsage(statement);
        if (keyWriteUsage) {
          if (collection && !areEquivalent(keyWriteUsage.collectionNode, collection, context.getSourceCode())) {
            usedKeys.clear();
          }
          const sameKeyWriteUsage = usedKeys.get(keyWriteUsage.indexOrKey);
          if (sameKeyWriteUsage && sameKeyWriteUsage.node.loc) {
            context.report({
              node: keyWriteUsage.node,
              message: 'Verify this is the index that was intended; "{{index}}" was already set on line {{line}}.',
              data: {
                index: keyWriteUsage.indexOrKey,
                line: String(sameKeyWriteUsage.node.loc.start.line),
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

    function getKeyWriteUsage(node: estree.Node): KeyWriteCollectionUsage | undefined {
      if (isExpressionStatement(node)) {
        return arrayKeyWriteUsage(node.expression) || mapOrSetKeyWriteUsage(node.expression);
      }
      return undefined;
    }

    function arrayKeyWriteUsage(node: estree.Node): KeyWriteCollectionUsage | undefined {
      // a[b] = ...
      if (isSimpleAssignment(node) && isMemberExpression(node.left) && node.left.computed) {
        const { left, right } = node;
        const index = extractIndex(left.property);
        if (index !== undefined && !isUsed(left.object, right)) {
          return {
            collectionNode: left.object,
            indexOrKey: index,
            node,
          };
        }
      }
      return undefined;
    }

    function mapOrSetKeyWriteUsage(node: estree.Node): KeyWriteCollectionUsage | undefined {
      if (isCallExpression(node) && isMemberExpression(node.callee)) {
        const propertyAccess = node.callee;
        if (isIdentifier(propertyAccess.property)) {
          const methodName = propertyAccess.property.name;
          const addMethod = methodName === "add" && node.arguments.length === 1;
          const setMethod = methodName === "set" && node.arguments.length === 2;

          if (addMethod || setMethod) {
            const key = extractIndex(node.arguments[0]);
            if (key) {
              return {
                collectionNode: propertyAccess.object,
                indexOrKey: key,
                node,
              };
            }
          }
        }
      }
      return undefined;
    }

    function extractIndex(node: estree.Node): string | undefined {
      if (isLiteral(node)) {
        const { value } = node;
        return typeof value === "number" || typeof value === "string" ? String(value) : undefined;
      } else if (isIdentifier(node)) {
        return node.name;
      }
      return undefined;
    }

    function isUsed(value: estree.Node, expression: estree.Expression) {
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

function isSimpleAssignment(node: estree.Node): node is estree.AssignmentExpression {
  return isAssignmentExpression(node) && node.operator === "=";
}

interface KeyWriteCollectionUsage {
  collectionNode: estree.Node;
  indexOrKey: string;
  node: estree.Node;
}

export = rule;
