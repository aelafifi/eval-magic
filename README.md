# Eval-Magic

A Node.js package that lets you evaluate JavaScript code in a defined scope while still allowing access to the global scope (⚠️ security here is the user’s responsibility).

## ✨ Features
- Scoped evaluation: Run JS code with custom-defined scope objects.
- Python-like magic methods: Bring operator overloading and more expressive patterns into JavaScript.
- Use export instead of return: Write modular code snippets that feel natural.
- Custom imports: Define your own import function (sync or async) to handle user imports however you like.

## 💡 Why?

Execute.js was built to make JavaScript more expressive and flexible, especially for developers experimenting with:
- Domain-Specific Languages (DSLs)
- Creative coding
- Operator overloading
- Sandbox-like script evaluation with custom rules

## 📦 Installation

```shell
npm install eval-magic
```

## ⚙️ How it works?

Eval-Magic evaluates code in a multi-step process to enable magic methods, custom imports, and flow-friendly exports:

- **AST Parsing & Transformation:** The input JavaScript code is parsed into an Abstract Syntax Tree (AST). This allows Eval-Magic to analyze and transform the code before execution.
- **Operator Overloading:** Operator expressions (like `+`, `-`, `*`, etc.) are rewritten to call special methods on objects, enabling Python-like operator overloading in JavaScript.
- **Custom Imports:** Import statements can be handled by a user-defined function, allowing for custom module resolution or mocking.
- **Export Interception:** Instead of using `return`, you can use `export` in your code snippets. Eval-Magic intercepts these exports so that code flow isn't interrupted, making it easier to write modular snippets.
- **Scoped Execution:** The transformed code is generated back to JavaScript and executed in a provided scope object. This scope is merged with the global scope when needed, so you can access globals while maintaining isolation.

This approach enables expressive, Python-inspired features in JavaScript without breaking the normal flow or requiring language-level changes.

## 🛠️ Usage

### 1. Export

```javascript
import { evaluate } from "eval-magic";

const result = evaluate(
    `
    export const sum = x + y;
    export const diff = x - y;
    `,
    { x: 10, y: 20 },
);

console.log(result);
// Output: { sum: 30, diff: -10 }
```

### 2. Import

```javascript
import { evaluate } from "eval-magic";

const result = await evaluate(
    `
    import { sqrt } from "mathjs";
    export const root = sqrt(x);
    `,
    { x: 16 },
    {
        importFunction: async (moduleName) => {
            try {
                // Some code to resolve moduleName to an actual module (as an object)
            } catch (e) {
                throw new Error("Module not found: " + moduleName);
            }
        },
    },
);

console.log(result);
// Output: { root: 4 }
```

## 🚀 Example

