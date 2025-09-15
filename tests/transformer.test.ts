import { Transformer } from '../src/transformer';
import { RunOptions } from '../src/types';
import * as acorn from 'acorn';

describe('Transformer', () => {
  let transformer: Transformer;
  let defaultOptions: RunOptions;

  beforeEach(() => {
    defaultOptions = {
      parseOptions: { ecmaVersion: 'latest' },
      codegenOptions: {},
      returns: 'exports',
      operatorOverloading: true,
      customVisitors: {},
      isAsync: false,
    };
    transformer = new Transformer(defaultOptions);
  });

  describe('constructor', () => {
    it('should create transformer with options', () => {
      const options: RunOptions = {
        operatorOverloading: false,
        returns: 'return',
      };
      const t = new Transformer(options);
      expect(t.options).toBe(options);
    });

    it('should store readonly options', () => {
      expect(transformer.options).toBe(defaultOptions);
      // Verify readonly nature - this should cause TypeScript error if uncommented
      // transformer.options = {};
    });
  });

  describe('transform', () => {
    it('should transform simple expression', () => {
      const code = 'export const x = 1';
      const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
      
      const state: any = transformer.transform(ast);
      
      expect(state).toHaveProperty('options');
      expect(state).toHaveProperty('exports');
      expect(state).toHaveProperty('identifiers');
      expect(state).toHaveProperty('importFnName');
      expect(state).toHaveProperty('unaryFnName');
      expect(state).toHaveProperty('binaryFnName');
      expect(state).toHaveProperty('importFnUsed');
      expect(state).toHaveProperty('unaryFnUsed');
      expect(state).toHaveProperty('binaryFnUsed');
      expect(state).toHaveProperty('hasAwait');
    });

    it('should initialize state with correct default values', () => {
      const code = 'const x = 1';
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).options).toBe(defaultOptions);
      expect(Array.isArray(state.exports)).toBe(true);
      expect((state as any).identifiers instanceof Set).toBe(true);
      expect(typeof state.importFnName).toBe('string');
      expect(typeof state.unaryFnName).toBe('string');
      expect(typeof state.binaryFnName).toBe('string');
      expect((state as any).importFnUsed).toBe(false);
      expect((state as any).unaryFnUsed).toBe(false);
      expect((state as any).binaryFnUsed).toBe(false);
      expect((state as any).hasAwait).toBe(false);
    });

    it('should track identifiers used in code', () => {
      const code = 'const x = y + z';
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).identifiers.has('x')).toBe(true);
      expect((state as any).identifiers.has('y')).toBe(true);
      expect((state as any).identifiers.has('z')).toBe(true);
    });

    it('should handle operator overloading transformation', () => {
      const code = 'const result = x + y';
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).binaryFnUsed).toBe(true);
      expect((state as any).identifiers.has('x')).toBe(true);
      expect((state as any).identifiers.has('y')).toBe(true);
      expect((state as any).identifiers.has('result')).toBe(true);
    });

    it('should not use operator overloading when disabled', () => {
      const options: RunOptions = {
        ...defaultOptions,
        operatorOverloading: false,
      };
      const t = new Transformer(options);
      const code = 'const result = x + y';
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state = t.transform(ast);
      
      expect((state as any).binaryFnUsed).toBe(false);
    });

    it('should handle unary operators', () => {
      const code = 'const result = -x';
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).unaryFnUsed).toBe(true);
      expect((state as any).identifiers.has('x')).toBe(true);
      expect((state as any).identifiers.has('result')).toBe(true);
    });

    it('should handle export statements', () => {
      const code = 'export const x = 1';
      const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).exports.length).toBe(1);
      expect((state as any).identifiers.has('x')).toBe(true);
    });

    it('should handle import statements', () => {
      const code = 'import { func } from "module"';
      const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).importFnUsed).toBe(true);
      expect((state as any).identifiers.has('func')).toBe(true);
    });

    it('should detect await expressions', () => {
      const code = 'const result = await promise';
      const ast = acorn.parse(code, { ecmaVersion: 'latest', allowAwaitOutsideFunction: true });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).hasAwait).toBe(true);
      expect((state as any).identifiers.has('result')).toBe(true);
      expect((state as any).identifiers.has('promise')).toBe(true);
    });

    it('should generate unique function names', () => {
      const code = 'const x = 1';
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).importFnName).toMatch(/^id_[a-z0-9]+$/);
      expect((state as any).unaryFnName).toMatch(/^id_[a-z0-9]+$/);
      expect((state as any).binaryFnName).toMatch(/^id_[a-z0-9]+$/);
      expect((state as any).importFnName).not.toBe(state.unaryFnName);
      expect((state as any).unaryFnName).not.toBe(state.binaryFnName);
      expect((state as any).importFnName).not.toBe(state.binaryFnName);
    });

    it('should handle complex expressions with multiple operators', () => {
      const code = 'const result = -x + y * z';
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).unaryFnUsed).toBe(true);
      expect((state as any).binaryFnUsed).toBe(true);
      expect((state as any).identifiers.has('x')).toBe(true);
      expect((state as any).identifiers.has('y')).toBe(true);
      expect((state as any).identifiers.has('z')).toBe(true);
      expect((state as any).identifiers.has('result')).toBe(true);
    });

    it('should handle update expressions (++, --)', () => {
      const code = 'x++; --y';
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).binaryFnUsed).toBe(true); // Update expressions use binary operations
      expect((state as any).identifiers.has('x')).toBe(true);
      expect((state as any).identifiers.has('y')).toBe(true);
    });

    it('should handle assignment operators (+=, -=, etc.)', () => {
      const code = 'x += 5; y *= 2';
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).binaryFnUsed).toBe(true);
      expect((state as any).identifiers.has('x')).toBe(true);
      expect((state as any).identifiers.has('y')).toBe(true);
    });

    it('should handle logical operators', () => {
      const code = 'const result = x && y || z';
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).binaryFnUsed).toBe(true);
      expect((state as any).identifiers.has('x')).toBe(true);
      expect((state as any).identifiers.has('y')).toBe(true);
      expect((state as any).identifiers.has('z')).toBe(true);
      expect((state as any).identifiers.has('result')).toBe(true);
    });

    it('should handle function declarations', () => {
      const code = 'function myFunc(param) { return param + 1; }';
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).identifiers.has('myFunc')).toBe(true);
      expect((state as any).identifiers.has('param')).toBe(true);
      expect((state as any).binaryFnUsed).toBe(true); // for the + operator
    });

    it('should handle variable declarations', () => {
      const code = 'let a; const b = 1; var c = a + b';
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).identifiers.has('a')).toBe(true);
      expect((state as any).identifiers.has('b')).toBe(true);
      expect((state as any).identifiers.has('c')).toBe(true);
      expect((state as any).binaryFnUsed).toBe(true);
    });

    it('should handle nested object access', () => {
      const code = 'const result = obj.prop.nested';
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).identifiers.has('obj')).toBe(true);
      expect((state as any).identifiers.has('result')).toBe(true);
      expect((state as any).identifiers.has('prop')).toBe(true);
      expect((state as any).identifiers.has('nested')).toBe(true);
    });

    it('should handle array access', () => {
      const code = 'const result = arr[index]';
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).identifiers.has('arr')).toBe(true);
      expect((state as any).identifiers.has('index')).toBe(true);
      expect((state as any).identifiers.has('result')).toBe(true);
    });

    it('should transform AST nodes correctly', () => {
      const code = 'export const x = 1';
      const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
      const originalType = ast.type;
      
      const state: any = transformer.transform(ast);
      
      // The Program node should be transformed to BlockStatement
      expect(ast.type).toBe('BlockStatement');
      expect(originalType).toBe('Program');
    });
  });

  describe('state isolation', () => {
    it('should maintain separate state for different transformations', () => {
      const code1 = 'const x = 1';
      const code2 = 'const y = await promise';
      
      const ast1 = acorn.parse(code1, { ecmaVersion: 'latest' });
      const ast2 = acorn.parse(code2, { ecmaVersion: 'latest', allowAwaitOutsideFunction: true });
      
      const state1 = transformer.transform(ast1);
      const state2 = transformer.transform(ast2);
      
      expect((state1 as any).hasAwait).toBe(false);
      expect((state2 as any).hasAwait).toBe(true);
      expect((state1 as any).identifiers.has('x')).toBe(true);
      expect((state1 as any).identifiers.has('y')).toBe(false);
      expect((state2 as any).identifiers.has('y')).toBe(true);
      expect((state2 as any).identifiers.has('promise')).toBe(true);
    });

    it('should reset state for each transformation', () => {
      const code1 = 'const result = x + y';
      const code2 = 'const value = 42';
      
      const ast1 = acorn.parse(code1, { ecmaVersion: 'latest' });
      const ast2 = acorn.parse(code2, { ecmaVersion: 'latest' });
      
      const state1 = transformer.transform(ast1);
      const state2 = transformer.transform(ast2);
      
      expect((state1 as any).binaryFnUsed).toBe(true);
      expect((state2 as any).binaryFnUsed).toBe(false);
      expect((state1 as any).identifiers.has('x')).toBe(true);
      expect((state2 as any).identifiers.has('x')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty code', () => {
      const code = '';
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).identifiers.size).toBe(0);
      expect((state as any).exports.length).toBe(0);
      expect((state as any).unaryFnUsed).toBe(false);
      expect((state as any).binaryFnUsed).toBe(false);
      expect((state as any).importFnUsed).toBe(false);
      expect((state as any).hasAwait).toBe(false);
    });

    it('should handle comments in code', () => {
      const code = `
        // This is a comment
        const x = 1; /* another comment */
        /* 
         * Multi-line comment
         */
      `;
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).identifiers.has('x')).toBe(true);
    });

    it('should handle string literals', () => {
      const code = 'const str = "hello world"';
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).identifiers.has('str')).toBe(true);
    });

    it('should handle numeric literals', () => {
      const code = 'const num = 42.5';
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).identifiers.has('num')).toBe(true);
    });

    it('should handle boolean literals', () => {
      const code = 'const bool = true';
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).identifiers.has('bool')).toBe(true);
    });

    it('should handle null and undefined', () => {
      const code = 'const a = null; const b = undefined';
      const ast = acorn.parse(code, { ecmaVersion: 'latest' });
      
      const state: any = transformer.transform(ast);
      
      expect((state as any).identifiers.has('a')).toBe(true);
      expect((state as any).identifiers.has('b')).toBe(true);
      expect((state as any).identifiers.has('undefined')).toBe(true);
    });
  });
});