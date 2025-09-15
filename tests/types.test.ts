import { RunOptions, CompiledCode, ExportedValue } from '../src/types';

describe('Types', () => {
  describe('RunOptions interface', () => {
    it('should have correct property types', () => {
      const options: RunOptions = {
        parseOptions: { ecmaVersion: 'latest' },
        codegenOptions: {},
        returns: 'exports',
        operatorOverloading: true,
        customVisitors: {},
        importFunction: (source: string) => ({}),
        isAsync: false,
      };

      expect(typeof options.parseOptions).toBe('object');
      expect(typeof options.codegenOptions).toBe('object');
      expect(typeof options.returns).toBe('string');
      expect(typeof options.operatorOverloading).toBe('boolean');
      expect(typeof options.customVisitors).toBe('object');
      expect(typeof options.importFunction).toBe('function');
      expect(typeof options.isAsync).toBe('boolean');
    });

    it('should allow partial options', () => {
      const partialOptions: RunOptions = {
        operatorOverloading: false,
      };

      expect(partialOptions.operatorOverloading).toBe(false);
      expect(partialOptions.returns).toBeUndefined();
      expect(partialOptions.isAsync).toBeUndefined();
    });

    it('should allow empty options object', () => {
      const emptyOptions: RunOptions = {};

      expect(Object.keys(emptyOptions)).toHaveLength(0);
    });

    it('should support exports return mode', () => {
      const options: RunOptions = {
        returns: 'exports',
      };

      expect(options.returns).toBe('exports');
    });

    it('should support return mode', () => {
      const options: RunOptions = {
        returns: 'return',
      };

      expect(options.returns).toBe('return');
    });

    it('should support sync import function', () => {
      const importFn = (source: string) => {
        return { default: 'mock' };
      };

      const options: RunOptions = {
        importFunction: importFn,
      };

      expect(options.importFunction).toBe(importFn);
      expect(options.importFunction?.('test')).toEqual({ default: 'mock' });
    });

    it('should support async import function', () => {
      const importFn = async (source: string) => {
        return Promise.resolve({ default: 'mock' });
      };

      const options: RunOptions = {
        importFunction: importFn,
      };

      expect(options.importFunction).toBe(importFn);
    });

    it('should support custom visitors', () => {
      const customVisitors = {
        Identifier: (node: any) => node,
        Literal: (node: any) => node,
      };

      const options: RunOptions = {
        customVisitors,
      };

      expect(options.customVisitors).toBe(customVisitors);
    });

    it('should support parse options', () => {
      const parseOptions = {
        ecmaVersion: 2020 as const,
        sourceType: 'module' as const,
        allowImportExportEverywhere: true,
      };

      const options: RunOptions = {
        parseOptions,
      };

      expect(options.parseOptions).toBe(parseOptions);
    });

    it('should support codegen options', () => {
      const codegenOptions = {
        format: {
          indent: {
            style: '  ',
          },
        },
      };

      const options: RunOptions = {
        codegenOptions,
      };

      expect(options.codegenOptions).toBe(codegenOptions);
    });

    it('should allow all boolean combinations', () => {
      const combinations = [
        { operatorOverloading: true, isAsync: true },
        { operatorOverloading: true, isAsync: false },
        { operatorOverloading: false, isAsync: true },
        { operatorOverloading: false, isAsync: false },
      ];

      combinations.forEach(combo => {
        const options: RunOptions = combo;
        expect(typeof options.operatorOverloading).toBe('boolean');
        expect(typeof options.isAsync).toBe('boolean');
      });
    });
  });

  describe('CompiledCode interface', () => {
    it('should have correct property types', () => {
      const mockFn = () => 42;
      const mockArgs = [1, 2, 3];
      const mockRun = () => (mockFn as any)(...mockArgs);

      const compiledCode: CompiledCode = {
        origCode: 'x + y',
        genCode: 'return x + y',
        fn: mockFn,
        args: mockArgs,
        run: mockRun,
      };

      expect(typeof compiledCode.origCode).toBe('string');
      expect(typeof compiledCode.genCode).toBe('string');
      expect(typeof compiledCode.fn).toBe('function');
      expect(Array.isArray(compiledCode.args)).toBe(true);
      expect(typeof compiledCode.run).toBe('function');
    });

    it('should execute run function correctly', () => {
      const mockFn = jest.fn(() => 'result');
      const mockArgs = ['arg1', 'arg2'];
      const mockRun = jest.fn(() => (mockFn as any)(...mockArgs));

      const compiledCode: CompiledCode = {
        origCode: 'test code',
        genCode: 'generated code',
        fn: mockFn,
        args: mockArgs,
        run: mockRun,
      };

      const result = compiledCode.run();
      
      expect(mockRun).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should handle empty args array', () => {
      const mockFn = () => 'no args';
      const compiledCode: CompiledCode = {
        origCode: '1 + 1',
        genCode: 'return 1 + 1',
        fn: mockFn,
        args: [],
        run: () => mockFn(),
      };

      expect(compiledCode.args).toEqual([]);
      expect(compiledCode.run()).toBe('no args');
    });

    it('should handle complex function types', () => {
      const asyncFn = async () => Promise.resolve(42);
      const compiledCode: CompiledCode = {
        origCode: 'await promise',
        genCode: 'return await promise',
        fn: asyncFn,
        args: [],
        run: () => asyncFn(),
      };

      expect(compiledCode.fn).toBe(asyncFn);
      expect(compiledCode.run()).toBeInstanceOf(Promise);
    });

    it('should support different argument types', () => {
      const fn = (num: number, str: string, bool: boolean, obj: object) => ({ num, str, bool, obj });
      const args = [42, 'hello', true, { key: 'value' }];
      
      const compiledCode: CompiledCode = {
        origCode: 'complex expression',
        genCode: 'generated complex expression',
        fn,
        args,
        run: () => (fn as any)(...args),
      };

      const result = compiledCode.run();
      expect(result).toEqual({
        num: 42,
        str: 'hello',
        bool: true,
        obj: { key: 'value' },
      });
    });

    it('should preserve original and generated code', () => {
      const original = 'const x = 1; export { x }';
      const generated = 'const x = 1; return { x }';
      
      const compiledCode: CompiledCode = {
        origCode: original,
        genCode: generated,
        fn: () => {},
        args: [],
        run: () => {},
      };

      expect(compiledCode.origCode).toBe(original);
      expect(compiledCode.genCode).toBe(generated);
    });
  });

  describe('ExportedValue interface', () => {
    it('should have correct property types', () => {
      const exportedValue: ExportedValue = {
        declaration: { type: 'Identifier', name: 'x' },
        exported: { type: 'Identifier', name: 'x' },
        spread: false,
      };

      expect(typeof exportedValue.declaration).toBe('object');
      expect(typeof exportedValue.exported).toBe('object');
      expect(typeof exportedValue.spread).toBe('boolean');
    });

    it('should allow optional properties', () => {
      const minimalExport: ExportedValue = {
        declaration: { type: 'Literal', value: 42 },
      };

      expect(minimalExport.declaration).toBeDefined();
      expect(minimalExport.exported).toBeUndefined();
      expect(minimalExport.spread).toBeUndefined();
    });

    it('should support spread exports', () => {
      const spreadExport: ExportedValue = {
        declaration: { type: 'Identifier', name: 'obj' },
        spread: true,
      };

      expect(spreadExport.spread).toBe(true);
      expect(spreadExport.exported).toBeUndefined();
    });

    it('should support named exports', () => {
      const namedExport: ExportedValue = {
        declaration: { type: 'Literal', value: 'value' },
        exported: { type: 'Identifier', name: 'myExport' },
        spread: false,
      };

      expect(namedExport.exported).toBeDefined();
      expect(namedExport.spread).toBe(false);
    });

    it('should handle complex declaration types', () => {
      const complexExport: ExportedValue = {
        declaration: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'func' },
          arguments: [{ type: 'Literal', value: 1 }],
        },
        exported: { type: 'Identifier', name: 'result' },
      };

      expect(complexExport.declaration.type).toBe('CallExpression');
      expect(complexExport.exported?.type).toBe('Identifier');
    });
  });

  describe('Type compatibility', () => {
    it('should allow RunOptions in function parameters', () => {
      const processOptions = (options: RunOptions): boolean => {
        return options.operatorOverloading !== false;
      };

      expect(processOptions({})).toBe(true);
      expect(processOptions({ operatorOverloading: false })).toBe(false);
      expect(processOptions({ operatorOverloading: true })).toBe(true);
    });

    it('should allow CompiledCode in function parameters', () => {
      const executeCode = (compiled: CompiledCode): any => {
        return compiled.run();
      };

      const mockCompiled: CompiledCode = {
        origCode: 'test',
        genCode: 'test',
        fn: () => 'result',
        args: [],
        run: () => 'result',
      };

      expect(executeCode(mockCompiled)).toBe('result');
    });

    it('should allow array of ExportedValue', () => {
      const exports: ExportedValue[] = [
        { declaration: { type: 'Identifier', name: 'a' } },
        { declaration: { type: 'Literal', value: 42 }, exported: { type: 'Identifier', name: 'b' } },
        { declaration: { type: 'Identifier', name: 'obj' }, spread: true },
      ];

      expect(exports).toHaveLength(3);
      expect(exports[0].declaration.type).toBe('Identifier');
      expect(exports[1].exported?.type).toBe('Identifier');
      expect(exports[2].spread).toBe(true);
    });

    it('should support function overloads with different RunOptions', () => {
      function compile(code: string): CompiledCode;
      function compile(code: string, options: RunOptions): CompiledCode;
      function compile(code: string, options?: RunOptions): CompiledCode {
        return {
          origCode: code,
          genCode: code,
          fn: () => {},
          args: [],
          run: () => {},
        };
      }

      const result1 = compile('test');
      const result2 = compile('test', { operatorOverloading: false });

      expect(result1.origCode).toBe('test');
      expect(result2.origCode).toBe('test');
    });

    it('should handle generic constraints with types', () => {
      interface CustomOptions extends RunOptions {
        customFlag?: boolean;
      }

      const customOptions: CustomOptions = {
        operatorOverloading: true,
        customFlag: true,
      };

      expect(customOptions.operatorOverloading).toBe(true);
      expect(customOptions.customFlag).toBe(true);
    });

    it('should support union types with RunOptions', () => {
      type ConfigOptions = RunOptions | { legacy: boolean };

      const modernConfig: ConfigOptions = {
        operatorOverloading: true,
        returns: 'exports',
      };

      const legacyConfig: ConfigOptions = {
        legacy: true,
      };

      expect('operatorOverloading' in modernConfig).toBe(true);
      expect('legacy' in legacyConfig).toBe(true);
    });
  });
});