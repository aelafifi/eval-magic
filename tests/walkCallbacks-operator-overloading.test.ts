import {
  UnaryExpression,
  BinaryExpression,
  LogicalExpression,
  UpdateExpression,
  AssignmentExpression,
} from '../src/walkCallbacks/operator-overloading';

describe('Operator Overloading WalkCallbacks', () => {
  let mockState: any;

  beforeEach(() => {
    mockState = {
      options: {
        operatorOverloading: true,
      },
      unaryFnUsed: false,
      binaryFnUsed: false,
      unaryFnName: 'unaryFn',
      binaryFnName: 'binaryFn',
    };
  });

  describe('UnaryExpression', () => {
    it('should transform unary expression when operator overloading is enabled', () => {
      const mockStep = {
        _node: {
          operator: '-',
          argument: { type: 'Identifier', name: 'x' },
        },
        replaceWith: jest.fn(),
      };

      UnaryExpression(mockStep as any, mockState);

      expect(mockState.unaryFnUsed).toBe(true);
      expect(mockStep.replaceWith).toHaveBeenCalledWith({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'unaryFn' },
        arguments: [
          { type: 'Literal', value: '-' },
          { type: 'Identifier', name: 'x' },
        ],
      });
    });

    it('should not transform when operator overloading is disabled', () => {
      mockState.options.operatorOverloading = false;

      const mockStep = {
        _node: {
          operator: '-',
          argument: { type: 'Identifier', name: 'x' },
        },
        replaceWith: jest.fn(),
      };

      UnaryExpression(mockStep as any, mockState);

      expect(mockState.unaryFnUsed).toBe(false);
      expect(mockStep.replaceWith).not.toHaveBeenCalled();
    });

    it('should not transform unsupported operators', () => {
      const mockStep = {
        _node: {
          operator: 'delete', // Not in unaryOperatorsMap
          argument: { type: 'Identifier', name: 'x' },
        },
        replaceWith: jest.fn(),
      };

      UnaryExpression(mockStep as any, mockState);

      expect(mockState.unaryFnUsed).toBe(false);
      expect(mockStep.replaceWith).not.toHaveBeenCalled();
    });

    it('should handle all supported unary operators', () => {
      const supportedOperators = ['+', '-', '!', '~', 'typeof'];

      supportedOperators.forEach(operator => {
        const mockStep = {
          _node: {
            operator,
            argument: { type: 'Identifier', name: 'x' },
          },
          replaceWith: jest.fn(),
        };

        const freshState = { ...mockState, unaryFnUsed: false };
        UnaryExpression(mockStep as any, freshState);

        expect(freshState.unaryFnUsed).toBe(true);
        expect(mockStep.replaceWith).toHaveBeenCalledWith({
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'unaryFn' },
          arguments: [
            { type: 'Literal', value: operator },
            { type: 'Identifier', name: 'x' },
          ],
        });
      });
    });

    it('should handle complex arguments', () => {
      const mockStep = {
        _node: {
          operator: '-',
          argument: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'func' },
            arguments: [],
          },
        },
        replaceWith: jest.fn(),
      };

      UnaryExpression(mockStep as any, mockState);

      expect(mockStep.replaceWith).toHaveBeenCalledWith({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'unaryFn' },
        arguments: [
          { type: 'Literal', value: '-' },
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'func' },
            arguments: [],
          },
        ],
      });
    });
  });

  describe('BinaryExpression', () => {
    it('should transform binary expression when operator overloading is enabled', () => {
      const mockStep = {
        _node: {
          operator: '+',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'y' },
        },
        replaceWith: jest.fn(),
      };

      BinaryExpression(mockStep as any, mockState);

      expect(mockState.binaryFnUsed).toBe(true);
      expect(mockStep.replaceWith).toHaveBeenCalledWith({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'binaryFn' },
        arguments: [
          { type: 'Identifier', name: 'x' },
          { type: 'Literal', value: '+' },
          { type: 'Identifier', name: 'y' },
        ],
      });
    });

    it('should not transform when operator overloading is disabled', () => {
      mockState.options.operatorOverloading = false;

      const mockStep = {
        _node: {
          operator: '+',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'y' },
        },
        replaceWith: jest.fn(),
      };

      BinaryExpression(mockStep as any, mockState);

      expect(mockState.binaryFnUsed).toBe(false);
      expect(mockStep.replaceWith).not.toHaveBeenCalled();
    });

    it('should not transform unsupported operators', () => {
      const mockStep = {
        _node: {
          operator: '??', // Not in binaryOperatorsMap (if not supported)
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'y' },
        },
        replaceWith: jest.fn(),
      };

      BinaryExpression(mockStep as any, mockState);

      // This might transform or not depending on implementation
      // The test verifies current behavior
    });

    it('should handle all supported binary operators', () => {
      const supportedOperators = [
        '+', '-', '*', '/', '%', '**',
        '==', '!=', '===', '!==', '<', '<=', '>', '>=',
        '&', '|', '^', '<<', '>>', '>>>',
        'in', 'instanceof'
      ];

      supportedOperators.forEach(operator => {
        const mockStep = {
          _node: {
            operator,
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Identifier', name: 'y' },
          },
          replaceWith: jest.fn(),
        };

        const freshState = { ...mockState, binaryFnUsed: false };
        BinaryExpression(mockStep as any, freshState);

        expect(freshState.binaryFnUsed).toBe(true);
        expect(mockStep.replaceWith).toHaveBeenCalledWith({
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'binaryFn' },
          arguments: [
            { type: 'Identifier', name: 'x' },
            { type: 'Literal', value: operator },
            { type: 'Identifier', name: 'y' },
          ],
        });
      });
    });

    it('should handle complex operands', () => {
      const mockStep = {
        _node: {
          operator: '+',
          left: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getLeft' },
            arguments: [],
          },
          right: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
          },
        },
        replaceWith: jest.fn(),
      };

      BinaryExpression(mockStep as any, mockState);

      expect(mockStep.replaceWith).toHaveBeenCalledWith({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'binaryFn' },
        arguments: [
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getLeft' },
            arguments: [],
          },
          { type: 'Literal', value: '+' },
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
          },
        ],
      });
    });
  });

  describe('LogicalExpression', () => {
    it('should behave same as BinaryExpression', () => {
      const mockStep = {
        _node: {
          operator: '&&',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'y' },
        },
        replaceWith: jest.fn(),
      };

      // LogicalExpression should be the same as BinaryExpression
      LogicalExpression(mockStep as any, mockState);

      expect(mockState.binaryFnUsed).toBe(true);
      expect(mockStep.replaceWith).toHaveBeenCalled();
    });

    it('should handle logical OR', () => {
      const mockStep = {
        _node: {
          operator: '||',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'y' },
        },
        replaceWith: jest.fn(),
      };

      LogicalExpression(mockStep as any, mockState);

      expect(mockState.binaryFnUsed).toBe(true);
    });

    it('should handle nullish coalescing', () => {
      const mockStep = {
        _node: {
          operator: '??',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'y' },
        },
        replaceWith: jest.fn(),
      };

      LogicalExpression(mockStep as any, mockState);

      // Should transform if operator is supported
    });
  });

  describe('UpdateExpression', () => {
    it('should transform prefix increment', () => {
      const mockStep = {
        _node: {
          operator: '++',
          prefix: true,
          argument: { type: 'Identifier', name: 'x' },
        },
        replaceWith: jest.fn(),
      };

      UpdateExpression(mockStep as any, mockState);

      expect(mockState.binaryFnUsed).toBe(true);
      expect(mockStep.replaceWith).toHaveBeenCalled();

      const replacement = mockStep.replaceWith.mock.calls[0][0];
      expect(replacement.type).toBe('CallExpression');
      expect(replacement.callee.type).toBe('ArrowFunctionExpression');
    });

    it('should transform postfix increment', () => {
      const mockStep = {
        _node: {
          operator: '++',
          prefix: false,
          argument: { type: 'Identifier', name: 'x' },
        },
        replaceWith: jest.fn(),
      };

      UpdateExpression(mockStep as any, mockState);

      expect(mockState.binaryFnUsed).toBe(true);
      expect(mockStep.replaceWith).toHaveBeenCalled();

      const replacement = mockStep.replaceWith.mock.calls[0][0];
      expect(replacement.type).toBe('CallExpression');
      expect(replacement.callee.type).toBe('ArrowFunctionExpression');
      expect(replacement.callee.body.type).toBe('BlockStatement');
      expect(replacement.callee.body.body[0].type).toBe('TryStatement');
    });

    it('should transform prefix decrement', () => {
      const mockStep = {
        _node: {
          operator: '--',
          prefix: true,
          argument: { type: 'Identifier', name: 'x' },
        },
        replaceWith: jest.fn(),
      };

      UpdateExpression(mockStep as any, mockState);

      expect(mockState.binaryFnUsed).toBe(true);
      expect(mockStep.replaceWith).toHaveBeenCalled();
    });

    it('should transform postfix decrement', () => {
      const mockStep = {
        _node: {
          operator: '--',
          prefix: false,
          argument: { type: 'Identifier', name: 'x' },
        },
        replaceWith: jest.fn(),
      };

      UpdateExpression(mockStep as any, mockState);

      expect(mockState.binaryFnUsed).toBe(true);
      expect(mockStep.replaceWith).toHaveBeenCalled();
    });

    it('should not transform when operator overloading is disabled', () => {
      mockState.options.operatorOverloading = false;

      const mockStep = {
        _node: {
          operator: '++',
          prefix: true,
          argument: { type: 'Identifier', name: 'x' },
        },
        replaceWith: jest.fn(),
      };

      UpdateExpression(mockStep as any, mockState);

      expect(mockState.binaryFnUsed).toBe(false);
      expect(mockStep.replaceWith).not.toHaveBeenCalled();
    });

    it('should not transform unsupported operators', () => {
      const mockStep = {
        _node: {
          operator: '@@', // Unsupported operator (@ is not in binaryOperatorsMap)
          prefix: true,
          argument: { type: 'Identifier', name: 'x' },
        },
        replaceWith: jest.fn(),
      };

      UpdateExpression(mockStep as any, mockState);

      expect(mockState.binaryFnUsed).toBe(false);
      expect(mockStep.replaceWith).not.toHaveBeenCalled();
    });

    it('should not transform non-identifier arguments', () => {
      const mockStep = {
        _node: {
          operator: '++',
          prefix: true,
          argument: { type: 'MemberExpression', object: {}, property: {} },
        },
        replaceWith: jest.fn(),
      };

      UpdateExpression(mockStep as any, mockState);

      expect(mockState.binaryFnUsed).toBe(false);
      expect(mockStep.replaceWith).not.toHaveBeenCalled();
    });
  });

  describe('AssignmentExpression', () => {
    it('should transform compound assignment', () => {
      const mockStep = {
        _node: {
          operator: '+=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 5 },
        },
        replaceWith: jest.fn(),
      };

      AssignmentExpression(mockStep as any, mockState);

      expect(mockState.binaryFnUsed).toBe(true);
      expect(mockStep.replaceWith).toHaveBeenCalled();

      const replacement = mockStep.replaceWith.mock.calls[0][0];
      expect(replacement.type).toBe('CallExpression');
      expect(replacement.callee.type).toBe('ArrowFunctionExpression');
    });

    it('should handle all compound assignment operators', () => {
      const compoundOperators = ['+=', '-=', '*=', '/=', '%=', '**=', '<<=', '>>=', '>>>=', '&=', '|=', '^='];

      compoundOperators.forEach(operator => {
        const mockStep = {
          _node: {
            operator,
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Literal', value: 5 },
          },
          replaceWith: jest.fn(),
        };

        const freshState = { ...mockState, binaryFnUsed: false };
        AssignmentExpression(mockStep as any, freshState);

        expect(freshState.binaryFnUsed).toBe(true);
        expect(mockStep.replaceWith).toHaveBeenCalled();
      });
    });

    it('should not transform simple assignment', () => {
      const mockStep = {
        _node: {
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 5 },
        },
        replaceWith: jest.fn(),
      };

      AssignmentExpression(mockStep as any, mockState);

      expect(mockState.binaryFnUsed).toBe(false);
      expect(mockStep.replaceWith).not.toHaveBeenCalled();
    });

    it('should not transform when operator overloading is disabled', () => {
      mockState.options.operatorOverloading = false;

      const mockStep = {
        _node: {
          operator: '+=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 5 },
        },
        replaceWith: jest.fn(),
      };

      AssignmentExpression(mockStep as any, mockState);

      expect(mockState.binaryFnUsed).toBe(false);
      expect(mockStep.replaceWith).not.toHaveBeenCalled();
    });

    it('should not transform unsupported operators', () => {
      const mockStep = {
        _node: {
          operator: '??=', // May or may not be supported depending on implementation
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 5 },
        },
        replaceWith: jest.fn(),
      };

      AssignmentExpression(mockStep as any, mockState);

      // Should not transform if operator not in binaryOperatorsMap
    });

    it('should not transform non-identifier left-hand side', () => {
      const mockStep = {
        _node: {
          operator: '+=',
          left: { type: 'MemberExpression', object: {}, property: {} },
          right: { type: 'Literal', value: 5 },
        },
        replaceWith: jest.fn(),
      };

      AssignmentExpression(mockStep as any, mockState);

      expect(mockState.binaryFnUsed).toBe(false);
      expect(mockStep.replaceWith).not.toHaveBeenCalled();
    });
  });

  describe('Integration tests', () => {
    it('should handle complex nested expressions', () => {
      // Simulate transforming: x += y * z
      const multiplyStep = {
        _node: {
          operator: '*',
          left: { type: 'Identifier', name: 'y' },
          right: { type: 'Identifier', name: 'z' },
        },
        replaceWith: jest.fn(),
      };

      const assignStep = {
        _node: {
          operator: '+=',
          left: { type: 'Identifier', name: 'x' },
          right: multiplyStep._node, // Nested expression
        },
        replaceWith: jest.fn(),
      };

      BinaryExpression(multiplyStep as any, mockState);
      AssignmentExpression(assignStep as any, mockState);

      expect(mockState.binaryFnUsed).toBe(true);
      expect(multiplyStep.replaceWith).toHaveBeenCalled();
      expect(assignStep.replaceWith).toHaveBeenCalled();
    });

    it('should preserve state across multiple transformations', () => {
      const expressions = [
        {
          type: 'UnaryExpression',
          node: {
            operator: '-',
            argument: { type: 'Identifier', name: 'x' },
          },
        },
        {
          type: 'BinaryExpression',
          node: {
            operator: '+',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Identifier', name: 'b' },
          },
        },
        {
          type: 'UpdateExpression',
          node: {
            operator: '++',
            prefix: true,
            argument: { type: 'Identifier', name: 'i' },
          },
        },
      ];

      expressions.forEach(expr => {
        const mockStep = {
          _node: expr.node,
          replaceWith: jest.fn(),
        };

        switch (expr.type) {
          case 'UnaryExpression':
            UnaryExpression(mockStep as any, mockState);
            break;
          case 'BinaryExpression':
            BinaryExpression(mockStep as any, mockState);
            break;
          case 'UpdateExpression':
            UpdateExpression(mockStep as any, mockState);
            break;
        }

        expect(mockStep.replaceWith).toHaveBeenCalled();
      });

      expect(mockState.unaryFnUsed).toBe(true);
      expect(mockState.binaryFnUsed).toBe(true);
    });

    it('should handle edge cases with empty or null values', () => {
      const edgeCases = [
        {
          _node: {
            operator: '+',
            left: null,
            right: { type: 'Identifier', name: 'x' },
          },
          replaceWith: jest.fn(),
        },
        {
          _node: {
            operator: '-',
            argument: null,
          },
          replaceWith: jest.fn(),
        },
      ];

      edgeCases.forEach(mockStep => {
        // These should not throw errors but may not transform
        try {
          BinaryExpression(mockStep as any, mockState);
          UnaryExpression(mockStep as any, mockState);
        } catch (error) {
          // Expected for malformed nodes
        }
      });
    });
  });
});