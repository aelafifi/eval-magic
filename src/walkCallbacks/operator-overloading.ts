import { hasOwnProp } from "../utils";
import { binaryOperatorsMap, unaryOperatorsMap } from "../operators";
import {
  ArrowFunctionExpression,
  AssignmentExpression,
  BlockStatement,
  CallExpression,
  ExpressionStatement,
  Identifier,
  Literal,
  ReturnStatement,
  TryStatement,
} from "../node-generator";
import { StepInfo } from "estree-walk-plus";
import * as acorn from "acorn"; // /**

/**
 * Replace `++x` with
 * ```
 * (() => {
 *   x = __$__(x, '+', 1);
 *   return x;
 * })()
 * ```
 */
function preIncrement(id: acorn.Identifier, operator: string, state: any) {
  return updateAssign(id, operator, Literal(1), state);
}

/**
 * Replace `x++` with
 * ```
 * (() => {
 *   try {
 *     return x;
 *   } finally {
 *     x = __$__(x, '+', 1);
 *   }
 * })()
 * ```
 */
function postIncrement(id: acorn.Identifier, operator: string, state: any) {
  state.binaryFnUsed = true;
  return CallExpression(
    ArrowFunctionExpression(
      [],
      BlockStatement(
        TryStatement(
          BlockStatement(ReturnStatement(id)),
          null,
          BlockStatement(
            ExpressionStatement(
              AssignmentExpression(
                id,
                "=",
                CallExpression(Identifier(state.binaryFnName), [
                  id,
                  Literal(operator),
                  Literal(1),
                ]),
              ),
            ),
          ),
        ),
      ),
    ),
    [],
  );
}

/**
 * Replace `x += n` with
 * ```
 * (() => {
 *   x = __$__(x, '+', n);
 *   return x;
 * })()
 * ```
 */
function updateAssign(
  id: acorn.Identifier,
  operator: string,
  value: acorn.Expression,
  state: any,
) {
  state.binaryFnUsed = true;
  return CallExpression(
    ArrowFunctionExpression(
      [],
      BlockStatement(
        ExpressionStatement(
          AssignmentExpression(
            id,
            "=",
            CallExpression(Identifier(state.binaryFnName), [
              id,
              Literal(operator),
              value,
            ]),
          ),
        ),
        ReturnStatement(id),
      ),
    ),
    [],
  );
}

/**
 * Replace unary expressions with a call to the corresponding function.
 *
 * e.g. `-x` becomes `$__('-', x)`
 */

export const UnaryExpression = (step: StepInfo, state: any) => {
  if (!state.options.operatorOverloading) return;

  if (!hasOwnProp(unaryOperatorsMap, step._node.operator)) return;

  state.unaryFnUsed = true;
  step.replaceWith(
    CallExpression(Identifier(state.unaryFnName), [
      Literal(step._node.operator),
      step._node.argument,
    ]),
  );
};

/**
 * Replace binary expressions with a call to the corresponding function.
 *
 * e.g. `x + y` becomes `__$__(x, '+', y)`
 */
export const BinaryExpression = (step: StepInfo, state: any) => {
  if (!state.options.operatorOverloading) return;

  if (!hasOwnProp(binaryOperatorsMap, step._node.operator)) return;

  state.binaryFnUsed = true;
  step.replaceWith(
    CallExpression(Identifier(state.binaryFnName), [
      step._node.left,
      Literal(step._node.operator),
      step._node.right,
    ]),
  );
};

/**
 * Similar to `afterBinaryExpression`, but for logical expressions.
 */
export const LogicalExpression = BinaryExpression;

/**
 * Replace update expressions with a self-call to the corresponding replacement function.
 *
 * Check `preIncrement` and `postIncrement` for more details.
 */
export const UpdateExpression = (step: StepInfo, state: any) => {
  if (!state.options.operatorOverloading) return;

  const operator = step._node.operator[0];
  if (!hasOwnProp(binaryOperatorsMap, operator)) return;

  if (step._node.argument.type !== "Identifier") return;

  step.replaceWith(
    step._node.prefix
      ? preIncrement(step._node.argument, operator, state)
      : postIncrement(step._node.argument, operator, state),
  );
};

/**
 * Replace assignment with update expressions with a self-call to the corresponding replacement function.
 *
 * Check `updateAssign` for more details.
 */
export const AssignmentExpression = (step: StepInfo, state: any) => {
  if (!state.options.operatorOverloading) return;

  if (step._node.operator === "=") return;

  const operator = step._node.operator.slice(0, -1);
  if (!hasOwnProp(binaryOperatorsMap, operator)) return;

  if (step._node.left.type !== "Identifier") return;

  step.replaceWith(
    updateAssign(step._node.left, operator, step._node.right, state),
  );
};
