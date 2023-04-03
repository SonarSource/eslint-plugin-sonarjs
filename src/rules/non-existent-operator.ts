/*
 * eslint-plugin-sonarjs
 * Copyright (C) 2018-2021 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
// https://sonarsource.github.io/rspec/#/rspec/S2757

import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

import docsUrl from '../utils/docs-url';

const rule: TSESLint.RuleModule<string, string[]> = {
  meta: {
    messages: {
      useExistingOperator: 'Was "{{operator}}=" meant instead?',
      suggestExistingOperator: 'Replace with "{{operator}}" operator',
      confusingEqual: 'Confusing combinations of non-null assertion and equal test like "a! == b", which looks very similar to not equal "a !== b".',
      confusingAssign: 'Confusing combinations of non-null assertion and equal test like "a! = b", which looks very similar to not equal "a != b".',
      notNeedInEqualTest: 'Unnecessary non-null assertion (!) in equal test.',
      notNeedInAssign: 'Unnecessary non-null assertion (!) in assignment left hand.',
      wrapUpLeft: 'Wrap up left hand to avoid putting non-null assertion "!" and "=" together.',
    },
    schema: [],
    type: 'problem',
    hasSuggestions: true,
    docs: {
      description: 'Non-existent operators "=+", "=-" and "=!" should not be used',
      recommended: 'error',
      url: docsUrl(__filename),
    },
  },
  create(context) {
    return {
      AssignmentExpression(node: TSESTree.Node) {
        const assignmentExpression = node as TSESTree.AssignmentExpression;
        if (assignmentExpression.operator === '=') {
          checkOperator(context, assignmentExpression.right);
        }
        checkAssertion(context, assignmentExpression);
      },
      VariableDeclarator(node: TSESTree.Node) {
        const variableDeclarator = node as TSESTree.VariableDeclarator;
        checkOperator(context, variableDeclarator.init);
      },
      BinaryExpression(node: TSESTree.BinaryExpression) {
        checkAssertion(context, node);
      },
    };
  },
};

/**
 * Reports if operator is "=+", "=-" or "=!"
 *
 * @param context
 * @param unaryNode
 */
function checkOperator(
  context: TSESLint.RuleContext<string, string[]>,
  unaryNode?: TSESTree.Expression | null,
) {
  if (
    unaryNode &&
    unaryNode.type === 'UnaryExpression' &&
    isUnaryOperatorOfInterest(unaryNode.operator)
  ) {
    const sourceCode = context.getSourceCode();
    const assignmentOperatorToken = sourceCode.getTokenBefore(
      unaryNode,
      token => token.value === '=',
    );
    const unaryOperatorToken = sourceCode.getFirstToken(unaryNode);
    const expressionFirstToken = sourceCode.getFirstToken(unaryNode.argument);

    if (
      assignmentOperatorToken != null &&
      unaryOperatorToken != null &&
      expressionFirstToken != null &&
      areAdjacent(assignmentOperatorToken, unaryOperatorToken) &&
      !areAdjacent(unaryOperatorToken, expressionFirstToken)
    ) {
      const suggest: TSESLint.ReportSuggestionArray<string> = [];
      if (unaryNode.parent?.type === 'AssignmentExpression') {
        const range: [number, number] = [
          assignmentOperatorToken.range[0],
          unaryOperatorToken.range[1],
        ];
        const invertedOperators = unaryOperatorToken.value + assignmentOperatorToken.value;
        suggest.push({
          messageId: 'suggestExistingOperator',
          data: {
            operator: invertedOperators,
          },
          fix: fixer => fixer.replaceTextRange(range, invertedOperators),
        });
      }
      context.report({
        messageId: 'useExistingOperator',
        data: {
          operator: unaryNode.operator,
        },
        loc: { start: assignmentOperatorToken.loc.start, end: unaryOperatorToken.loc.end },
        suggest,
      });
    }
  }
}

function isUnaryOperatorOfInterest(operator: TSESTree.UnaryExpression['operator']): boolean {
  return operator === '-' || operator === '+' || operator === '!';
}

function areAdjacent(first: TSESLint.AST.Token, second: TSESLint.AST.Token): boolean {
  return (
    first.loc.end.column === second.loc.start.column && first.loc.end.line === second.loc.start.line
  );
}

export = rule;

/**
 * Reports if non-null assertion at confusing place like: "! =", "! ==" or "! ==="
 *
 * @param context
 * @param node
 */
function checkAssertion(
  context: TSESLint.RuleContext<string, string[]>,
  node: TSESTree.BinaryExpression | TSESTree.AssignmentExpression,
) {
  const sourceCode = context.getSourceCode();
  if (!['=', '==', '==='].includes(node.operator)) {
    return;
  }
  const isAssign = node.operator === '=';
  const leftHandFinalToken = sourceCode.getLastToken(node.left);
  const tokenAfterLeft = sourceCode.getTokenAfter(node.left);
  if (
    !(
      leftHandFinalToken?.type === AST_TOKEN_TYPES.Punctuator &&
      leftHandFinalToken?.value === '!' &&
      tokenAfterLeft?.value !== ')'
    )
  ) {
    return;
  }
  if (isLeftHandPrimaryExpression(node.left)) {
    context.report({
      node,
      messageId: isAssign ? 'confusingAssign' : 'confusingEqual',
      suggest: [
        {
          messageId: isAssign ? 'notNeedInAssign' : 'notNeedInEqualTest',
          fix: (fixer): TSESLint.RuleFix[] => [fixer.remove(leftHandFinalToken)],
        },
      ],
    });
  } else {
    context.report({
      node,
      messageId: isAssign ? 'confusingAssign' : 'confusingEqual',
      suggest: [
        {
          messageId: 'wrapUpLeft',
          fix: (fixer): TSESLint.RuleFix[] => [
            fixer.insertTextBefore(node.left, '('),
            fixer.insertTextAfter(node.left, ')'),
          ],
        },
      ],
    });
  }
}

function isLeftHandPrimaryExpression(
  node: TSESTree.Expression | TSESTree.PrivateIdentifier,
): boolean {
  return node.type === AST_NODE_TYPES.TSNonNullExpression;
}
