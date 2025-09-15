import { Program, AwaitExpression, Identifier } from '../src/walkCallbacks/generic';
import * as acorn from 'acorn';

describe('Generic WalkCallbacks', () => {
  describe('Program', () => {
    it('should transform Program to BlockStatement', () => {
      const mockStep = {
        node: { type: 'Program' },
        _node: { body: [] },
        ancestor: false,
      };
      const mockState = {
        exports: [],
      };

      Program(mockStep as any, mockState);

      expect(mockStep.node.type).toBe('BlockStatement');
    });

    it('should not transform when ancestor is present', () => {
      const mockStep = {
        node: { type: 'Program' },
        _node: { body: [] },
        ancestor: true,
      };
      const mockState = {
        exports: [],
      };

      Program(mockStep as any, mockState);

      expect(mockStep.node.type).toBe('Program'); // Should remain unchanged
    });

    it('should add return statement with exports', () => {
      const mockStep = {
        node: { type: 'Program' },
        _node: { body: [] },
        ancestor: false,
      };
      const mockState = {
        exports: [
          {
            declaration: { type: 'Identifier', name: 'x' },
            exported: { type: 'Identifier', name: 'x' },
            spread: false,
          },
        ],
      };

      Program(mockStep as any, mockState);

      expect(mockStep._node.body).toHaveLength(1);
      expect(mockStep._node.body[0].type).toBe('ReturnStatement');
      expect(mockStep._node.body[0].argument.type).toBe('ObjectExpression');
      expect(mockStep._node.body[0].argument.properties).toHaveLength(1);
    });

    it('should handle spread exports', () => {
      const mockStep = {
        node: { type: 'Program' },
        _node: { body: [] },
        ancestor: false,
      };
      const mockState = {
        exports: [
          {
            declaration: { type: 'Identifier', name: 'obj' },
            spread: true,
          },
        ],
      };

      Program(mockStep as any, mockState);

      const property = mockStep._node.body[0].argument.properties[0];
      expect(property.type).toBe('SpreadElement');
      expect(property.argument).toBe(mockState.exports[0].declaration);
    });

    it('should handle regular exports', () => {
      const mockStep = {
        node: { type: 'Program' },
        _node: { body: [] },
        ancestor: false,
      };
      const mockState = {
        exports: [
          {
            declaration: { type: 'Literal', value: 42 },
            exported: { type: 'Identifier', name: 'answer' },
            spread: false,
          },
        ],
      };

      Program(mockStep as any, mockState);

      const property = mockStep._node.body[0].argument.properties[0];
      expect(property.type).toBe('Property');
      expect(property.key).toBe(mockState.exports[0].exported);
      expect(property.value).toBe(mockState.exports[0].declaration);
    });

    it('should handle shorthand properties', () => {
      const identifier = { type: 'Identifier', name: 'x' };
      const mockStep = {
        node: { type: 'Program' },
        _node: { body: [] },
        ancestor: false,
      };
      const mockState = {
        exports: [
          {
            declaration: identifier,
            exported: identifier,
            spread: false,
          },
        ],
      };

      Program(mockStep as any, mockState);

      const property = mockStep._node.body[0].argument.properties[0];
      expect(property.shorthand).toBe(true);
    });

    it('should handle non-shorthand properties', () => {
      const mockStep = {
        node: { type: 'Program' },
        _node: { body: [] },
        ancestor: false,
      };
      const mockState = {
        exports: [
          {
            declaration: { type: 'Literal', value: 42 },
            exported: { type: 'Identifier', name: 'different' },
            spread: false,
          },
        ],
      };

      Program(mockStep as any, mockState);

      const property = mockStep._node.body[0].argument.properties[0];
      expect(property.shorthand).toBe(false);
    });

    it('should handle mixed export types', () => {
      const identifier = { type: 'Identifier', name: 'x' };
      const mockStep = {
        node: { type: 'Program' },
        _node: { body: [] },
        ancestor: false,
      };
      const mockState = {
        exports: [
          {
            declaration: identifier,
            exported: identifier,
            spread: false,
          },
          {
            declaration: { type: 'Identifier', name: 'obj' },
            spread: true,
          },
          {
            declaration: { type: 'Literal', value: 'hello' },
            exported: { type: 'Identifier', name: 'greeting' },
            spread: false,
          },
        ],
      };

      Program(mockStep as any, mockState);

      const properties = mockStep._node.body[0].argument.properties;
      expect(properties).toHaveLength(3);
      expect(properties[0].type).toBe('Property');
      expect(properties[0].shorthand).toBe(true);
      expect(properties[1].type).toBe('SpreadElement');
      expect(properties[2].type).toBe('Property');
      expect(properties[2].shorthand).toBe(false);
    });

    it('should handle empty exports', () => {
      const mockStep = {
        node: { type: 'Program' },
        _node: { body: [] },
        ancestor: false,
      };
      const mockState = {
        exports: [],
      };

      Program(mockStep as any, mockState);

      expect(mockStep._node.body).toHaveLength(1);
      const properties = mockStep._node.body[0].argument.properties;
      expect(properties).toHaveLength(0);
    });

    it('should preserve existing body statements', () => {
      const existingStatement = { type: 'ExpressionStatement' };
      const mockStep = {
        node: { type: 'Program' },
        _node: { body: [existingStatement] },
        ancestor: false,
      };
      const mockState = {
        exports: [],
      };

      Program(mockStep as any, mockState);

      expect(mockStep._node.body).toHaveLength(2);
      expect(mockStep._node.body[0]).toBe(existingStatement);
      expect(mockStep._node.body[1].type).toBe('ReturnStatement');
    });
  });

  describe('AwaitExpression', () => {
    it('should set hasAwait to true', () => {
      const mockStep = {
        node: { type: 'AwaitExpression' },
        _node: {},
      };
      const mockState = {
        hasAwait: false,
      };

      AwaitExpression(mockStep as any, mockState);

      expect(mockState.hasAwait).toBe(true);
    });

    it('should work with already true hasAwait', () => {
      const mockStep = {
        node: { type: 'AwaitExpression' },
        _node: {},
      };
      const mockState = {
        hasAwait: true,
      };

      AwaitExpression(mockStep as any, mockState);

      expect(mockState.hasAwait).toBe(true);
    });

    it('should not modify other state properties', () => {
      const mockStep = {
        node: { type: 'AwaitExpression' },
        _node: {},
      };
      const mockState = {
        hasAwait: false,
        exports: ['existing'],
        identifiers: new Set(['existing']),
      };

      AwaitExpression(mockStep as any, mockState);

      expect(mockState.hasAwait).toBe(true);
      expect(mockState.exports).toEqual(['existing']);
      expect(mockState.identifiers.has('existing')).toBe(true);
    });
  });

  describe('Identifier', () => {
    it('should add identifier to identifiers set', () => {
      const mockStep = {
        node: { type: 'Identifier' },
        _node: { name: 'testVar' },
      };
      const mockState = {
        identifiers: new Set<string>(),
      };

      Identifier(mockStep as any, mockState);

      expect(mockState.identifiers.has('testVar')).toBe(true);
    });

    it('should handle multiple identifiers', () => {
      const mockState = {
        identifiers: new Set<string>(),
      };

      const identifiers = ['var1', 'var2', 'var3'];
      identifiers.forEach(name => {
        const mockStep = {
          node: { type: 'Identifier' },
          _node: { name },
        };
        Identifier(mockStep as any, mockState);
      });

      identifiers.forEach(name => {
        expect(mockState.identifiers.has(name)).toBe(true);
      });
      expect(mockState.identifiers.size).toBe(3);
    });

    it('should handle duplicate identifiers', () => {
      const mockState = {
        identifiers: new Set<string>(),
      };

      const mockStep = {
        node: { type: 'Identifier' },
        _node: { name: 'duplicate' },
      };

      Identifier(mockStep as any, mockState);
      Identifier(mockStep as any, mockState);

      expect(mockState.identifiers.has('duplicate')).toBe(true);
      expect(mockState.identifiers.size).toBe(1);
    });

    it('should handle empty string identifier', () => {
      const mockStep = {
        node: { type: 'Identifier' },
        _node: { name: '' },
      };
      const mockState = {
        identifiers: new Set<string>(),
      };

      Identifier(mockStep as any, mockState);

      expect(mockState.identifiers.has('')).toBe(true);
    });

    it('should handle special identifier names', () => {
      const specialNames = ['$', '_', '__proto__', 'constructor', 'prototype'];
      const mockState = {
        identifiers: new Set<string>(),
      };

      specialNames.forEach(name => {
        const mockStep = {
          node: { type: 'Identifier' },
          _node: { name },
        };
        Identifier(mockStep as any, mockState);
      });

      specialNames.forEach(name => {
        expect(mockState.identifiers.has(name)).toBe(true);
      });
    });

    it('should not modify other state properties', () => {
      const mockStep = {
        node: { type: 'Identifier' },
        _node: { name: 'test' },
      };
      const mockState = {
        identifiers: new Set<string>(),
        hasAwait: false,
        exports: ['existing'],
      };

      Identifier(mockStep as any, mockState);

      expect(mockState.identifiers.has('test')).toBe(true);
      expect(mockState.hasAwait).toBe(false);
      expect(mockState.exports).toEqual(['existing']);
    });
  });

  describe('Integration tests', () => {
    it('should work together in complex scenarios', () => {
      const mockState = {
        identifiers: new Set<string>(),
        hasAwait: false,
        exports: [
          {
            declaration: { type: 'Identifier', name: 'result' },
            exported: { type: 'Identifier', name: 'result' },
            spread: false,
          },
        ],
      };

      // Simulate identifier collection
      ['x', 'y', 'result'].forEach(name => {
        const mockStep = {
          node: { type: 'Identifier' },
          _node: { name },
        };
        Identifier(mockStep as any, mockState);
      });

      // Simulate await detection
      const awaitStep = {
        node: { type: 'AwaitExpression' },
        _node: {},
      };
      AwaitExpression(awaitStep as any, mockState);

      // Simulate program transformation
      const programStep = {
        node: { type: 'Program' },
        _node: { body: [] },
        ancestor: false,
      };
      Program(programStep as any, mockState);

      expect(mockState.identifiers.has('x')).toBe(true);
      expect(mockState.identifiers.has('y')).toBe(true);
      expect(mockState.identifiers.has('result')).toBe(true);
      expect(mockState.hasAwait).toBe(true);
      expect(programStep.node.type).toBe('BlockStatement');
      expect(programStep._node.body).toHaveLength(1);
    });

    it('should handle realistic AST transformation', () => {
      // Simulate a realistic scenario with actual AST-like structure
      const mockState = {
        identifiers: new Set<string>(),
        hasAwait: false,
        exports: [
          {
            declaration: { type: 'Identifier', name: 'asyncResult' },
            exported: { type: 'Identifier', name: 'asyncResult' },
            spread: false,
          },
        ],
      };

      // Collect identifiers from various parts of the code
      const identifierNames = ['fetch', 'url', 'response', 'data', 'asyncResult'];
      identifierNames.forEach(name => {
        const step = {
          node: { type: 'Identifier' },
          _node: { name },
        };
        Identifier(step as any, mockState);
      });

      // Mark as having await
      const awaitStep = {
        node: { type: 'AwaitExpression' },
        _node: {},
      };
      AwaitExpression(awaitStep as any, mockState);

      // Transform program
      const programStep = {
        node: { type: 'Program' },
        _node: { 
          body: [
            { type: 'VariableDeclaration' },
            { type: 'ExpressionStatement' },
          ]
        },
        ancestor: false,
      };
      Program(programStep as any, mockState);

      // Verify all transformations worked correctly
      expect(mockState.identifiers.size).toBe(5);
      expect(mockState.hasAwait).toBe(true);
      expect(programStep.node.type).toBe('BlockStatement');
      expect(programStep._node.body).toHaveLength(3); // 2 existing + 1 return
      expect(programStep._node.body[2].type).toBe('ReturnStatement');
    });
  });
});