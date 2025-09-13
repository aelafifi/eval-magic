import type {
  ArrowFunctionExpression,
  AssignmentExpression,
  AssignmentOperator,
  AwaitExpression,
  BlockStatement,
  CallExpression,
  CatchClause,
  Expression,
  ExpressionStatement,
  Identifier,
  Literal,
  ParenthesizedExpression,
  Pattern,
  ReturnStatement,
  Statement,
  TryStatement,
} from "acorn";
import { PrivateIdentifier } from "acorn";

export function ArrowFunctionExpression(
  params: Pattern[],
  body: BlockStatement | Expression,
): ArrowFunctionExpression {
  return {
    type: "ArrowFunctionExpression",
    id: null,
    params,
    body,
  } as ArrowFunctionExpression;
}

export function BlockStatement(...body: Statement[]): BlockStatement {
  return {
    type: "BlockStatement",
    body,
  } as BlockStatement;
}

export function ParenthesisExpression(
  expression: Expression,
): ParenthesizedExpression {
  return {
    type: "ParenthesizedExpression",
    expression,
  } as ParenthesizedExpression;
}

export function CallExpression(
  callee: Expression,
  args: (Expression | PrivateIdentifier)[],
): CallExpression {
  return {
    type: "CallExpression",
    callee,
    arguments: args,
  } as CallExpression;
}

export function AwaitExpression(argument: Expression): AwaitExpression {
  return {
    type: "AwaitExpression",
    argument,
  } as AwaitExpression;
}

export function TryStatement(
  block: BlockStatement,
  handler?: CatchClause | null,
  finalizer?: BlockStatement | null,
): TryStatement {
  return {
    type: "TryStatement",
    block,
    handler: handler ?? null,
    finalizer: finalizer ?? null,
  } as TryStatement;
}

export function Identifier(name: string): Identifier {
  return {
    type: "Identifier",
    name,
  } as Identifier;
}

export function Literal(value: string | number | boolean | null): Literal {
  return {
    type: "Literal",
    value,
  } as Literal;
}

export function ReturnStatement(argument?: Expression | null): ReturnStatement {
  return {
    type: "ReturnStatement",
    argument: argument ?? null,
  } as ReturnStatement;
}

export function ExpressionStatement(
  expression: Expression | Literal,
): ExpressionStatement {
  return {
    type: "ExpressionStatement",
    expression,
  } as ExpressionStatement;
}

export function AssignmentExpression(
  left: Pattern,
  operator: AssignmentOperator,
  right: Expression,
): AssignmentExpression {
  return {
    type: "AssignmentExpression",
    operator,
    left,
    right,
  } as AssignmentExpression;
}
