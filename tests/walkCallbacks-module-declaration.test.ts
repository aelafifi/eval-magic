import {
  ImportDeclaration,
  ExportNamedDeclaration,
  ExportDefaultDeclaration,
  ExportAllDeclaration,
} from '../src/walkCallbacks/module-declaration';
import { AsyncFunction } from '../src/utils';

describe('Module Declaration WalkCallbacks', () => {
  let mockState: any;

  beforeEach(() => {
    mockState = {
      options: {
        importFunction: () => ({}),
        returns: 'exports',
      },
      exports: [],
      importFnName: 'importFn',
      importFnUsed: false,
    };
  });

  describe('ImportDeclaration', () => {
    it('should handle namespace import', () => {
      const mockStep = {
        _node: {
          source: { type: 'Literal', value: 'module' },
          specifiers: [
            {
              type: 'ImportNamespaceSpecifier',
              local: { name: 'ns' },
            },
          ],
        },
        replaceWith: jest.fn(),
      };

      ImportDeclaration(mockStep as any, mockState);

      expect(mockStep.replaceWith).toHaveBeenCalledWith({
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'ns' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'importFn' },
              arguments: [{ type: 'Literal', value: 'module' }],
            },
          },
        ],
      });
    });

    it('should handle default import', () => {
      const mockStep = {
        _node: {
          source: { type: 'Literal', value: 'module' },
          specifiers: [
            {
              type: 'ImportDefaultSpecifier',
              local: { name: 'defaultExport' },
            },
          ],
        },
        replaceWith: jest.fn(),
      };

      ImportDeclaration(mockStep as any, mockState);

      expect(mockStep.replaceWith).toHaveBeenCalledWith({
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'ObjectPattern',
              properties: [
                {
                  type: 'Property',
                  key: { type: 'Literal', value: 'default' },
                  value: { name: 'defaultExport' },
                },
              ],
            },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'importFn' },
              arguments: [{ type: 'Literal', value: 'module' }],
            },
          },
        ],
      });
    });

    it('should handle named imports', () => {
      const mockStep = {
        _node: {
          source: { type: 'Literal', value: 'module' },
          specifiers: [
            {
              type: 'ImportSpecifier',
              imported: { name: 'func' },
              local: { name: 'func' },
            },
            {
              type: 'ImportSpecifier',
              imported: { name: 'other' },
              local: { name: 'renamed' },
            },
          ],
        },
        replaceWith: jest.fn(),
      };

      ImportDeclaration(mockStep as any, mockState);

      const expectedCall = mockStep.replaceWith.mock.calls[0][0];
      expect(expectedCall.type).toBe('VariableDeclaration');
      expect(expectedCall.declarations[0].id.type).toBe('ObjectPattern');
      expect(expectedCall.declarations[0].id.properties).toHaveLength(2);
    });

    it('should handle async import function', () => {
      mockState.options.importFunction = new AsyncFunction('return {}');

      const mockStep = {
        _node: {
          source: { type: 'Literal', value: 'module' },
          specifiers: [
            {
              type: 'ImportNamespaceSpecifier',
              local: { name: 'ns' },
            },
          ],
        },
        replaceWith: jest.fn(),
      };

      ImportDeclaration(mockStep as any, mockState);

      const expectedCall = mockStep.replaceWith.mock.calls[0][0];
      expect(expectedCall.declarations[0].init.type).toBe('AwaitExpression');
    });

    it('should throw error for empty import', () => {
      const mockStep = {
        _node: {
          source: { type: 'Literal', value: 'module' },
          specifiers: [],
        },
        replaceWith: jest.fn(),
      };

      expect(() => {
        ImportDeclaration(mockStep as any, mockState);
      }).toThrow('Empty import statement is not allowed');
    });

    it('should throw error without import function', () => {
      mockState.options.importFunction = 'not a function';

      const mockStep = {
        _node: {
          source: { type: 'Literal', value: 'module' },
          specifiers: [{ type: 'ImportNamespaceSpecifier', local: { name: 'ns' } }],
        },
        replaceWith: jest.fn(),
      };

      expect(() => {
        ImportDeclaration(mockStep as any, mockState);
      }).toThrow('import statement is not allowed without an importFunction');
    });

    it('should throw error for unknown specifier type', () => {
      const mockStep = {
        _node: {
          source: { type: 'Literal', value: 'module' },
          specifiers: [
            {
              type: 'UnknownSpecifier',
              local: { name: 'test' },
            },
          ],
        },
        replaceWith: jest.fn(),
      };

      expect(() => {
        ImportDeclaration(mockStep as any, mockState);
      }).toThrow('Unknown import specifier type: UnknownSpecifier');
    });
  });

  describe('ExportNamedDeclaration', () => {
    it('should throw error when returns is not exports', () => {
      mockState.options.returns = 'return';

      const mockStep = {
        _node: { declaration: null, source: null, specifiers: [] },
      };

      expect(() => {
        ExportNamedDeclaration(mockStep as any, mockState);
      }).toThrow("export statement is not allowed when returns is not 'exports'");
    });

    it('should handle export with source', () => {
      const mockStep = {
        _node: {
          source: { type: 'Literal', value: 'module' },
          specifiers: [
            {
              local: { name: 'func' },
              exported: { name: 'func' },
            },
          ],
          declaration: null,
        },
        replaceWith: jest.fn(),
      };

      ExportNamedDeclaration(mockStep as any, mockState);

      expect(mockState.exports).toHaveLength(1);
      expect(mockState.exports[0].exported).toEqual({ name: 'func' });
      expect(mockStep.replaceWith).toHaveBeenCalled();
    });

    it('should handle variable declaration export', () => {
      const mockStep = {
        _node: {
          declaration: {
            type: 'VariableDeclaration',
            declarations: [
              {
                id: { type: 'Identifier', name: 'x' },
              },
            ],
          },
          source: null,
          specifiers: null,
        },
        replaceWith: jest.fn(),
      };

      ExportNamedDeclaration(mockStep as any, mockState);

      expect(mockState.exports).toHaveLength(1);
      expect(mockState.exports[0].declaration).toEqual({ type: 'Identifier', name: 'x' });
      expect(mockState.exports[0].exported).toEqual({ type: 'Identifier', name: 'x' });
    });

    it('should handle function declaration export', () => {
      const mockStep = {
        _node: {
          declaration: {
            type: 'FunctionDeclaration',
            id: { name: 'myFunc' },
          },
          source: null,
          specifiers: null,
        },
        replaceWith: jest.fn(),
      };

      ExportNamedDeclaration(mockStep as any, mockState);

      expect(mockState.exports).toHaveLength(1);
      expect(mockState.exports[0].declaration).toEqual({ name: 'myFunc' });
      expect(mockState.exports[0].exported).toEqual({ name: 'myFunc' });
    });

    it('should handle class declaration export', () => {
      const mockStep = {
        _node: {
          declaration: {
            type: 'ClassDeclaration',
            id: { name: 'MyClass' },
          },
          source: null,
          specifiers: null,
        },
        replaceWith: jest.fn(),
      };

      ExportNamedDeclaration(mockStep as any, mockState);

      expect(mockState.exports).toHaveLength(1);
      expect(mockState.exports[0].declaration).toEqual({ name: 'MyClass' });
    });

    it('should handle object pattern in variable declaration', () => {
      const mockStep = {
        _node: {
          declaration: {
            type: 'VariableDeclaration',
            declarations: [
              {
                id: {
                  type: 'ObjectPattern',
                  properties: [
                    {
                      type: 'Property',
                      key: { name: 'a' },
                    },
                    {
                      type: 'RestElement',
                      argument: { name: 'rest' },
                    },
                  ],
                },
              },
            ],
          },
          source: null,
          specifiers: null,
        },
        replaceWith: jest.fn(),
      };

      ExportNamedDeclaration(mockStep as any, mockState);

      expect(mockState.exports).toHaveLength(2);
    });

    it('should handle array pattern in variable declaration', () => {
      const mockStep = {
        _node: {
          declaration: {
            type: 'VariableDeclaration',
            declarations: [
              {
                id: {
                  type: 'ArrayPattern',
                  elements: [
                    { type: 'Identifier', name: 'first' },
                    { type: 'AssignmentPattern', left: { name: 'second' } },
                    { type: 'RestElement', argument: { name: 'rest' } },
                  ],
                },
              },
            ],
          },
          source: null,
          specifiers: null,
        },
        replaceWith: jest.fn(),
      };

      ExportNamedDeclaration(mockStep as any, mockState);

      expect(mockState.exports).toHaveLength(3);
    });

    it('should handle specifiers without declaration or source', () => {
      const mockStep = {
        _node: {
          declaration: null,
          source: null,
          specifiers: [
            {
              local: { name: 'localVar' },
              exported: { name: 'exportedVar' },
            },
          ],
        },
        replaceWith: jest.fn(),
      };

      ExportNamedDeclaration(mockStep as any, mockState);

      expect(mockState.exports).toHaveLength(1);
      expect(mockState.exports[0].declaration).toEqual({ name: 'localVar' });
      expect(mockState.exports[0].exported).toEqual({ name: 'exportedVar' });
      expect(mockStep.replaceWith).toHaveBeenCalledWith({ type: 'EmptyStatement' });
    });

    it('should throw error for unknown declaration type', () => {
      const mockStep = {
        _node: {
          declaration: {
            type: 'VariableDeclaration',
            declarations: [
              {
                id: {
                  type: 'UnknownPattern',
                },
              },
            ],
          },
          source: null,
          specifiers: null,
        },
        replaceWith: jest.fn(),
      };

      expect(() => {
        ExportNamedDeclaration(mockStep as any, mockState);
      }).toThrow('Unknown declaration: "UnknownPattern"');
    });

    it('should throw error for unknown array pattern element', () => {
      const mockStep = {
        _node: {
          declaration: {
            type: 'VariableDeclaration',
            declarations: [
              {
                id: {
                  type: 'ArrayPattern',
                  elements: [
                    { type: 'UnknownElement', name: 'unknown' },
                  ],
                },
              },
            ],
          },
          source: null,
          specifiers: null,
        },
        replaceWith: jest.fn(),
      };

      expect(() => {
        ExportNamedDeclaration(mockStep as any, mockState);
      }).toThrow('Unknown ArrayPattern element type: "UnknownElement"');
    });
  });

  describe('ExportDefaultDeclaration', () => {
    it('should add default export', () => {
      const mockStep = {
        _node: {
          declaration: { type: 'Identifier', name: 'defaultValue' },
        },
        replaceWith: jest.fn(),
      };

      ExportDefaultDeclaration(mockStep as any, mockState);

      expect(mockState.exports).toHaveLength(1);
      expect(mockState.exports[0].declaration).toEqual({ type: 'Identifier', name: 'defaultValue' });
      expect(mockState.exports[0].exported).toEqual({ type: 'Identifier', name: 'default' });
      expect(mockStep.replaceWith).toHaveBeenCalledWith({ type: 'EmptyStatement' });
    });

    it('should throw error when returns is not exports', () => {
      mockState.options.returns = 'return';

      const mockStep = {
        _node: {
          declaration: { type: 'Identifier', name: 'defaultValue' },
        },
        replaceWith: jest.fn(),
      };

      expect(() => {
        ExportDefaultDeclaration(mockStep as any, mockState);
      }).toThrow("export statement is not allowed when returns is not 'exports'");
    });
  });

  describe('ExportAllDeclaration', () => {
    it('should handle export all without exported name', () => {
      const mockStep = {
        _node: {
          source: { type: 'Literal', value: 'module' },
          exported: null,
        },
        replaceWith: jest.fn(),
      };

      ExportAllDeclaration(mockStep as any, mockState);

      expect(mockState.exports).toHaveLength(1);
      expect(mockState.exports[0].spread).toBe(true);
      expect(mockStep.replaceWith).toHaveBeenCalledWith({ type: 'EmptyStatement' });
    });

    it('should handle export all with exported name', () => {
      const mockStep = {
        _node: {
          source: { type: 'Literal', value: 'module' },
          exported: { name: 'allExports' },
        },
        replaceWith: jest.fn(),
      };

      ExportAllDeclaration(mockStep as any, mockState);

      expect(mockState.exports).toHaveLength(1);
      expect(mockState.exports[0].exported).toEqual({ name: 'allExports' });
      expect(mockState.exports[0].spread).toBeUndefined();
    });

    it('should throw error when returns is not exports', () => {
      mockState.options.returns = 'return';

      const mockStep = {
        _node: {
          source: { type: 'Literal', value: 'module' },
          exported: null,
        },
        replaceWith: jest.fn(),
      };

      expect(() => {
        ExportAllDeclaration(mockStep as any, mockState);
      }).toThrow("export statement is not allowed when returns is not 'exports'");
    });

    it('should handle async import function in export all', () => {
      mockState.options.importFunction = new AsyncFunction('return {}');

      const mockStep = {
        _node: {
          source: { type: 'Literal', value: 'module' },
          exported: null,
        },
        replaceWith: jest.fn(),
      };

      ExportAllDeclaration(mockStep as any, mockState);

      expect(mockState.exports).toHaveLength(1);
      expect(mockState.exports[0].declaration.type).toBe('AwaitExpression');
    });
  });

  describe('Integration tests', () => {
    it('should handle complex import/export scenario', () => {
      // Import with multiple specifiers
      const importStep = {
        _node: {
          source: { type: 'Literal', value: 'utils' },
          specifiers: [
            {
              type: 'ImportSpecifier',
              imported: { name: 'helper' },
              local: { name: 'helper' },
            },
            {
              type: 'ImportDefaultSpecifier',
              local: { name: 'main' },
            },
          ],
        },
        replaceWith: jest.fn(),
      };

      ImportDeclaration(importStep as any, mockState);

      // Export named declaration
      const exportStep = {
        _node: {
          declaration: {
            type: 'VariableDeclaration',
            declarations: [
              {
                id: { type: 'Identifier', name: 'result' },
              },
            ],
          },
          source: null,
          specifiers: null,
        },
        replaceWith: jest.fn(),
      };

      ExportNamedDeclaration(exportStep as any, mockState);

      // Export default
      const defaultStep = {
        _node: {
          declaration: { type: 'Identifier', name: 'mainExport' },
        },
        replaceWith: jest.fn(),
      };

      ExportDefaultDeclaration(defaultStep as any, mockState);

      expect(mockState.exports).toHaveLength(2);
      expect(importStep.replaceWith).toHaveBeenCalled();
      expect(exportStep.replaceWith).toHaveBeenCalled();
      expect(defaultStep.replaceWith).toHaveBeenCalled();
    });

    it('should maintain state consistency across multiple operations', () => {
      const initialExportsLength = mockState.exports.length;

      // Multiple export operations
      const operations = [
        () => {
          const step = {
            _node: { declaration: { type: 'Identifier', name: 'var1' } },
            replaceWith: jest.fn(),
          };
          ExportDefaultDeclaration(step as any, mockState);
        },
        () => {
          const step = {
            _node: {
              declaration: {
                type: 'VariableDeclaration',
                declarations: [{ id: { type: 'Identifier', name: 'var2' } }],
              },
              source: null,
              specifiers: null,
            },
            replaceWith: jest.fn(),
          };
          ExportNamedDeclaration(step as any, mockState);
        },
      ];

      operations.forEach(op => op());

      expect(mockState.exports).toHaveLength(initialExportsLength + 2);
      expect(mockState.exports.map((e: any) => e.exported?.name || 'spread')).toContain('default');
    });
  });
});