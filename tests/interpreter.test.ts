import { compile, evaluate } from '../src/interpreter';
import { Py } from '../src/operators';
import { RunOptions } from '../src/types';

describe('Interpreter', () => {
  describe('evaluate', () => {
    it('should evaluate simple expressions', () => {
      const result = evaluate('return 1 + 2', {}, { returns: 'return' });
      expect(result).toBe(3);
    });

    it('should evaluate with global scope', () => {
      const result = evaluate('return x + y', { x: 10, y: 20 }, { returns: 'return' });
      expect(result).toBe(30);
    });

    it('should evaluate expressions with exports', () => {
      const result = evaluate(`
        export const sum = x + y;
        export const diff = x - y;
      `, { x: 10, y: 20 });
      expect(result).toEqual({ sum: 30, diff: -10 });
    });

    it('should handle return mode', () => {
      const result = evaluate('return x * 2', { x: 5 }, { returns: 'return' });
      expect(result).toBe(10);
    });

    it('should handle async import functions', async () => {
      const importFn = async (source: string) => {
        if (source === 'mathjs') {
          return { sqrt: Math.sqrt };
        }
        throw new Error('Module not found');
      };

      const result = await evaluate(`
        import { sqrt } from "mathjs";
        export const root = sqrt(x);
      `, { x: 16 }, { importFunction: importFn });

      expect(result).toEqual({ root: 4 });
    });

    it('should handle sync import functions', () => {
      const importFn = (source: string) => {
        if (source === 'utils') {
          return { double: (x: number) => x * 2 };
        }
        throw new Error('Module not found');
      };

      const result = evaluate(`
        import { double } from "utils";
        export const doubled = double(x);
      `, { x: 5 }, { importFunction: importFn });

      expect(result).toEqual({ doubled: 10 });
    });

    it('should handle operator overloading disabled', () => {
      const result = evaluate('return x + y', { x: 10, y: 20 }, { operatorOverloading: false, returns: 'return' });
      expect(result).toBe(30);
    });

    it('should handle custom parse options', () => {
      const result = evaluate('return x + y', { x: 10, y: 20 }, {
        parseOptions: { ecmaVersion: 2015 },
        returns: 'return'
      });
      expect(result).toBe(30);
    });

    it('should handle async code with await', async () => {
      const result = await evaluate(`
        const promise = Promise.resolve(42);
        export const value = await promise;
      `, {}, { isAsync: true });
      expect(result).toEqual({ value: 42 });
    });

    it('should throw error for invalid code', () => {
      expect(() => {
        evaluate('invalid syntax {[}', {}, { returns: 'return' });
      }).toThrow();
    });
  });

  describe('compile', () => {
    it('should compile and return CompiledCode object', () => {
      const compiled = compile('return x + y', { x: 1, y: 2 }, { returns: 'return' });
      
      expect(compiled).toHaveProperty('origCode');
      expect(compiled).toHaveProperty('genCode');
      expect(compiled).toHaveProperty('fn');
      expect(compiled).toHaveProperty('args');
      expect(compiled).toHaveProperty('run');
      expect(typeof compiled.fn).toBe('function');
      expect(typeof compiled.run).toBe('function');
      expect(compiled.origCode).toBe('return x + y');
    });

    it('should compile and execute multiple times', () => {
      const compiled = compile('return x * 2', { x: 5 }, { returns: 'return' });
      
      const result1 = compiled.run();
      const result2 = compiled.run();
      
      expect(result1).toBe(10);
      expect(result2).toBe(10);
    });

    it('should handle empty globals', () => {
      const compiled = compile('return 1 + 1', {}, { returns: 'return' });
      const result = compiled.run();
      expect(result).toBe(2);
    });

    it('should handle empty options', () => {
      const compiled = compile('return x', { x: 42 }, { returns: 'return' });
      const result = compiled.run();
      expect(result).toBe(42);
    });

    it('should filter globals by identifiers used in code', () => {
      const compiled = compile('return x', { x: 1, y: 2, z: 3 }, { returns: 'return' });
      // Only x should be in the scope since y and z are not used
      expect(compiled.args.length).toBe(1);
    });

    it('should include operator functions when used', () => {
      const compiled = compile('return x + y', { x: 1, y: 2 }, { returns: 'return' });
      // Should include the binary operator function
      expect(compiled.args.length).toBe(3); // x, y, and binary function
    });
  });

  describe('operator overloading integration', () => {
    class Point {
      constructor(public x: number, public y: number) {}

      [Py.__add__](other: Point): Point {
        return new Point(this.x + other.x, this.y + other.y);
      }

      [Py.__sub__](other: Point): Point {
        return new Point(this.x - other.x, this.y - other.y);
      }

      [Py.__mul__](scalar: number): Point {
        return new Point(this.x * scalar, this.y * scalar);
      }

      [Py.__neg__](): Point {
        return new Point(-this.x, -this.y);
      }

      toString(): string {
        return `Point(${this.x}, ${this.y})`;
      }
    }

    it('should handle custom addition', () => {
      const p1 = new Point(1, 2);
      const p2 = new Point(3, 4);
      
      const result = evaluate('return p1 + p2', { p1, p2 }, { returns: 'return' });
      expect(result).toBeInstanceOf(Point);
      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
    });

    it('should handle custom subtraction', () => {
      const p1 = new Point(5, 7);
      const p2 = new Point(2, 3);
      
      const result = evaluate('return p1 - p2', { p1, p2 }, { returns: 'return' });
      expect(result).toBeInstanceOf(Point);
      expect(result.x).toBe(3);
      expect(result.y).toBe(4);
    });

    it('should handle custom multiplication', () => {
      const p = new Point(2, 3);
      
      const result = evaluate('return p * 3', { p }, { returns: 'return' });
      expect(result).toBeInstanceOf(Point);
      expect(result.x).toBe(6);
      expect(result.y).toBe(9);
    });

    it('should handle unary negation', () => {
      const p = new Point(1, -2);
      
      const result = evaluate('return -p', { p }, { returns: 'return' });
      expect(result).toBeInstanceOf(Point);
      expect(result.x).toBe(-1);
      expect(result.y).toBe(2);
    });

    it('should fallback to default behavior when operator not defined', () => {
      const result = evaluate('return 5 + 3', {}, { returns: 'return' });
      expect(result).toBe(8);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined globals', () => {
      const result = evaluate('return typeof x', {}, { returns: 'return' });
      expect(result).toBe('undefined');
    });

    it('should handle null values', () => {
      const result = evaluate('return x', { x: null }, { returns: 'return' });
      expect(result).toBe(null);
    });

    it('should handle boolean values', () => {
      const result = evaluate('return x && y', { x: true, y: false }, { returns: 'return' });
      expect(result).toBe(false);
    });

    it('should handle array operations', () => {
      const result = evaluate('return arr[0] + arr[1]', { arr: [1, 2, 3] }, { returns: 'return' });
      expect(result).toBe(3);
    });

    it('should handle object property access', () => {
      const result = evaluate('return obj.a + obj.b', { obj: { a: 1, b: 2 } }, { returns: 'return' });
      expect(result).toBe(3);
    });

    it('should handle function calls', () => {
      const fn = (x: number) => x * 2;
      const result = evaluate('return fn(5)', { fn }, { returns: 'return' });
      expect(result).toBe(10);
    });

    it('should handle nested expressions', () => {
      const result = evaluate('return (x + y) * (a - b)', { x: 1, y: 2, a: 5, b: 3 }, { returns: 'return' });
      expect(result).toBe(6); // (1 + 2) * (5 - 3) = 3 * 2 = 6
    });
  });
});