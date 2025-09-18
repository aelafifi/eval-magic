# Magic Method Operators Reference

This document provides comprehensive documentation for all the `Py.__magic_symbols__` available in eval-magic, inspired by Python's magic methods for operator overloading.

## Table of Contents

- [Overview](#overview)
- [Unary Operators](#unary-operators)
- [Binary Operators](#binary-operators)
  - [Arithmetic Operators](#arithmetic-operators)
  - [Bitwise Operators](#bitwise-operators)
  - [Comparison Operators](#comparison-operators)
  - [Logical Operators](#logical-operators)
  - [Other Operators](#other-operators)
- [Reversed Binary Operators](#reversed-binary-operators)
- [Custom Shorthand Operators](#custom-shorthand-operators)
- [Usage Patterns](#usage-patterns)

## Overview

Magic methods in eval-magic allow you to define custom behavior for operators when applied to your objects. These methods are called automatically when the corresponding operator is used, enabling operator overloading similar to Python.

## Unary Operators

### `__pos__`
**Symbol for:** Unary plus operator (`+`)  
**JavaScript equivalent:** `+obj`  
**Default behavior:** `+a`

### `__neg__`
**Symbol for:** Unary minus operator (`-`)  
**JavaScript equivalent:** `-obj`  
**Default behavior:** `-a`

**Example:**
```javascript
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    [Py.__neg__]() {
        return new Point(-this.x, -this.y);
    }
}

const p1 = new Point(3, 4);
const p2 = -p1; // Point(-3, -4)
```

### `__not__`
**Symbol for:** Logical NOT operator (`!`)  
**JavaScript equivalent:** `!obj`  
**Default behavior:** `!a`

### `__invert__`
**Symbol for:** Bitwise NOT operator (`~`)  
**JavaScript equivalent:** `~obj`  
**Default behavior:** `~a`

### `__typeof__`
**Symbol for:** typeof operator  
**JavaScript equivalent:** `typeof obj`  
**Default behavior:** `typeof a`

### `__void__`
**Symbol for:** void operator  
**JavaScript equivalent:** `void obj`  
**Default behavior:** `void a`

### `__delete__` ❌
**Status:** Not available  
**Reason:** Cannot set a default action for the delete operator in JavaScript

## Binary Operators

### Arithmetic Operators

#### `__add__` / `__radd__`
**Symbol for:** Addition operator (`+`)  
**JavaScript equivalent:** `a + b`  
**Default behavior:** `a + b`

**Example:**
```javascript
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    [Py.__add__](other) {
        if (other instanceof Vector) {
            return new Vector(this.x + other.x, this.y + other.y);
        }
        // Handle scalar addition
        return new Vector(this.x + other, this.y + other);
    }
    
    [Py.__radd__](other) {
        return this[Py.__add__](other);
    }
}

const v1 = new Vector(1, 2);
const v2 = new Vector(3, 4);
const v3 = v1 + v2; // Vector(4, 6)
const v4 = 5 + v1;  // Vector(6, 7) - uses __radd__
```

#### `__sub__` / `__rsub__`
**Symbol for:** Subtraction operator (`-`)  
**JavaScript equivalent:** `a - b`  
**Default behavior:** `a - b`

#### `__mul__` / `__rmul__`
**Symbol for:** Multiplication operator (`*`)  
**JavaScript equivalent:** `a * b`  
**Default behavior:** `a * b`

#### `__div__` / `__rdiv__`
**Symbol for:** Division operator (`/`)  
**JavaScript equivalent:** `a / b`  
**Default behavior:** `a / b`

#### `__mod__` / `__rmod__`
**Symbol for:** Modulus operator (`%`)  
**JavaScript equivalent:** `a % b`  
**Default behavior:** `a % b`

#### `__pow__` / `__rpow__`
**Symbol for:** Exponentiation operator (`**`)  
**JavaScript equivalent:** `a ** b`  
**Default behavior:** `a ** b`

#### `__lshift__` / `__rlshift__`
**Symbol for:** Left shift operator (`<<`)  
**JavaScript equivalent:** `a << b`  
**Default behavior:** `a << b`

#### `__rshift__` / `__rrshift__`
**Symbol for:** Right shift operator (`>>`)  
**JavaScript equivalent:** `a >> b`  
**Default behavior:** `a >> b`

#### `__urshift__` / `__rurshift__`
**Symbol for:** Unsigned right shift operator (`>>>`)  
**JavaScript equivalent:** `a >>> b`  
**Default behavior:** `a >>> b`

### Bitwise Operators

#### `__xor__` / `__rxor__`
**Symbol for:** Bitwise XOR operator (`^`)  
**JavaScript equivalent:** `a ^ b`  
**Default behavior:** `a ^ b`

#### `__bitwise_and__` / `__rbitwise_and__`
**Symbol for:** Bitwise AND operator (`&`)  
**JavaScript equivalent:** `a & b`  
**Default behavior:** `a & b`

#### `__bitwise_or__` / `__rbitwise_or__`
**Symbol for:** Bitwise OR operator (`|`)  
**JavaScript equivalent:** `a | b`  
**Default behavior:** `a | b`

### Comparison Operators

#### `__eq__`
**Symbol for:** Equality operator (`==`)  
**JavaScript equivalent:** `a == b`  
**Default behavior:** `a == b`

#### `__ne__`
**Symbol for:** Inequality operator (`!=`)  
**JavaScript equivalent:** `a != b`  
**Default behavior:** `a != b`

#### `__lt__`
**Symbol for:** Less than operator (`<`)  
**JavaScript equivalent:** `a < b`  
**Default behavior:** `a < b`

#### `__le__`
**Symbol for:** Less than or equal operator (`<=`)  
**JavaScript equivalent:** `a <= b`  
**Default behavior:** `a <= b`

#### `__gt__`
**Symbol for:** Greater than operator (`>`)  
**JavaScript equivalent:** `a > b`  
**Default behavior:** `a > b`

#### `__ge__`
**Symbol for:** Greater than or equal operator (`>=`)  
**JavaScript equivalent:** `a >= b`  
**Default behavior:** `a >= b`

#### `__seq__`
**Symbol for:** Strict equality operator (`===`)  
**JavaScript equivalent:** `a === b`  
**Default behavior:** `a === b`

#### `__sne__`
**Symbol for:** Strict inequality operator (`!==`)  
**JavaScript equivalent:** `a !== b`  
**Default behavior:** `a !== b`

**Example:**
```javascript
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    [Py.__eq__](other) {
        return other instanceof Person && 
               this.name === other.name && 
               this.age === other.age;
    }
    
    [Py.__lt__](other) {
        return other instanceof Person && this.age < other.age;
    }
}

const person1 = new Person("Alice", 25);
const person2 = new Person("Bob", 30);
console.log(person1 < person2); // true
console.log(person1 == person2); // false
```

### Logical Operators

#### `__and__` / `__rand__`
**Symbol for:** Logical AND operator (`&&`)  
**JavaScript equivalent:** `a && b`  
**Default behavior:** `a && b`

#### `__or__` / `__ror__`
**Symbol for:** Logical OR operator (`||`)  
**JavaScript equivalent:** `a || b`  
**Default behavior:** `a || b`

#### `__nullish__` / `__rnullish__`
**Symbol for:** Nullish coalescing operator (`??`)  
**JavaScript equivalent:** `a ?? b`  
**Default behavior:** `a ?? b`

### Other Operators

#### `__in__` / `__rin__`
**Symbol for:** in operator  
**JavaScript equivalent:** `a in b`  
**Default behavior:** `a in b`

**Example:**
```javascript
class CustomContainer {
    constructor(items) {
        this.items = new Set(items);
    }
    
    [Py.__rin__](item) {
        return this.items.has(item);
    }
}

const container = new CustomContainer([1, 2, 3]);
console.log(2 in container); // true
console.log(5 in container); // false
```

#### `__instanceof__` / `__rinstanceof__`
**Symbol for:** instanceof operator  
**JavaScript equivalent:** `a instanceof b`  
**Default behavior:** `a instanceof b`

## Reversed Binary Operators

For every binary operator `__op__`, there's a corresponding reversed version `__rop__`. These are called when the left operand doesn't have the operator method defined, or when it fails.

**Pattern:** If `a + b` fails to find `a.__add__(b)`, it tries `b.__radd__(a)`

The reversed operators follow this naming pattern:
- `__radd__`, `__rsub__`, `__rmul__`, `__rdiv__`, `__rmod__`, `__rpow__`
- `__rlshift__`, `__rrshift__`, `__rurshift__`
- `__rxor__`, `__rbitwise_and__`, `__rbitwise_or__`
- `__rand__`, `__ror__`, `__rnullish__`
- `__rin__`, `__rinstanceof__`

**Note:** Comparison operators have special reversed behavior:
- `__eq__` ↔ `__eq__` (symmetric)
- `__ne__` ↔ `__ne__` (symmetric)
- `__lt__` ↔ `__gt__` (opposite)
- `__le__` ↔ `__ge__` (opposite)
- `__gt__` ↔ `__lt__` (opposite)
- `__ge__` ↔ `__le__` (opposite)

## Custom Shorthand Operators

These are convenience operators that allow you to define behavior for multiple related operators at once.

### `__arithmetic__`
**Purpose:** Custom arithmetic shorthand  
**Usage:** Called by all arithmetic operators when they delegate to this method

Instead of implementing individual arithmetic methods (`__add__`, `__sub__`, `__mul__`, etc.), you can implement a single `__arithmetic__` method that handles all arithmetic operations.

**Example:**
```javascript
import { Py } from "eval-magic";

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    // Single method to handle all arithmetic operations
    [Py.__arithmetic__](other, defaultAction) {
        // Convert other to Point if it's not already
        const otherPoint = this.pointify(other);
        
        // Use the defaultAction to determine which operation was called
        // The defaultAction contains the native JavaScript behavior
        const result = defaultAction(
            { x: this.x, y: this.y }, 
            { x: otherPoint.x, y: otherPoint.y }
        );
        
        return new Point(result.x, result.y);
    }
    
    pointify(value) {
        if (value instanceof Point) return value;
        if (Array.isArray(value) && value.length === 2) {
            return new Point(value[0], value[1]);
        }
        if (typeof value === 'object' && 'x' in value && 'y' in value) {
            return new Point(value.x, value.y);
        }
        if (typeof value === 'number') {
            return new Point(value, value);
        }
        throw new TypeError('Cannot convert to Point');
    }
    
    toString() {
        return `Point(${this.x}, ${this.y})`;
    }
}

// Usage - all these operations work through the single __arithmetic__ method:
const p1 = new Point(10, 20);
const p2 = new Point(5, 10);

console.log((p1 + p2).toString());  // Point(15, 30)
console.log((p1 - p2).toString());  // Point(5, 10) 
console.log((p1 * 2).toString());   // Point(20, 40)
console.log((p1 / [2, 4]).toString()); // Point(5, 5)
```

**How it works:**
- When you use `p1 + p2`, eval-magic calls `p1[Py.__arithmetic__](p2, defaultAddAction)`
- When you use `p1 * 2`, eval-magic calls `p1[Py.__arithmetic__](2, defaultMulAction)`
- The `defaultAction` parameter contains the native JavaScript operation behavior
- Your `__arithmetic__` method can then apply this operation to your custom data structure

### `__bitwise__`
**Purpose:** Custom bitwise shorthand  
**Usage:** Called by all bitwise operators when they delegate to this method

### `__logical__`
**Purpose:** Custom logical shorthand  
**Usage:** Called by all logical operators when they delegate to this method

### `__cmp__`
**Purpose:** Custom comparison shorthand  
**Usage:** Single method to handle all comparison operators

**Example:**
```javascript
class Temperature {
    constructor(celsius) {
        this.celsius = celsius;
    }
    
    [Py.__cmp__](other) {
        if (!(other instanceof Temperature)) {
            other = new Temperature(other);
        }
        return this.celsius - other.celsius;
    }
}

const temp1 = new Temperature(20);
const temp2 = new Temperature(25);
console.log(temp1 < temp2);  // true (uses __cmp__)
console.log(temp1 == temp2); // false (uses __cmp__)
console.log(temp1 > temp2);  // false (uses __cmp__)
```

## Usage Patterns

### Method Resolution Order

When an operator is used, eval-magic tries to resolve it in this order:

1. **Direct method:** `left[Py.__op__](right)`
2. **Reversed method:** `right[Py.__rop__](left)`
3. **Shorthand method:** `left[Py.__shorthand__](right, defaultAction)`
4. **Reversed shorthand:** `right[Py.__shorthand__](left, defaultAction)`
5. **Default behavior:** Native JavaScript operator

### Best Practices

1. **Implement both directions:** For commutative operations, implement both `__op__` and `__rop__`
2. **Type checking:** Always check the type of the other operand
3. **Fallback gracefully:** Return appropriate values or throw meaningful errors
4. **Use shorthand methods:** For related operators, consider using `__cmp__`, `__arithmetic__`, etc.
5. **Maintain consistency:** Ensure your operators behave consistently with mathematical expectations

### Example: Complete Numeric Class

```javascript
import { Py } from "eval-magic";

class Complex {
    constructor(real, imag = 0) {
        this.real = real;
        this.imag = imag;
    }
    
    [Py.__add__](other) {
        if (typeof other === 'number') {
            return new Complex(this.real + other, this.imag);
        }
        if (other instanceof Complex) {
            return new Complex(this.real + other.real, this.imag + other.imag);
        }
        throw new TypeError('Unsupported operand type');
    }
    
    [Py.__radd__](other) {
        return this[Py.__add__](other);
    }
    
    [Py.__mul__](other) {
        if (typeof other === 'number') {
            return new Complex(this.real * other, this.imag * other);
        }
        if (other instanceof Complex) {
            return new Complex(
                this.real * other.real - this.imag * other.imag,
                this.real * other.imag + this.imag * other.real
            );
        }
        throw new TypeError('Unsupported operand type');
    }
    
    [Py.__rmul__](other) {
        return this[Py.__mul__](other);
    }
    
    [Py.__eq__](other) {
        if (typeof other === 'number') {
            return this.real === other && this.imag === 0;
        }
        if (other instanceof Complex) {
            return this.real === other.real && this.imag === other.imag;
        }
        return false;
    }
    
    toString() {
        if (this.imag === 0) return this.real.toString();
        if (this.real === 0) return `${this.imag}i`;
        const sign = this.imag >= 0 ? '+' : '-';
        return `${this.real}${sign}${Math.abs(this.imag)}i`;
    }
}

// Usage
const c1 = new Complex(3, 4);
const c2 = new Complex(1, 2);
console.log((c1 + c2).toString()); // "4+6i"
console.log((c1 * 2).toString());  // "6+8i"
console.log(c1 == c1);             // true
```