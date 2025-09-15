import {
  ArrowFunctionExpression,
  BlockStatement,
  ParenthesisExpression,
  CallExpression,
  AwaitExpression,
  TryStatement,
  Identifier,
  Literal,
  ReturnStatement,
  ExpressionStatement,
  AssignmentExpression,
} from '../src/node-generator';

describe('Node Generator', () => {
  describe('Identifier', () => {
    it('should create identifier node', () => {
      const node = Identifier('testVar');
      
      expect(node.type).toBe('Identifier');
      expect(node.name).toBe('testVar');
    });

    it('should handle special characters in names', () => {
      const node = Identifier('_$validName123');
      
      expect(node.type).toBe('Identifier');
      expect(node.name).toBe('_$validName123');
    });

    it('should handle empty string', () => {
      const node = Identifier('');
      
      expect(node.type).toBe('Identifier');
      expect(node.name).toBe('');
    });
  });

  describe('Literal', () => {
    it('should create string literal', () => {
      const node = Literal('hello world');
      
      expect(node.type).toBe('Literal');
      expect(node.value).toBe('hello world');
    });

    it('should create number literal', () => {
      const node = Literal(42);
      
      expect(node.type).toBe('Literal');
      expect(node.value).toBe(42);
    });

    it('should create boolean literal', () => {
      const node = Literal(true);
      
      expect(node.type).toBe('Literal');
      expect(node.value).toBe(true);
    });

    it('should create null literal', () => {
      const node = Literal(null);
      
      expect(node.type).toBe('Literal');
      expect(node.value).toBe(null);
    });

    it('should handle zero', () => {
      const node = Literal(0);
      
      expect(node.type).toBe('Literal');
      expect(node.value).toBe(0);
    });

    it('should handle negative numbers', () => {
      const node = Literal(-42.5);
      
      expect(node.type).toBe('Literal');
      expect(node.value).toBe(-42.5);
    });

    it('should handle empty string', () => {
      const node = Literal('');
      
      expect(node.type).toBe('Literal');
      expect(node.value).toBe('');
    });
  });

  describe('BlockStatement', () => {
    it('should create empty block statement', () => {
      const node = BlockStatement();
      
      expect(node.type).toBe('BlockStatement');
      expect(node.body).toEqual([]);
    });

    it('should create block statement with single statement', () => {
      const stmt = ExpressionStatement(Literal(42));
      const node = BlockStatement(stmt);
      
      expect(node.type).toBe('BlockStatement');
      expect(node.body).toHaveLength(1);
      expect(node.body[0]).toBe(stmt);
    });

    it('should create block statement with multiple statements', () => {
      const stmt1 = ExpressionStatement(Literal(1));
      const stmt2 = ExpressionStatement(Literal(2));
      const stmt3 = ReturnStatement(Literal(3));
      const node = BlockStatement(stmt1, stmt2, stmt3);
      
      expect(node.type).toBe('BlockStatement');
      expect(node.body).toHaveLength(3);
      expect(node.body[0]).toBe(stmt1);
      expect(node.body[1]).toBe(stmt2);
      expect(node.body[2]).toBe(stmt3);
    });
  });

  describe('ReturnStatement', () => {
    it('should create return statement with argument', () => {
      const arg = Literal(42);
      const node = ReturnStatement(arg);
      
      expect(node.type).toBe('ReturnStatement');
      expect(node.argument).toBe(arg);
    });

    it('should create return statement without argument', () => {
      const node = ReturnStatement();
      
      expect(node.type).toBe('ReturnStatement');
      expect(node.argument).toBe(null);
    });

    it('should handle null argument explicitly', () => {
      const node = ReturnStatement(null);
      
      expect(node.type).toBe('ReturnStatement');
      expect(node.argument).toBe(null);
    });

    it('should handle undefined argument', () => {
      const node = ReturnStatement(undefined);
      
      expect(node.type).toBe('ReturnStatement');
      expect(node.argument).toBe(null);
    });
  });

  describe('ExpressionStatement', () => {
    it('should create expression statement with literal', () => {
      const expr = Literal(42);
      const node = ExpressionStatement(expr);
      
      expect(node.type).toBe('ExpressionStatement');
      expect(node.expression).toBe(expr);
    });

    it('should create expression statement with identifier', () => {
      const expr = Identifier('x');
      const node = ExpressionStatement(expr);
      
      expect(node.type).toBe('ExpressionStatement');
      expect(node.expression).toBe(expr);
    });

    it('should handle complex expressions', () => {
      const expr = CallExpression(Identifier('func'), [Literal(1), Literal(2)]);
      const node = ExpressionStatement(expr);
      
      expect(node.type).toBe('ExpressionStatement');
      expect(node.expression).toBe(expr);
    });
  });

  describe('CallExpression', () => {
    it('should create call expression with no arguments', () => {
      const callee = Identifier('func');
      const node = CallExpression(callee, []);
      
      expect(node.type).toBe('CallExpression');
      expect(node.callee).toBe(callee);
      expect(node.arguments).toEqual([]);
    });

    it('should create call expression with single argument', () => {
      const callee = Identifier('func');
      const arg = Literal(42);
      const node = CallExpression(callee, [arg]);
      
      expect(node.type).toBe('CallExpression');
      expect(node.callee).toBe(callee);
      expect(node.arguments).toHaveLength(1);
      expect(node.arguments[0]).toBe(arg);
    });

    it('should create call expression with multiple arguments', () => {
      const callee = Identifier('func');
      const arg1 = Literal(1);
      const arg2 = Literal(2);
      const arg3 = Identifier('x');
      const node = CallExpression(callee, [arg1, arg2, arg3]);
      
      expect(node.type).toBe('CallExpression');
      expect(node.callee).toBe(callee);
      expect(node.arguments).toHaveLength(3);
      expect(node.arguments[0]).toBe(arg1);
      expect(node.arguments[1]).toBe(arg2);
      expect(node.arguments[2]).toBe(arg3);
    });

    it('should handle nested call expressions', () => {
      const innerCall = CallExpression(Identifier('inner'), [Literal(1)]);
      const outerCall = CallExpression(Identifier('outer'), [innerCall]);
      
      expect(outerCall.type).toBe('CallExpression');
      expect(outerCall.callee.type).toBe('Identifier');
      expect(outerCall.arguments[0]).toBe(innerCall);
    });
  });

  describe('ArrowFunctionExpression', () => {
    it('should create arrow function with no parameters and expression body', () => {
      const body = Literal(42);
      const node = ArrowFunctionExpression([], body);
      
      expect(node.type).toBe('ArrowFunctionExpression');
      expect(node.id).toBe(null);
      expect(node.params).toEqual([]);
      expect(node.body).toBe(body);
    });

    it('should create arrow function with single parameter', () => {
      const param = Identifier('x');
      const body = Identifier('x');
      const node = ArrowFunctionExpression([param], body);
      
      expect(node.type).toBe('ArrowFunctionExpression');
      expect(node.params).toHaveLength(1);
      expect(node.params[0]).toBe(param);
      expect(node.body).toBe(body);
    });

    it('should create arrow function with multiple parameters', () => {
      const param1 = Identifier('x');
      const param2 = Identifier('y');
      const body = BlockStatement();
      const node = ArrowFunctionExpression([param1, param2], body);
      
      expect(node.type).toBe('ArrowFunctionExpression');
      expect(node.params).toHaveLength(2);
      expect(node.params[0]).toBe(param1);
      expect(node.params[1]).toBe(param2);
      expect(node.body).toBe(body);
    });

    it('should create arrow function with block statement body', () => {
      const body = BlockStatement(ReturnStatement(Literal(42)));
      const node = ArrowFunctionExpression([], body);
      
      expect(node.type).toBe('ArrowFunctionExpression');
      expect(node.body).toBe(body);
      expect(node.body.type).toBe('BlockStatement');
    });
  });

  describe('AssignmentExpression', () => {
    it('should create assignment expression with equals operator', () => {
      const left = Identifier('x');
      const right = Literal(42);
      const node = AssignmentExpression(left, '=', right);
      
      expect(node.type).toBe('AssignmentExpression');
      expect(node.left).toBe(left);
      expect(node.operator).toBe('=');
      expect(node.right).toBe(right);
    });

    it('should create assignment expression with compound operators', () => {
      const left = Identifier('x');
      const right = Literal(5);
      
      const addNode = AssignmentExpression(left, '+=', right);
      expect(addNode.operator).toBe('+=');
      
      const subNode = AssignmentExpression(left, '-=', right);
      expect(subNode.operator).toBe('-=');
      
      const mulNode = AssignmentExpression(left, '*=', right);
      expect(mulNode.operator).toBe('*=');
      
      const divNode = AssignmentExpression(left, '/=', right);
      expect(divNode.operator).toBe('/=');
    });

    it('should handle complex left-hand side', () => {
      const left = Identifier('obj');
      const right = Literal('value');
      const node = AssignmentExpression(left, '=', right);
      
      expect(node.left).toBe(left);
      expect(node.right).toBe(right);
    });
  });

  describe('AwaitExpression', () => {
    it('should create await expression', () => {
      const arg = Identifier('promise');
      const node = AwaitExpression(arg);
      
      expect(node.type).toBe('AwaitExpression');
      expect(node.argument).toBe(arg);
    });

    it('should create await expression with call expression', () => {
      const call = CallExpression(Identifier('fetch'), [Literal('url')]);
      const node = AwaitExpression(call);
      
      expect(node.type).toBe('AwaitExpression');
      expect(node.argument).toBe(call);
    });

    it('should create await expression with literal', () => {
      const literal = Literal(42);
      const node = AwaitExpression(literal);
      
      expect(node.type).toBe('AwaitExpression');
      expect(node.argument).toBe(literal);
    });
  });

  describe('TryStatement', () => {
    it('should create try statement with only try block', () => {
      const tryBlock = BlockStatement(ExpressionStatement(Literal(1)));
      const node = TryStatement(tryBlock);
      
      expect(node.type).toBe('TryStatement');
      expect(node.block).toBe(tryBlock);
      expect(node.handler).toBe(null);
      expect(node.finalizer).toBe(null);
    });

    it('should create try statement with catch handler', () => {
      const tryBlock = BlockStatement();
      const catchHandler: any = {
        type: 'CatchClause',
        param: Identifier('e'),
        body: BlockStatement(),
        start: 0,
        end: 0,
      };
      const node = TryStatement(tryBlock, catchHandler);
      
      expect(node.type).toBe('TryStatement');
      expect(node.block).toBe(tryBlock);
      expect(node.handler).toBe(catchHandler);
      expect(node.finalizer).toBe(null);
    });

    it('should create try statement with finally block', () => {
      const tryBlock = BlockStatement();
      const finallyBlock = BlockStatement();
      const node = TryStatement(tryBlock, null, finallyBlock);
      
      expect(node.type).toBe('TryStatement');
      expect(node.block).toBe(tryBlock);
      expect(node.handler).toBe(null);
      expect(node.finalizer).toBe(finallyBlock);
    });

    it('should create try statement with both catch and finally', () => {
      const tryBlock = BlockStatement();
      const catchHandler: any = {
        type: 'CatchClause',
        param: Identifier('e'),
        body: BlockStatement(),
        start: 0,
        end: 0,
      };
      const finallyBlock = BlockStatement();
      const node = TryStatement(tryBlock, catchHandler, finallyBlock);
      
      expect(node.type).toBe('TryStatement');
      expect(node.block).toBe(tryBlock);
      expect(node.handler).toBe(catchHandler);
      expect(node.finalizer).toBe(finallyBlock);
    });

    it('should handle undefined parameters correctly', () => {
      const tryBlock = BlockStatement();
      const node = TryStatement(tryBlock, undefined, undefined);
      
      expect(node.handler).toBe(null);
      expect(node.finalizer).toBe(null);
    });
  });

  describe('ParenthesisExpression', () => {
    it('should create parenthesized expression', () => {
      const expr = Literal(42);
      const node = ParenthesisExpression(expr);
      
      expect(node.type).toBe('ParenthesizedExpression');
      expect(node.expression).toBe(expr);
    });

    it('should wrap complex expressions', () => {
      const call = CallExpression(Identifier('func'), [Literal(1)]);
      const node = ParenthesisExpression(call);
      
      expect(node.type).toBe('ParenthesizedExpression');
      expect(node.expression).toBe(call);
    });

    it('should handle nested parentheses', () => {
      const inner = ParenthesisExpression(Literal(42));
      const outer = ParenthesisExpression(inner);
      
      expect(outer.expression).toBe(inner);
      expect(inner.expression.type).toBe('Literal');
    });
  });

  describe('Integration tests', () => {
    it('should create complex nested structure', () => {
      // Create: (() => { try { return x; } finally { x = x + 1; } })()
      const tryBlock = BlockStatement(ReturnStatement(Identifier('x')));
      const finallyBlock = BlockStatement(
        ExpressionStatement(
          AssignmentExpression(
            Identifier('x'),
            '=',
            CallExpression(Identifier('add'), [Identifier('x'), Literal(1)])
          )
        )
      );
      const tryStmt = TryStatement(tryBlock, null, finallyBlock);
      const arrowFn = ArrowFunctionExpression([], BlockStatement(tryStmt));
      const callExpr = CallExpression(arrowFn, []);
      
      expect(callExpr.type).toBe('CallExpression');
      expect((callExpr.callee as any).type).toBe('ArrowFunctionExpression');
      expect((callExpr.callee as any).body.type).toBe('BlockStatement');
      expect((callExpr.callee as any).body.body[0].type).toBe('TryStatement');
    });

    it('should create function with multiple statements', () => {
      // Create: (x, y) => { const sum = x + y; return sum; }
      const assignStmt = ExpressionStatement(
        AssignmentExpression(
          Identifier('sum'),
          '=',
          CallExpression(Identifier('add'), [Identifier('x'), Identifier('y')])
        )
      );
      const returnStmt = ReturnStatement(Identifier('sum'));
      const body = BlockStatement(assignStmt, returnStmt);
      const fn = ArrowFunctionExpression([Identifier('x'), Identifier('y')], body);
      
      expect(fn.params).toHaveLength(2);
      expect((fn.body as any).body).toHaveLength(2);
      expect((fn.body as any).body[0].type).toBe('ExpressionStatement');
      expect((fn.body as any).body[1].type).toBe('ReturnStatement');
    });

    it('should create async function structure', () => {
      // Create: async () => { const result = await promise; return result; }
      const awaitExpr = AwaitExpression(Identifier('promise'));
      const assignStmt = ExpressionStatement(
        AssignmentExpression(Identifier('result'), '=', awaitExpr)
      );
      const returnStmt = ReturnStatement(Identifier('result'));
      const body = BlockStatement(assignStmt, returnStmt);
      const fn = ArrowFunctionExpression([], body);
      
      expect((fn.body as any).body[0].expression.right.type).toBe('AwaitExpression');
      expect((fn.body as any).body[1].argument.type).toBe('Identifier');
    });

    it('should handle empty structures correctly', () => {
      const emptyBlock = BlockStatement();
      const emptyCall = CallExpression(Identifier('func'), []);
      const emptyFn = ArrowFunctionExpression([], emptyBlock);
      
      expect(emptyBlock.body).toEqual([]);
      expect(emptyCall.arguments).toEqual([]);
      expect(emptyFn.params).toEqual([]);
    });
  });
});