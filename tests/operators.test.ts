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

    it('should handle void operator', () => {
      const result = $__('void', 5);
      expect(result).toBe(undefined);
    });

    it('should handle void operator with expressions', () => {
      const result = $__('void', 'any expression');
      expect(result).toBe(undefined);
    });

    it('should handle typeof operator with different types', () => {
      expect($__('typeof', 'hello')).toBe('string');
      expect($__('typeof', 42)).toBe('number');
      expect($__('typeof', true)).toBe('boolean');
      expect($__('typeof', {})).toBe('object');
      expect($__('typeof', undefined)).toBe('undefined');
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

    it('should handle logical operators', () => {
      expect(__$__(true, '&&', false)).toBe(false);
      expect(__$__(true, '||', false)).toBe(true);
      expect(__$__(null, '??', 'default')).toBe('default');
      expect(__$__(0, '??', 'default')).toBe(0); // 0 is not nullish
    });

    it('should handle strict equality edge cases', () => {
      expect(__$__(0, '===', -0)).toBe(true);
      expect(__$__(NaN, '===', NaN)).toBe(false);
      expect(__$__(5, '===', '5')).toBe(false);
      expect(__$__(5, '!==', '5')).toBe(true);
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
        return !(this.x === other.x && this.y === other.y);
      }

      [Py.__cmp__](other: Vector): number {
        const thisMag = Math.sqrt(this.x * this.x + this.y * this.y);
        const otherMag = Math.sqrt(other.x * other.x + other.y * other.y);
        return thisMag - otherMag;
      }

      [Py.__arithmetic__](other: any, defaultFn: Function): any {
        if (typeof other === 'number') {
          return defaultFn(this, other);
        }
        throw new Error('Unsupported arithmetic operation');
      }

      [Py.__logical__](other: any, defaultFn: Function): any {
        return defaultFn(this, other);
      }

      [Py.__neg__](): Vector {
        return new Vector(-this.x, -this.y);
      }
    }

    class ComparisonObject {
      constructor(public value: number) {}

      [Py.__cmp__](other: ComparisonObject): number {
        return this.value - other.value;
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

    it('should handle comparison shorthand methods', () => {
      const obj1 = new ComparisonObject(5);
      const obj2 = new ComparisonObject(3);
      const obj3 = new ComparisonObject(5);

      expect(__$__(obj1, '>', obj2)).toBe(true);  // Uses __cmp__
      expect(__$__(obj1, '<', obj2)).toBe(false); // Uses __cmp__
      expect(__$__(obj1, '>=', obj3)).toBe(true); // Uses __cmp__
      expect(__$__(obj1, '<=', obj3)).toBe(true); // Uses __cmp__
      expect(__$__(obj1, '==', obj3)).toBe(true); // Uses __cmp__
      expect(__$__(obj1, '!=', obj2)).toBe(true); // Uses __cmp__
    });

    it('should handle arithmetic shorthand methods', () => {
      const v = new Vector(2, 3);
      
      const result = __$__(v, '*', 2);
      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
    });

    it('should handle logical shorthand methods', () => {
      const v1 = new Vector(1, 0);
      const v2 = new Vector(0, 1);
      
      const result = __$__(v1, '&&', v2);
      expect(result).toBe(v2); // Default logical AND behavior
    });

    it('should fallback through multiple failed attempts', () => {
      const obj = {
        [Py.__add__]() {
          throw new Error('First method fails');
        }
      };
      
      const result = __$__(obj, '+', 5);
      expect(result).toBe('5'); // Falls back to default string coercion
    });

    it('should handle all fallback attempts failing gracefully', () => {
      // This should use the default behavior since no custom methods exist
      expect(__$__(3, '*', 4)).toBe(12);
    });

  describe('reversed operator scenarios', () => {
    class LeftOperand {
      constructor(public value: number) {}
      
      // No direct operators, should trigger reversed operators on right operand
    }
    
    class RightOperand {
      constructor(public value: number) {}
      
      [Py.__radd__](other: LeftOperand): number {
        return other.value + this.value;
      }
      
      [Py.__rsub__](other: LeftOperand): number {
        return other.value - this.value;
      }
      
      [Py.__rmul__](other: LeftOperand): number {
        return other.value * this.value;
      }
      
      [Py.__rdiv__](other: LeftOperand): number {
        return other.value / this.value;
      }
      
      [Py.__rmod__](other: LeftOperand): number {
        return other.value % this.value;
      }
      
      [Py.__rpow__](other: LeftOperand): number {
        return other.value ** this.value;
      }
      
      [Py.__rlshift__](other: LeftOperand): number {
        return other.value << this.value;
      }
      
      [Py.__rrshift__](other: LeftOperand): number {
        return other.value >> this.value;
      }
      
      [Py.__rurshift__](other: LeftOperand): number {
        return other.value >>> this.value;
      }
      
      [Py.__rxor__](other: LeftOperand): number {
        return other.value ^ this.value;
      }
      
      [Py.__rbitwise_and__](other: LeftOperand): number {
        return other.value & this.value;
      }
      
      [Py.__rbitwise_or__](other: LeftOperand): number {
        return other.value | this.value;
      }
      
      [Py.__rand__](other: LeftOperand): any {
        return other.value && this.value;
      }
      
      [Py.__ror__](other: LeftOperand): any {
        return other.value || this.value;
      }
      
      [Py.__rnullish__](other: LeftOperand): any {
        return other.value ?? this.value;
      }
    }

    it('should handle reversed arithmetic operators', () => {
      const left = new LeftOperand(10);
      const right = new RightOperand(3);
      
      expect(__$__(left, '+', right)).toBe(13);
      expect(__$__(left, '-', right)).toBe(7);
      expect(__$__(left, '*', right)).toBe(30);
      expect(__$__(left, '/', right)).toBe(3.3333333333333335);
      expect(__$__(left, '%', right)).toBe(1);
      expect(__$__(left, '**', right)).toBe(1000);
    });

    it('should handle reversed bitwise operators', () => {
      const left = new LeftOperand(12); // 1100 in binary
      const right = new RightOperand(3); // 0011 in binary
      
      expect(__$__(left, '<<', right)).toBe(96); // 12 << 3 = 96
      expect(__$__(left, '>>', right)).toBe(1);  // 12 >> 3 = 1
      expect(__$__(left, '>>>', right)).toBe(1); // 12 >>> 3 = 1
      expect(__$__(left, '^', right)).toBe(15);  // 12 ^ 3 = 15
      expect(__$__(left, '&', right)).toBe(0);   // 12 & 3 = 0
      expect(__$__(left, '|', right)).toBe(15);  // 12 | 3 = 15
    });

    it('should handle reversed logical operators', () => {
      const left = new LeftOperand(5);
      const right = new RightOperand(0);
      
      expect(__$__(left, '&&', right)).toBe(0);
      expect(__$__(left, '||', right)).toBe(5);
      expect(__$__(left, '??', right)).toBe(5);
    });
  });

  describe('direct operator testing', () => {
    it('should test void operator directly', () => {
      // This should hit line 81 in operators.ts
      const obj = {
        [Py.__void__]: null // no method, will fall back to default
      };
      const result = $__('void', obj);
      expect(result).toBe(undefined);
    });

    it('should test binary default actions directly', () => {
      // Test lines 101-108 and 118-138 by forcing fallback to defaults
      const result1 = __$__(5, '!=', 3);   // line 101
      const result2 = __$__(5, '<', 10);   // line 102  
      const result3 = __$__(5, '<=', 5);   // line 103
      const result4 = __$__(10, '>', 5);   // line 104
      const result5 = __$__(10, '>=', 10); // line 105
      const result6 = __$__(5, '===', 5);  // line 106
      const result7 = __$__(5, '!==', '5');// line 107
      
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
      expect(result4).toBe(true);
      expect(result5).toBe(true);
      expect(result6).toBe(true);
      expect(result7).toBe(true);
    });

    it('should test reversed default operators', () => {
      // Force fallback to reversed default actions (lines 118-138)
      // We need objects that fail on normal operators but succeed on reversed
      const mockLeft = {};
      const mockRight = {
        [Py.__radd__]: function() { throw new Error('fail'); }
      };
      
      // This should eventually fall back to default: b + a
      const result = __$__(mockLeft, '+', 'test');
      expect(result).toBe('test'); // String coercion of mockLeft + 'test'
    });
  });
  });
});