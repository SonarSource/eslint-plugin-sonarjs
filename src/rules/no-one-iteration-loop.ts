import { Rule } from "eslint";
import { Node } from "estree";
import { isContinueStatement, getParent, isWhileStatement, isForStatement } from "../utils/nodes";

const rule: Rule.RuleModule = {
  create(context: Rule.RuleContext) {
    const loopingNodes: Set<Node> = new Set();
    const loops: Set<Node> = new Set();
    const loopsAndTheirSegments: { loop: Node; segments: Rule.CodePathSegment[] }[] = [];

    let currentCodePaths: Rule.CodePath[] = [];

    return {
      ForStatement(node: Node) {
        loops.add(node);
      },
      WhileStatement(node: Node) {
        loops.add(node);
      },
      DoWhileStatement(node: Node) {
        loops.add(node);
      },

      onCodePathStart(codePath: Rule.CodePath) {
        currentCodePaths.push(codePath);
      },

      onCodePathEnd() {
        currentCodePaths.pop();
      },

      "*"() {
        const parent = getParent(context);
        // required to correctly process "continue" looping
        if (isWhileStatement(parent) || isForStatement(parent)) {
          const currentCodePath = currentCodePaths[currentCodePaths.length - 1];
          loopsAndTheirSegments.push({ segments: currentCodePath.currentSegments, loop: parent });
        }
      },

      onCodePathSegmentLoop(_, toSegment: Rule.CodePathSegment, node: Node) {
        if (isContinueStatement(node)) {
          loopsAndTheirSegments.find(({ segments, loop }) => {
            if (segments.includes(toSegment)) {
              loopingNodes.add(loop);
              return true;
            }
            return false;
          });
        } else {
          loopingNodes.add(node);
        }
      },

      "Program:exit"() {
        loops.forEach(loop => {
          if (!loopingNodes.has(loop)) {
            context.report({
              message: "Refactor this loop to do more than one iteration.",
              loc: context.getSourceCode().getFirstToken(loop)!.loc,
            });
          }
        });
      },
    };
  },
};

export = rule;
