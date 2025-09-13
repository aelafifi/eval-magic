import * as acorn from "acorn";
import { generateVarName, hasOwnProp } from "../utils";
import {
  $__,
  __$__,
  binaryOperatorsMap,
  unaryOperatorsMap,
} from "../operators";
import type { AcornVisitor } from "../acorn-visitor";
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

/**
 * Generate a unique variable name for unary function `$__`
 * so that it doesn't conflict with other user-defined scope variables.
 */
function getUnaryFnName(av: AcornVisitor) {
  if (!av.unaryFnName) {
    av.unaryFnName = generateVarName();
    av.scope[av.unaryFnName] = $__;
  }
  return av.unaryFnName;
}

/**
 * Generate a unique variable name for binary function `__$__`
 * so that it doesn't conflict with other user-defined scope variables.
 */
function getBinaryFnName(av: AcornVisitor) {
  if (!av.binaryFnName) {
    av.binaryFnName = generateVarName();
    av.scope[av.binaryFnName] = __$__;
  }
  return av.binaryFnName;
}

/**
 * Replace `++x` with
 * ```
 * (() => {
 *   x = __$__(x, '+', 1);
 *   return x;
 * })()
 * ```
 */
function preIncrement(
  av: AcornVisitor,
  id: acorn.Identifier,
  operator: string,
) {
  return updateAssign(av, id, operator, Literal(1));
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
function postIncrement(
  av: AcornVisitor,
  id: acorn.Identifier,
  operator: string,
) {
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
                CallExpression(Identifier(getBinaryFnName(av)), [
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
  av: AcornVisitor,
  id: acorn.Identifier,
  operator: string,
  value: acorn.Expression,
) {
  return CallExpression(
    ArrowFunctionExpression(
      [],
      BlockStatement(
        ExpressionStatement(
          AssignmentExpression(
            id,
            "=",
            CallExpression(Identifier(getBinaryFnName(av)), [
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

export default {
  /**
   * Replace unary expressions with a call to the corresponding function.
   *
   * e.g. `-x` becomes `$__('-', x)`
   */
  afterUnaryExpression(this: AcornVisitor, node: acorn.UnaryExpression) {
    if (!this.options.operatorOverloading) return;

    if (!hasOwnProp(unaryOperatorsMap, node.operator)) return;

    Object.assign(
      node,
      CallExpression(Identifier(getUnaryFnName(this)), [
        Literal(node.operator),
        node.argument,
      ]),
    );
  },

  /**
   * Replace binary expressions with a call to the corresponding function.
   *
   * e.g. `x + y` becomes `__$__(x, '+', y)`
   */
  afterBinaryExpression(this: AcornVisitor, node: acorn.BinaryExpression) {
    if (!this.options.operatorOverloading) return;

    if (!hasOwnProp(binaryOperatorsMap, node.operator)) return;

    Object.assign(
      node,
      CallExpression(Identifier(getBinaryFnName(this)), [
        node.left,
        Literal(node.operator),
        node.right,
      ]),
    );
  },

  /**
   * Similar to `afterBinaryExpression`, but for logical expressions.
   */
  afterLogicalExpression(this: AcornVisitor, node: acorn.LogicalExpression) {
    // TODO: re-use `afterBinaryExpression`?
    if (!this.options.operatorOverloading) return;

    if (!hasOwnProp(binaryOperatorsMap, node.operator)) return;

    Object.assign(
      node,
      CallExpression(Identifier(getBinaryFnName(this)), [
        node.left,
        Literal(node.operator),
        node.right,
      ]),
    );
  },

  /**
   * Replace update expressions with a self-call to the corresponding replacement function.
   *
   * Check `preIncrement` and `postIncrement` for more details.
   */
  afterUpdateExpression(this: AcornVisitor, node: acorn.UpdateExpression) {
    if (!this.options.operatorOverloading) return;

    const operator = node.operator[0];
    if (!hasOwnProp(binaryOperatorsMap, operator)) return;

    if (node.argument.type !== "Identifier") return;

    Object.assign(
      node,
      node.prefix
        ? preIncrement(this, node.argument, operator)
        : postIncrement(this, node.argument, operator),
    );
  },

  /**
   * Replace assignment with update expressions with a self-call to the corresponding replacement function.
   *
   * Check `updateAssign` for more details.
   */
  afterAssignmentExpression(
    this: AcornVisitor,
    node: acorn.AssignmentExpression,
  ) {
    if (!this.options.operatorOverloading) return;

    if (node.operator === "=") return;

    const operator = node.operator.slice(0, -1);
    if (!hasOwnProp(binaryOperatorsMap, operator)) return;

    if (node.left.type !== "Identifier") return;

    Object.assign(node, updateAssign(this, node.left, operator, node.right));
  },
};