```javascript
import {Py} from "eval-magic";

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    pointify(value, allowSingleNumber = true) {
        // Point(x, y) -> return as is
        if (value instanceof Point) {
            return value;
        }
        
        // [x, y] -> Point(x, y)
        if (Array.isArray(value) && value.length === 2) {
            return new Point(value[0], value[1]);
        }
        
        // {x: x, y: y} -> Point(x, y)
        if (typeof value === 'object' && 'x' in value && 'y' in value) {
            return new Point(value.x, value.y);
        }
        
        // number -> Point(number, number)
        if (typeof value === 'number' && allowSingleNumber) {
            return new Point(value, value);
        }
        
        // Otherwise, throw an error
        throw new TypeError("Cannot convert to Point: " + value);
    }

    [Py.__add__](other) {
        // Allow adding any Point-like object or a number
        // Usage:
        //  - `p1 + p2`
        //  - `p1 + [x, y]`
        //  - `p1 + {x: x, y: y}`
        //  - `p1 + number`
        
        other_p = this.pointify(other);
        return new Point(this.x + other_p.x, this.y + other_p.y);
    }

    [Py.__radd__](other) {
        // Allow adding an array [x, y] to Point
        // Usage: `[x, y] + p1`
        
        // Just call the normal `__add__` method, while addition is commutative
        return this[Py.__add__](other);
    }
    
    [Pt.__sub__](other) {
        // Allow subtracting any Point-like object or a number
        // Usage:
        //  - `p1 - p2`
        //  - `p1 - [x, y]`
        //  - `p1 - {x: x, y: y}`
        //  - `p1 - number`
        
        other_p = this.pointify(other);
        return new Point(this.x - other_p.x, this.y - other_p.y);
    }
    
    [Py.__rsub__](other) {
        // Allow subtracting Point from an array [x, y]
        // Usage: `[x, y] - p1`
        
        // Just call the normal `__sub__` method, but reverse the order
        other_p = this.pointify(other);
        return other_p[Py.__sub__](this);
    }
    
    [Py.__mul__](other) {
        // Allow multiplying by any Point-like object or a number
        // Usage:
        //  - `p1 * p2`
        //  - `p1 * [x, y]`
        //  - `p1 * {x: x, y: y}`
        //  - `p1 * number`
        
        other_p = this.pointify(other);
        return new Point(this.x * other_p.x, this.y * other_p.y);
    }
    
    [Py.__rmul__](other) {
        // Allow multiplying an array [x, y] by Point
        // Usage: `[x, y] * p1`
        
        // Just call the normal `__mul__` method, while multiplication is commutative
        return this[Py.__mul__](other);
    }
    
    [Py.__div__](other) {
        // Allow dividing by any Point-like object or a number
        // Usage:
        //  - `p1 / p2`
        //  - `p1 / [x, y]`
        //  - `p1 / {x: x, y: y}`
        //  - `p1 / number`
        
        other_p = this.pointify(other);
        return new Point(this.x / other_p.x, this.y / other_p.y);
    }
    
    [Py.__rdiv__](other) {
        // Allow dividing an array [x, y] by Point
        // Usage: `[x, y] / p1`
        
        // Just call the normal `__div__` method, but reverse the order
        other_p = this.pointify(other);
        return other_p[Py.__div__](this);
    }
    
    [Py.__mod__](other) {
        // Allow modulus by any Point-like object or a number
        // Usage:
        //  - `p1 % p2`
        //  - `p1 % [x, y]`
        //  - `p1 % {x: x, y: y}`
        //  - `p1 % number`
        
        other_p = this.pointify(other);
        return new Point(this.x % other_p.x, this.y % other_p.y);
    }
    
    [Py.__rmod__](other) {
        // Allow modulus of an array [x, y] by Point
        // Usage: `[x, y] % p1`
        
        // Just call the normal `__mod__` method, but reverse the order
        other_p = this.pointify(other);
        return other_p[Py.__mod__](this);
    }
    
    [Py.__pow__](other) {
        // Allow power by any Point-like object or a number
        // Usage:
        //  - `p1 ** p2`
        //  - `p1 ** [x, y]`
        //  - `p1 ** {x: x, y: y}`
        //  - `p1 ** number`
        
        other_p = this.pointify(other);
        return new Point(this.x ** other_p.x, this.y ** other_p.y);
    }
    
    [Py.__rpow__](other) {
        // Allow power of an array [x, y] by Point
        // Usage: `[x, y] ** p1`

        // Just call the normal `__pow__` method, but reverse the order
        other_p = this.pointify(other);
        return other_p[Py.__pow__](this);
    }
    
    [Py.__neg__]() {
        // Negate the point
        // Usage: `-p1`
        return new Point(-this.x, -this.y);
    }

    // The same logic applies for all binary operators:
    //   - subtraction (-): `__sub__` and `__rsub__`
    //   - multiplication (*): `__mul__` and `__rmul__`
    //   - division (/): `__div__` and `__rdiv__`
    //   - modulus (%): `__mod__` and `__rmod__`
    //   - power (**): `__pow__` and `__rpow__`
    //   - right shift (>>): `__rshift__` and `__rrshift__`
    //   - unsigned right shift (>>>): `__urshift__` and `__rurshift__`
    //   - left shift (<<): `__lshift__` and `__rlshift__`
    //   - bitwise AND (&): `__and__` and `__rand__`
    //   - bitwise OR (|): `__or__` and `__ror__`
    //   - bitwise XOR (^): `__xor__` and `__rxor__`
    //   - logical AND (&&): `__land__` and `__rland__`
    //   - logical OR (||): `__lor__` and `__rlor__`
    //   - nullish coalescing (??): `__nullish__` and `__rnullish__`
    //   - containment (in): `__in__`, `__rin__`
    //   - instance check (instanceof): `__instanceof__`, `__rinstanceof__`

    // The only exception is the comparison operators, which are:
    //   `__lt__`, `__le__`, `__eq__`, `__ne__`, `__gt__`, `__ge__`
    // The opposite versions are as follows:
    //   - `__eq__` -> `__eq__`
    //   - `__ne__` -> `__ne__`
    //   - `__lt__` -> `__gt__`
    //   - `__le__` -> `__ge__`
    //   - `__gt__` -> `__lt__`
    //   - `__ge__` -> `__le__`

    // You can define all comparison operators in one method: `__cmp__`
    //   - If the method returns a negative number, it means "less than"
    //   - If it returns zero, it means "equal to"
    //   - If it returns a positive number, it means "greater than"

    [Py.__rshift__](other) {
        // Get angle between two points
        // Usage: `p1 >> p2`
        if (other instanceof Point) {
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            return Math.atan2(dy, dx) * (180 / Math.PI);
        }

        throw new TypeError("Unsupported operand type(s) for >>: 'Point' and '" + typeof other + "'");
    }

    [Py.__lshift__](other) {
        // Get angle between two points (in the opposite direction)
        // Usage: `p1 << p2`
        return other[Py.__rshift__](this);
    }

    [Py.__urshift__](other) {
        // Get distance between two points
        // Usage: `p1 >>> p2`
        if (other instanceof Point) {
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            return Math.hypot(dx, dy);
        }

        throw new TypeError("Unsupported operand type(s) for >>>: 'Point' and '" + typeof other + "'");
    }
}
```

