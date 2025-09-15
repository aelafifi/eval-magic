import { ReturnStatement } from "../node-generator";
import { DirectionalWalkCallback, StepInfo } from "estree-walk-plus";
import * as acorn from "acorn";

export const Program: DirectionalWalkCallback = (
  step: StepInfo,
  state: any,
) => {
  if (step.ancestor) return;

  step.node.type = "BlockStatement";

  // Inject all exports at the end of the program as a return statement
  step._node.body.push(
    ReturnStatement({
      type: "ObjectExpression",
      properties: state.exports.map(
        ({ declaration: value, exported: key, spread }) =>
          spread
            ? {
                type: "SpreadElement",
                argument: value,
              }
            : {
                type: "Property",
                key,
                value,
                shorthand: key?.type === "Identifier" && key === value,
              },
      ),
    } as any),
  );
};

export const AwaitExpression = (step: StepInfo, state: any) => {
  state.hasAwait = true;
};

export const Identifier = (step: StepInfo, state: any) => {
  state.identifiers.add(step._node.name);
};
