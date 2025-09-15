import { 
  Py, 
  $__, 
  __$__, 
  tryCatchSeq,
  unaryOperatorsMap,
  binaryOperatorsMap
} from '../src/operators';

describe('Operators', () => {
  describe('Py symbols', () => {
    it('should define all unary operator symbols', () => {
      expect(typeof Py.__pos__).toBe('symbol');
      expect(typeof Py.__neg__).toBe('symbol');
      expect(typeof Py.__not__).toBe('symbol');
      expect(typeof Py.__invert__).toBe('symbol');
      expect(typeof Py.__typeof__).toBe('symbol');
      expect(typeof Py.__void__).toBe('symbol');
    });

    it('should define all binary operator symbols', () => {
      expect(typeof Py.__add__).toBe('symbol');
      expect(typeof Py.__sub__).toBe('symbol');
      expect(typeof Py.__mul__).toBe('symbol');
      expect(typeof Py.__div__).toBe('symbol');
      expect(typeof Py.__mod__).toBe('symbol');
      expect(typeof Py.__pow__).toBe('symbol');
    });

    it('should define comparison operator symbols', () => {
      expect(typeof Py.__eq__).toBe('symbol');
      expect(typeof Py.__ne__).toBe('symbol');
      expect(typeof Py.__lt__).toBe('symbol');
      expect(typeof Py.__le__).toBe('symbol');
      expect(typeof Py.__gt__).toBe('symbol');
      expect(typeof Py.__ge__).toBe('symbol');
      expect(typeof Py.__seq__).toBe('symbol');
      expect(typeof Py.__sne__).toBe('symbol');
    });

    it('should define logical operator symbols', () => {
      expect(typeof Py.__and__).toBe('symbol');
      expect(typeof Py.__or__).toBe('symbol');
      expect(typeof Py.__nullish__).toBe('symbol');
    });

    it('should define reversed operator symbols', () => {
      expect(typeof Py.__radd__).toBe('symbol');
      expect(typeof Py.__rsub__).toBe('symbol');
      expect(typeof Py.__rmul__).toBe('symbol');
      expect(typeof Py.__rdiv__).toBe('symbol');
    });

    it('should define bitwise operator symbols', () => {
      expect(typeof Py.__xor__).toBe('symbol');
      expect(typeof Py.__bitwise_and__).toBe('symbol');
      expect(typeof Py.__bitwise_or__).toBe('symbol');
      expect(typeof Py.__lshift__).toBe('symbol');
      expect(typeof Py.__rshift__).toBe('symbol');
      expect(typeof Py.__urshift__).toBe('symbol');
    });

    it('should define special operator symbols', () => {
      expect(typeof Py.__in__).toBe('symbol');
      expect(typeof Py.__instanceof__).toBe('symbol');
      expect(typeof Py.__cmp__).toBe('symbol');
      expect(typeof Py.__arithmetic__).toBe('symbol');
      expect(typeof Py.__bitwise__).toBe('symbol');
      expect(typeof Py.__logical__).toBe('symbol');
    });
  });

  describe('$__ (unary operator function)', () => {
    it('should handle positive operator', () => {
      const result = $__('+', 5);
      expect(result).toBe(5);
    });

    it('should handle negative operator', () => {
      const result = $__('-', 5);
      expect(result).toBe(-5);
    });

    it('should handle logical not operator', () => {
      const result = $__('!', true);
      expect(result).toBe(false);
    });

    it('should handle bitwise not operator', () => {
      const result = $__('~', 5);
      expect(result).toBe(~5);
    });

    it('should handle typeof operator', () => {
      const result = $__('typeof', 'hello');
      expect(result).toBe('string');
    });

    it('should handle custom unary operator on object', () => {
      const obj = {
        [Py.__neg__]() {
          return 'custom negative';
        }
      };
      const result = $__('-', obj);
      expect(result).toBe('custom negative');
    });

    it('should fallback to default behavior when custom operator throws', () => {
      const obj = {
        [Py.__neg__]() {
          throw new Error('Custom error');
        }
      };
      const result = $__('-', 5);
      expect(result).toBe(-5);
    });

    it('should handle objects without custom operators', () => {
      const obj = {};
      const result = $__('-', 5);
      expect(result).toBe(-5);
    });
  });

  describe('__$__ (binary operator function)', () => {
    it('should handle addition', () => {
      const result = __$__(5, '+', 3);
      expect(result).toBe(8);
    });

    it('should handle subtraction', () => {
      const result = __$__(10, '-', 4);
      expect(result).toBe(6);
    });

    it('should handle multiplication', () => {
      const result = __$__(6, '*', 7);
      expect(result).toBe(42);
    });

    it('should handle division', () => {
      const result = __$__(15, '/', 3);
      expect(result).toBe(5);
    });

    it('should handle modulus', () => {
      const result = __$__(17, '%', 5);
      expect(result).toBe(2);
    });

    it('should handle power', () => {
      const result = __$__(2, '**', 3);
      expect(result).toBe(8);
    });

    it('should handle bitwise operations', () => {
      expect(__$__(5, '&', 3)).toBe(1);
      expect(__$__(5, '|', 3)).toBe(7);
      expect(__$__(5, '^', 3)).toBe(6);
      expect(__$__(8, '<<', 2)).toBe(32);
      expect(__$__(8, '>>', 2)).toBe(2);
      expect(__$__(8, '>>>', 2)).toBe(2);
    });

    it('should handle comparison operations', () => {
      expect(__$__(5, '==', 5)).toBe(true);
      expect(__$__(5, '!=', 3)).toBe(true);
      expect(__$__(5, '===', 5)).toBe(true);
      expect(__$__(5, '!==', '5')).toBe(true);
      expect(__$__(5, '<', 10)).toBe(true);
      expect(__$__(5, '<=', 5)).toBe(true);
      expect(__$__(10, '>', 5)).toBe(true);
      expect(__$__(10, '>=', 10)).toBe(true);
    });

    it('should handle custom binary operator on left operand', () => {
      const obj = {
        [Py.__add__](other: any) {
          return `custom add with ${other}`;
        }
      };
      const result = __$__(obj, '+', 5);
      expect(result).toBe('custom add with 5');
    });

    it('should handle custom binary operator on right operand', () => {
      const obj = {
        [Py.__radd__](other: any) {
          return `custom reverse add with ${other}`;
        }
      };
      const result = __$__(5, '+', obj);
      expect(result).toBe('custom reverse add with 5');
    });

    it('should handle in operator', () => {
      const obj = { a: 1, b: 2 };
      expect(__$__('a', 'in', obj)).toBe(true);
      expect(__$__('c', 'in', obj)).toBe(false);
    });

    it('should handle instanceof operator', () => {
      const arr: any[] = [];
      expect(__$__(arr, 'instanceof', Array)).toBe(true);
      expect(__$__(arr, 'instanceof', Object)).toBe(true);
      expect(__$__(5, 'instanceof', Array)).toBe(false);
    });

    it('should fallback through try-catch sequence', () => {
      // Object without any custom operators should use default behavior
      const result = __$__(5, '+', 3);
      expect(result).toBe(8);
    });
  });

  describe('tryCatchSeq', () => {
    it('should execute first function if it succeeds', () => {
      const fn1 = jest.fn(() => 'first');
      const fn2 = jest.fn(() => 'second');
      
      const result = tryCatchSeq(fn1, fn2);
      
      expect(result).toBe('first');
      expect(fn1).toHaveBeenCalled();
      expect(fn2).not.toHaveBeenCalled();
    });

    it('should execute second function if first throws', () => {
      const fn1 = jest.fn(() => { throw new Error('first failed'); });
      const fn2 = jest.fn(() => 'second');
      
      const result = tryCatchSeq(fn1, fn2);
      
      expect(result).toBe('second');
      expect(fn1).toHaveBeenCalled();
      expect(fn2).toHaveBeenCalled();
    });

    it('should execute all functions until one succeeds', () => {
      const fn1 = jest.fn(() => { throw new Error('first failed'); });
      const fn2 = jest.fn(() => { throw new Error('second failed'); });
      const fn3 = jest.fn(() => 'third');
      
      const result = tryCatchSeq(fn1, fn2, fn3);
      
      expect(result).toBe('third');
      expect(fn1).toHaveBeenCalled();
      expect(fn2).toHaveBeenCalled();
      expect(fn3).toHaveBeenCalled();
    });

    it('should throw if all functions fail', () => {
      const fn1 = jest.fn(() => { throw new Error('first failed'); });
      const fn2 = jest.fn(() => { throw new Error('second failed'); });
      
      expect(() => {
        tryCatchSeq(fn1, fn2);
      }).toThrow('second failed');
    });

    it('should handle empty function array', () => {
      const result = tryCatchSeq();
      expect(result).toBeUndefined();
    });

    it('should handle single function', () => {
      const fn = jest.fn(() => 'single');
      const result = tryCatchSeq(fn);
      expect(result).toBe('single');
      expect(fn).toHaveBeenCalled();
    });
  });

  describe('operator mappings', () => {
    it('should map unary operators correctly', () => {
      expect(unaryOperatorsMap['+']).toBe(Py.__pos__);
      expect(unaryOperatorsMap['-']).toBe(Py.__neg__);
      expect(unaryOperatorsMap['!']).toBe(Py.__not__);
      expect(unaryOperatorsMap['~']).toBe(Py.__invert__);
      expect(unaryOperatorsMap['typeof']).toBe(Py.__typeof__);
    });

    it('should map binary operators correctly', () => {
      expect(binaryOperatorsMap['+']).toBe(Py.__add__);
      expect(binaryOperatorsMap['-']).toBe(Py.__sub__);
      expect(binaryOperatorsMap['*']).toBe(Py.__mul__);
      expect(binaryOperatorsMap['/']).toBe(Py.__div__);
      expect(binaryOperatorsMap['%']).toBe(Py.__mod__);
      expect(binaryOperatorsMap['**']).toBe(Py.__pow__);
      expect(binaryOperatorsMap['==']).toBe(Py.__eq__);
      expect(binaryOperatorsMap['!=']).toBe(Py.__ne__);
      expect(binaryOperatorsMap['===']).toBe(Py.__seq__);
      expect(binaryOperatorsMap['!==']).toBe(Py.__sne__);
      expect(binaryOperatorsMap['<']).toBe(Py.__lt__);
      expect(binaryOperatorsMap['<=']).toBe(Py.__le__);
      expect(binaryOperatorsMap['>']).toBe(Py.__gt__);
      expect(binaryOperatorsMap['>=']).toBe(Py.__ge__);
      expect(binaryOperatorsMap['&']).toBe(Py.__bitwise_and__);
      expect(binaryOperatorsMap['|']).toBe(Py.__bitwise_or__);
      expect(binaryOperatorsMap['^']).toBe(Py.__xor__);
      expect(binaryOperatorsMap['<<']).toBe(Py.__lshift__);
      expect(binaryOperatorsMap['>>']).toBe(Py.__rshift__);
      expect(binaryOperatorsMap['>>>']).toBe(Py.__urshift__);
      expect(binaryOperatorsMap['in']).toBe(Py.__in__);
      expect(binaryOperatorsMap['instanceof']).toBe(Py.__instanceof__);
    });
  });

  describe('complex operator scenarios', () => {
    class Vector {
      constructor(public x: number, public y: number) {}

      [Py.__add__](other: Vector): Vector {
        return new Vector(this.x + other.x, this.y + other.y);
      }

      [Py.__sub__](other: Vector): Vector {
        return new Vector(this.x - other.x, this.y - other.y);
      }

      [Py.__mul__](scalar: number): Vector {
        return new Vector(this.x * scalar, this.y * scalar);
      }

      [Py.__rmul__](scalar: number): Vector {
        return new Vector(this.x * scalar, this.y * scalar);
      }

      [Py.__eq__](other: Vector): boolean {
        return this.x === other.x && this.y === other.y;
      }

      [Py.__ne__](other: Vector): boolean {
        return !this[Py.__eq__](other as any);
      }

      [Py.__cmp__](other: Vector): number {
        const thisMag = Math.sqrt(this.x * this.x + this.y * this.y);
        const otherMag = Math.sqrt(other.x * other.x + other.y * other.y);
        return thisMag - otherMag;
      }

      [Py.__neg__](): Vector {
        return new Vector(-this.x, -this.y);
      }
    }

    it('should handle vector addition', () => {
      const v1 = new Vector(1, 2);
      const v2 = new Vector(3, 4);
      const result = __$__(v1, '+', v2);
      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
    });

    it('should handle vector multiplication', () => {
      const v = new Vector(2, 3);
      const result = __$__(v, '*', 3);
      expect(result.x).toBe(6);
      expect(result.y).toBe(9);
    });

    it('should handle reverse vector multiplication', () => {
      const v = new Vector(2, 3);
      const result = __$__(3, '*', v);
      expect(result.x).toBe(6);
      expect(result.y).toBe(9);
    });

    it('should handle vector equality', () => {
      const v1 = new Vector(1, 2);
      const v2 = new Vector(1, 2);
      const v3 = new Vector(2, 3);
      
      expect(__$__(v1, '==', v2)).toBe(true);
      expect(__$__(v1, '!=', v3)).toBe(true);
    });

    it('should handle vector negation', () => {
      const v = new Vector(1, -2);
      const result = $__('-', v);
      expect(result.x).toBe(-1);
      expect(result.y).toBe(2);
    });

    it('should handle mixed types with fallback', () => {
      const result = __$__(5, '+', '3');
      expect(result).toBe('53'); // JavaScript default behavior
    });
  });
});