> **Note:** When implementing operator methods, you can throw a `PassToDefaultBehavior` error to let eval-magic fall back to the next available implementation in the sequence, ultimately falling back to JavaScript's default behavior if no custom method handles the operation.

## API Reference

### interface RunOptions
Configuration options for parsing, transforming, and executing code.

- `parseOptions?: Partial<acorn.Options>`
  > Options for the Acorn parser. Defaults to { \
  >   `"ecmaVersion": "latest",` \
  >   `"sourceType": "module", // if options.returns == "exports"` \
  >   `"allowReturnOutsideFunction": true, // if options.returns == "return"` \
  > }

- `codegenOptions?: escodegen.GenerateOptions`
  > Options passed to Escodegen for code generation.
- `returns?: "exports" | "return"`
  > Defines return handling:
  > - "exports": Values can be exported anywhere in code (default).
  > - "return": Standard JavaScript return behavior.
- `operatorOverloading?: boolean`
  > Enables Python-like operator overloading via magic methods (default: true).
- `customVisitors?: Record<string, VisitorFn>`
  > Custom AST visitors for additional transformations.
- `importFunction?: (source: string) => Object | Promise<Object>`
  > Custom import handler for sync/async in-code imports.
- `isAsync?: boolean`
  > Wraps code in an async function, allowing top-level await (default: false). \
  > Note: If options.importFunction is defined as async, this will be set to true automatically.

## TODOs

- [ ] Allow compiled functions to be called with different `globals` several times without the need to re-compile
- [ ] Check for await keywords - they should affect the async behavior only if they are used on the root level, because if they are used internally in an async function defined in the code, they shouldn't change the compile function behavior.
