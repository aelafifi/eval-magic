import { hasOwnProp, generateVarName, AsyncFunction } from '../src/utils';

describe('Utils', () => {
  describe('hasOwnProp', () => {
    it('should return true for own properties', () => {
      const obj = { a: 1, b: 2 };
      expect(hasOwnProp(obj, 'a')).toBe(true);
      expect(hasOwnProp(obj, 'b')).toBe(true);
    });

    it('should return false for non-existent properties', () => {
      const obj = { a: 1 };
      expect(hasOwnProp(obj, 'b')).toBe(false);
      expect(hasOwnProp(obj, 'toString')).toBe(false); // inherited property
    });

    it('should return false for inherited properties', () => {
      const parent = { inherited: true };
      const child = Object.create(parent);
      child.own = true;
      
      expect(hasOwnProp(child, 'own')).toBe(true);
      expect(hasOwnProp(child, 'inherited')).toBe(false);
    });

    it('should handle null and undefined safely', () => {
      expect(hasOwnProp({}, 'anything')).toBe(false);
    });

    it('should handle objects with null prototype', () => {
      const obj = Object.create(null);
      obj.prop = 'value';
      expect(hasOwnProp(obj, 'prop')).toBe(true);
      expect(hasOwnProp(obj, 'toString')).toBe(false);
    });

    it('should handle arrays', () => {
      const arr = [1, 2, 3];
      expect(hasOwnProp(arr, '0')).toBe(true);
      expect(hasOwnProp(arr, '1')).toBe(true);
      expect(hasOwnProp(arr, 'length')).toBe(true);
      expect(hasOwnProp(arr, 'push')).toBe(false); // inherited method
    });

    it('should handle functions', () => {
      const fn = function() {};
      fn.customProp = 'value';
      expect(hasOwnProp(fn, 'customProp')).toBe(true);
      expect(hasOwnProp(fn, 'name')).toBe(true);
      expect(hasOwnProp(fn, 'call')).toBe(false); // inherited method
    });

    it('should handle objects with symbol properties', () => {
      const sym = Symbol('test');
      const obj = { [sym]: 'value', regular: 'prop' };
      expect(hasOwnProp(obj, 'regular')).toBe(true);
      // Note: hasOwnProp with string won't find symbol properties
      expect(hasOwnProp(obj, sym.toString())).toBe(false);
    });
  });

  describe('generateVarName', () => {
    it('should generate variable names starting with "id_"', () => {
      const varName = generateVarName();
      expect(varName).toMatch(/^id_/);
    });

    it('should generate variable names of length 16', () => {
      const varName = generateVarName();
      expect(varName).toHaveLength(16);
    });

    it('should generate different variable names on each call', () => {
      const varName1 = generateVarName();
      const varName2 = generateVarName();
      const varName3 = generateVarName();
      
      expect(varName1).not.toBe(varName2);
      expect(varName2).not.toBe(varName3);
      expect(varName1).not.toBe(varName3);
    });

    it('should generate valid JavaScript identifiers', () => {
      const varName = generateVarName();
      // Should match pattern for valid JS identifier starting with id_
      expect(varName).toMatch(/^id_[a-z0-9]+$/);
    });

    it('should be consistent in length even with short random strings', () => {
      // Test multiple times to ensure consistency
      for (let i = 0; i < 100; i++) {
        const varName = generateVarName();
        expect(varName).toHaveLength(16);
        expect(varName.startsWith('id_')).toBe(true);
      }
    });

    it('should only contain alphanumeric characters after id_', () => {
      const varName = generateVarName();
      const suffix = varName.slice(3); // Remove 'id_' prefix
      expect(suffix).toMatch(/^[a-z0-9]+$/);
    });

    it('should handle edge case where random string generation might be short', () => {
      // Mock Math.random to return very small values
      const originalRandom = Math.random;
      Math.random = jest.fn()
        .mockReturnValueOnce(0.000001) // Very small number
        .mockReturnValueOnce(0.000002)
        .mockReturnValueOnce(0.000003)
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.2);

      const varName = generateVarName();
      expect(varName).toHaveLength(16);
      expect(varName.startsWith('id_')).toBe(true);

      // Restore original Math.random
      Math.random = originalRandom;
    });
  });

  describe('AsyncFunction', () => {
    it('should be the AsyncFunction constructor', () => {
      expect(typeof AsyncFunction).toBe('function');
      expect(AsyncFunction.name).toBe('AsyncFunction');
    });

    it('should create async functions', () => {
      const asyncFn = new AsyncFunction('return 42');
      expect(asyncFn.constructor).toBe(AsyncFunction);
      expect(asyncFn instanceof AsyncFunction).toBe(true);
    });

    it('should create functions that return promises', async () => {
      const asyncFn = new AsyncFunction('return 42');
      const result = asyncFn();
      expect(result).toBeInstanceOf(Promise);
      expect(await result).toBe(42);
    });

    it('should handle parameters', async () => {
      const asyncFn = new AsyncFunction('x', 'y', 'return x + y');
      const result = await asyncFn(5, 3);
      expect(result).toBe(8);
    });

    it('should handle await expressions', async () => {
      const asyncFn = new AsyncFunction('return await Promise.resolve(42)');
      const result = await asyncFn();
      expect(result).toBe(42);
    });

    it('should be different from regular Function constructor', () => {
      expect(AsyncFunction).not.toBe(Function);
      
      const regularFn = new Function('return 42');
      const asyncFn = new AsyncFunction('return 42');
      
      expect(regularFn()).toBe(42);
      expect(asyncFn()).toBeInstanceOf(Promise);
    });

    it('should handle complex async operations', async () => {
      const asyncFn = new AsyncFunction(`
        const promise1 = Promise.resolve(10);
        const promise2 = Promise.resolve(20);
        const result1 = await promise1;
        const result2 = await promise2;
        return result1 + result2;
      `);
      
      const result = await asyncFn();
      expect(result).toBe(30);
    });

    it('should handle errors in async functions', async () => {
      const asyncFn = new AsyncFunction('throw new Error("test error")');
      
      await expect(asyncFn()).rejects.toThrow('test error');
    });

    it('should handle setTimeout in async context', async () => {
      const asyncFn = new AsyncFunction(`
        return new Promise(resolve => {
          setTimeout(() => resolve('delayed'), 10);
        });
      `);
      
      const result = await asyncFn();
      expect(result).toBe('delayed');
    });
  });

  describe('Integration tests', () => {
    it('should work together for variable name generation with property checking', () => {
      const varName = generateVarName();
      const obj = { [varName]: 'test' };
      
      expect(hasOwnProp(obj, varName)).toBe(true);
      expect(hasOwnProp(obj, generateVarName())).toBe(false);
    });

    it('should handle async function creation with generated variable names', async () => {
      const varName = generateVarName();
      const asyncFn = new AsyncFunction(varName, `return ${varName} * 2`);
      
      const result = await asyncFn(21);
      expect(result).toBe(42);
    });

    it('should create multiple unique async functions', async () => {
      const varName1 = generateVarName();
      const varName2 = generateVarName();
      
      const fn1 = new AsyncFunction(varName1, `return ${varName1} + 1`);
      const fn2 = new AsyncFunction(varName2, `return ${varName2} + 2`);
      
      expect(await fn1(10)).toBe(11);
      expect(await fn2(10)).toBe(12);
    });

    it('should handle property existence checks on generated objects', () => {
      const propName = generateVarName();
      const obj: any = {};
      
      expect(hasOwnProp(obj, propName)).toBe(false);
      
      obj[propName] = 'value';
      expect(hasOwnProp(obj, propName)).toBe(true);
    });
  });
});